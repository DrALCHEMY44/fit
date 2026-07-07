<?php

namespace App\Services;

use App\Models\ConnectPack;
use App\Models\ConnectTransaction;
use App\Models\Order;
use App\Models\OrderMilestone;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Handles payment intents and confirmations.
 *
 * Providers (MTN MoMo / Orange Money) are integrated behind a sandbox flow:
 * `initiate*` creates a pending payment with a unique reference, and the
 * provider webhook (or the sandbox confirm endpoint) settles it.
 */
class PaymentService
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly ConnectService $connectService,
        private readonly NotificationService $notifications,
    ) {}

    public function initiateOrderPayment(Order $order, User $payer, string $provider, ?string $phoneNumber): Payment
    {
        if ($order->status !== Order::STATUS_PENDING_PAYMENT) {
            throw ValidationException::withMessages([
                'order' => ['This order is not awaiting payment.'],
            ]);
        }

        return $this->createPayment($payer, [
            'order_id' => $order->id,
            'purpose' => Payment::PURPOSE_ORDER,
            'amount' => $order->amount,
            'currency' => $order->currency,
            'provider' => $provider,
            'phone_number' => $phoneNumber,
        ]);
    }

    public function initiateMilestonePayment(OrderMilestone $milestone, User $payer, string $provider, ?string $phoneNumber): Payment
    {
        if ($milestone->status !== OrderMilestone::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'milestone' => ['This milestone is already funded.'],
            ]);
        }

        return $this->createPayment($payer, [
            'order_id' => $milestone->order_id,
            'order_milestone_id' => $milestone->id,
            'purpose' => Payment::PURPOSE_MILESTONE,
            'amount' => $milestone->amount,
            'currency' => $milestone->order->currency,
            'provider' => $provider,
            'phone_number' => $phoneNumber,
        ]);
    }

    public function initiateConnectsPurchase(ConnectPack $pack, User $payer, string $provider, ?string $phoneNumber, string $currency): Payment
    {
        return $this->createPayment($payer, [
            'purpose' => Payment::PURPOSE_CONNECTS,
            'amount' => $currency === 'USD' ? $pack->price_usd : $pack->price_xaf,
            'currency' => $currency,
            'provider' => $provider,
            'phone_number' => $phoneNumber,
            'meta' => ['connect_pack_id' => $pack->id, 'connects' => $pack->connects],
        ]);
    }

    /**
     * Settle a pending payment (called by the provider webhook or sandbox confirm).
     */
    public function confirm(Payment $payment, ?string $providerRef = null): Payment
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'payment' => ['This payment has already been processed.'],
            ]);
        }

        return DB::transaction(function () use ($payment, $providerRef) {
            $payment->update([
                'status' => Payment::STATUS_SUCCESSFUL,
                'provider_ref' => $providerRef ?? 'SBX-'.strtoupper(Str::random(12)),
                'paid_at' => now(),
            ]);

            match ($payment->purpose) {
                Payment::PURPOSE_ORDER => $this->orderService->markPaid($payment->order),
                Payment::PURPOSE_MILESTONE => $this->orderService->markMilestoneFunded($payment->milestone),
                Payment::PURPOSE_CONNECTS => $this->settleConnectsPurchase($payment),
                default => null,
            };

            return $payment->refresh();
        });
    }

    public function fail(Payment $payment, ?string $reason = null): Payment
    {
        if ($payment->status !== Payment::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'payment' => ['This payment has already been processed.'],
            ]);
        }

        $payment->update([
            'status' => Payment::STATUS_FAILED,
            'meta' => array_merge($payment->meta ?? [], ['failure_reason' => $reason]),
        ]);

        return $payment;
    }

    private function settleConnectsPurchase(Payment $payment): void
    {
        $connects = (int) ($payment->meta['connects'] ?? 0);

        $this->connectService->credit(
            $payment->payer,
            $connects,
            ConnectTransaction::TYPE_PURCHASE,
            $payment,
            "Purchased {$connects} connects",
        );

        $this->notifications->notify(
            $payment->payer,
            'payment',
            'Connects added',
            "{$connects} connects were added to your balance.",
            ['payment_id' => $payment->id],
        );
    }

    private function createPayment(User $payer, array $attributes): Payment
    {
        return Payment::query()->create($attributes + [
            'reference' => 'FIT-PAY-'.strtoupper(Str::random(12)),
            'payer_id' => $payer->id,
            'status' => Payment::STATUS_PENDING,
        ]);
    }
}
