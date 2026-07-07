<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function walletFor(User $user): Wallet
    {
        return Wallet::query()->firstOrCreate(['user_id' => $user->id]);
    }

    /**
     * Hold the paid amount in the freelancer's pending balance (escrow).
     */
    public function holdInEscrow(User $freelancer, float $amount, Model $source, string $description): WalletTransaction
    {
        $wallet = $this->walletFor($freelancer);
        $wallet->increment('pending_balance', $amount);

        return $this->record($freelancer, WalletTransaction::TYPE_ESCROW_HOLD, 'pending', $amount, $source, $description);
    }

    /**
     * Release escrowed funds to the freelancer's available balance, net of commission.
     */
    public function releaseEscrow(User $freelancer, float $grossAmount, float $commission, Model $source, string $description): void
    {
        $net = round($grossAmount - $commission, 2);
        $wallet = $this->walletFor($freelancer);

        $wallet->decrement('pending_balance', $grossAmount);
        $wallet->increment('available_balance', $net);
        $wallet->increment('total_earned', $net);

        $this->record($freelancer, WalletTransaction::TYPE_ESCROW_RELEASE, 'available', $net, $source, $description);

        if ($commission > 0) {
            $this->record($freelancer, WalletTransaction::TYPE_COMMISSION_FEE, 'pending', -$commission, $source, 'FIT platform commission');
        }
    }

    /**
     * Remove escrowed funds from the freelancer's pending balance (refund to client).
     */
    public function refundEscrow(User $freelancer, float $amount, Model $source, string $description): void
    {
        $wallet = $this->walletFor($freelancer);
        $wallet->decrement('pending_balance', $amount);

        $this->record($freelancer, WalletTransaction::TYPE_REFUND, 'pending', -$amount, $source, $description);
    }

    public function requestWithdrawal(User $user, float $amount, string $method, string $accountNumber, ?string $accountName): Withdrawal
    {
        $wallet = $this->walletFor($user);

        if ((float) $wallet->available_balance < $amount) {
            throw ValidationException::withMessages([
                'amount' => ['Insufficient available balance.'],
            ]);
        }

        $wallet->decrement('available_balance', $amount);

        $withdrawal = Withdrawal::query()->create([
            'reference' => 'FIT-WDR-'.strtoupper(Str::random(10)),
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => $wallet->currency,
            'method' => $method,
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'status' => Withdrawal::STATUS_PENDING,
        ]);

        $this->record($user, WalletTransaction::TYPE_WITHDRAWAL, 'available', -$amount, $withdrawal, "Withdrawal request {$withdrawal->reference}");

        return $withdrawal;
    }

    public function cancelWithdrawal(Withdrawal $withdrawal, string $reason): void
    {
        $wallet = $this->walletFor($withdrawal->user);
        $wallet->increment('available_balance', (float) $withdrawal->amount);

        $this->record($withdrawal->user, WalletTransaction::TYPE_ADJUSTMENT, 'available', (float) $withdrawal->amount, $withdrawal, $reason);
    }

    public function markWithdrawalPaid(Withdrawal $withdrawal): void
    {
        $this->walletFor($withdrawal->user)->increment('total_withdrawn', (float) $withdrawal->amount);
    }

    private function record(User $user, string $type, string $bucket, float $amount, Model $source, string $description): WalletTransaction
    {
        return WalletTransaction::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'bucket' => $bucket,
            'amount' => $amount,
            'currency' => 'XAF',
            'reference' => 'FIT-TXN-'.strtoupper(Str::random(10)),
            'source_type' => $source->getMorphClass(),
            'source_id' => $source->getKey(),
            'description' => $description,
        ]);
    }
}
