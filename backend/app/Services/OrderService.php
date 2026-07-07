<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\Dispute;
use App\Models\JobPost;
use App\Models\Order;
use App\Models\OrderMilestone;
use App\Models\PlatformSetting;
use App\Models\Proposal;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly WalletService $walletService,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Accept a proposal: creates the order contract and flips the job to contracted.
     */
    public function createFromProposal(Proposal $proposal): Order
    {
        return DB::transaction(function () use ($proposal) {
            $job = $proposal->jobPost;
            $commissionRate = (float) PlatformSetting::get('commission_rate', 0.10);
            $commission = round((float) $proposal->amount * $commissionRate, 2);

            $order = Order::query()->create([
                'number' => $this->nextOrderNumber(),
                'client_id' => $job->client_id,
                'freelancer_id' => $proposal->freelancer_id,
                'job_post_id' => $job->id,
                'proposal_id' => $proposal->id,
                'title' => $job->title,
                'requirements' => $proposal->cover_letter,
                'amount' => $proposal->amount,
                'currency' => $proposal->currency,
                'commission_rate' => $commissionRate,
                'commission_amount' => $commission,
                'freelancer_amount' => round((float) $proposal->amount - $commission, 2),
                'delivery_days' => $proposal->delivery_days,
                'deadline' => now()->addDays($proposal->delivery_days)->toDateString(),
                'status' => Order::STATUS_PENDING_PAYMENT,
            ]);

            foreach ($proposal->milestones as $index => $proposalMilestone) {
                $order->milestones()->create([
                    'title' => $proposalMilestone->title,
                    'amount' => $proposalMilestone->amount,
                    'sort_order' => $index,
                ]);
            }

            $proposal->update(['status' => Proposal::STATUS_ACCEPTED]);
            $proposal->jobPost->update(['status' => JobPost::STATUS_CONTRACTED]);

            $proposal->jobPost->proposals()
                ->where('id', '!=', $proposal->id)
                ->where('status', Proposal::STATUS_PENDING)
                ->update(['status' => Proposal::STATUS_DECLINED]);

            $order->recordEvent('created', $order->client, "Order created from proposal #{$proposal->id}");

            $this->notifications->notify(
                $proposal->freelancer,
                'order',
                'Proposal accepted 🎉',
                "Your proposal for \"{$job->title}\" was accepted. Order {$order->number} is awaiting payment.",
                ['order_id' => $order->id],
            );

            return $order;
        });
    }

    /**
     * Direct order of a published service (FIT-SRV-06).
     */
    public function createFromService(Service $service, ?ServicePackage $package, User $client, ?string $requirements): Order
    {
        return DB::transaction(function () use ($service, $package, $client, $requirements) {
            $amount = (float) ($package?->price ?? $service->price);
            $deliveryDays = $package?->delivery_days ?? $service->delivery_days;
            $revisions = $package?->revisions_included ?? $service->revisions_included;
            $commissionRate = (float) PlatformSetting::get('commission_rate', 0.10);
            $commission = round($amount * $commissionRate, 2);

            $order = Order::query()->create([
                'number' => $this->nextOrderNumber(),
                'client_id' => $client->id,
                'freelancer_id' => $service->user_id,
                'service_id' => $service->id,
                'service_package_id' => $package?->id,
                'title' => $service->title.($package ? " ({$package->name})" : ''),
                'requirements' => $requirements,
                'amount' => $amount,
                'currency' => $service->currency,
                'commission_rate' => $commissionRate,
                'commission_amount' => $commission,
                'freelancer_amount' => round($amount - $commission, 2),
                'delivery_days' => $deliveryDays,
                'deadline' => now()->addDays($deliveryDays)->toDateString(),
                'revisions_allowed' => $revisions,
                'status' => Order::STATUS_PENDING_PAYMENT,
            ]);

            $order->recordEvent('created', $client, "Service \"{$service->title}\" ordered");

            $this->notifications->notify(
                $service->freelancer,
                'order',
                'New service order',
                "{$client->name} ordered \"{$service->title}\". Order {$order->number} is awaiting payment.",
                ['order_id' => $order->id],
            );

            return $order;
        });
    }

    /**
     * Payment confirmed: activate the order and hold funds in escrow.
     */
    public function markPaid(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update([
                'status' => Order::STATUS_ACTIVE,
                'paid_at' => now(),
            ]);

            $this->walletService->holdInEscrow(
                $order->freelancer,
                (float) $order->amount,
                $order,
                "Escrow hold for order {$order->number}",
            );

            $order->recordEvent('paid', $order->client, 'Payment confirmed, funds held in escrow');

            $this->notifications->notify(
                $order->freelancer,
                'payment',
                'Order funded — you can start working',
                "Order {$order->number} has been paid. Funds are held in escrow by FIT.",
                ['order_id' => $order->id],
            );
        });
    }

    public function markMilestoneFunded(OrderMilestone $milestone): void
    {
        DB::transaction(function () use ($milestone) {
            $milestone->update(['status' => OrderMilestone::STATUS_FUNDED, 'funded_at' => now()]);

            $order = $milestone->order;

            if ($order->status === Order::STATUS_PENDING_PAYMENT) {
                $order->update(['status' => Order::STATUS_ACTIVE, 'paid_at' => now()]);
            }

            $this->walletService->holdInEscrow(
                $order->freelancer,
                (float) $milestone->amount,
                $milestone,
                "Escrow hold for milestone \"{$milestone->title}\" ({$order->number})",
            );

            $order->recordEvent('milestone_funded', $order->client, "Milestone \"{$milestone->title}\" funded");

            $this->notifications->notify(
                $order->freelancer,
                'payment',
                'Milestone funded',
                "Milestone \"{$milestone->title}\" on order {$order->number} is funded.",
                ['order_id' => $order->id, 'milestone_id' => $milestone->id],
            );
        });
    }

    public function submitDelivery(Order $order, array $data): Delivery
    {
        if (! in_array($order->status, [Order::STATUS_ACTIVE, Order::STATUS_REVISION_REQUESTED], true)) {
            throw ValidationException::withMessages([
                'order' => ['Deliveries can only be submitted on active orders.'],
            ]);
        }

        return DB::transaction(function () use ($order, $data) {
            $delivery = $order->deliveries()->create($data + ['status' => Delivery::STATUS_SUBMITTED]);

            $order->update(['status' => Order::STATUS_SUBMITTED, 'delivered_at' => now()]);

            if ($delivery->order_milestone_id !== null) {
                $delivery->milestone()->update(['status' => OrderMilestone::STATUS_IN_REVIEW]);
            }

            $order->recordEvent('delivered', $order->freelancer, 'Work delivered for review');

            $this->notifications->notify(
                $order->client,
                'order',
                'Work delivered',
                "{$order->freelancer->name} delivered work on order {$order->number}. Review and approve it.",
                ['order_id' => $order->id, 'delivery_id' => $delivery->id],
            );

            return $delivery;
        });
    }

    /**
     * Client approves the delivery: completes the order (or milestone) and releases escrow.
     */
    public function approveDelivery(Delivery $delivery): void
    {
        DB::transaction(function () use ($delivery) {
            $order = $delivery->order;
            $delivery->update(['status' => Delivery::STATUS_APPROVED, 'reviewed_at' => now()]);

            if ($delivery->order_milestone_id !== null) {
                $milestone = $delivery->milestone;
                $milestone->update(['status' => OrderMilestone::STATUS_APPROVED, 'approved_at' => now()]);

                $commission = round((float) $milestone->amount * (float) $order->commission_rate, 2);
                $this->walletService->releaseEscrow(
                    $order->freelancer,
                    (float) $milestone->amount,
                    $commission,
                    $milestone,
                    "Milestone \"{$milestone->title}\" approved ({$order->number})",
                );

                $order->recordEvent('milestone_approved', $order->client, "Milestone \"{$milestone->title}\" approved and released");

                $allApproved = ! $order->milestones()->where('status', '!=', OrderMilestone::STATUS_APPROVED)->exists();

                if ($allApproved) {
                    $this->completeOrder($order, releaseFunds: false);
                } else {
                    $order->update(['status' => Order::STATUS_ACTIVE]);
                }
            } else {
                $this->completeOrder($order, releaseFunds: true);
            }

            $this->notifications->notify(
                $order->freelancer,
                'payment',
                'Delivery approved — payment released',
                "Your delivery on order {$order->number} was approved.",
                ['order_id' => $order->id],
            );
        });
    }

    public function requestRevision(Delivery $delivery, string $feedback): void
    {
        $order = $delivery->order;

        if ($order->revisions_used >= $order->revisions_allowed) {
            throw ValidationException::withMessages([
                'order' => ['All included revisions have been used. Approve the delivery or open a dispute.'],
            ]);
        }

        DB::transaction(function () use ($delivery, $order, $feedback) {
            $delivery->update([
                'status' => Delivery::STATUS_REVISION_REQUESTED,
                'client_feedback' => $feedback,
                'reviewed_at' => now(),
            ]);

            $order->increment('revisions_used');
            $order->update(['status' => Order::STATUS_REVISION_REQUESTED]);

            if ($delivery->order_milestone_id !== null) {
                $delivery->milestone()->update(['status' => OrderMilestone::STATUS_FUNDED]);
            }

            $order->recordEvent('revision_requested', $order->client, $feedback);

            $this->notifications->notify(
                $order->freelancer,
                'order',
                'Revision requested',
                "The client requested changes on order {$order->number}.",
                ['order_id' => $order->id, 'delivery_id' => $delivery->id],
            );
        });
    }

    public function cancel(Order $order, User $actor, ?string $reason): void
    {
        if (! in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_ACTIVE], true)) {
            throw ValidationException::withMessages([
                'order' => ['Only pending or active orders can be cancelled.'],
            ]);
        }

        DB::transaction(function () use ($order, $actor, $reason) {
            $escrowed = $this->escrowedAmount($order);

            if ($escrowed > 0) {
                $this->walletService->refundEscrow(
                    $order->freelancer,
                    $escrowed,
                    $order,
                    "Order {$order->number} cancelled — escrow refunded to client",
                );

                $order->payments()
                    ->where('status', 'successful')
                    ->update(['status' => 'refunded']);
            }

            $order->update(['status' => Order::STATUS_CANCELLED, 'cancelled_at' => now()]);
            $order->recordEvent('cancelled', $actor, $reason);

            $counterpart = $actor->id === $order->client_id ? $order->freelancer : $order->client;
            $this->notifications->notify(
                $counterpart,
                'order',
                'Order cancelled',
                "Order {$order->number} was cancelled.".($reason ? " Reason: {$reason}" : ''),
                ['order_id' => $order->id],
            );
        });
    }

    public function resolveDispute(Dispute $dispute, User $admin, string $resolution, ?float $refundAmount, ?float $releaseAmount, ?string $note): void
    {
        DB::transaction(function () use ($dispute, $admin, $resolution, $refundAmount, $releaseAmount, $note) {
            $order = $dispute->order;
            $escrowed = $this->escrowedAmount($order);

            match ($resolution) {
                Dispute::RESOLUTION_REFUND_CLIENT => $this->settleDispute($order, $dispute, refund: $escrowed, release: 0),
                Dispute::RESOLUTION_RELEASE_FREELANCER => $this->settleDispute($order, $dispute, refund: 0, release: $escrowed),
                Dispute::RESOLUTION_PARTIAL_SPLIT => $this->settleDispute($order, $dispute, refund: (float) $refundAmount, release: (float) $releaseAmount),
                Dispute::RESOLUTION_CANCEL_ORDER => $this->settleDispute($order, $dispute, refund: $escrowed, release: 0, cancel: true),
                default => throw ValidationException::withMessages(['resolution' => ['Unknown resolution.']]),
            };

            $dispute->update([
                'status' => Dispute::STATUS_RESOLVED,
                'resolution' => $resolution,
                'refund_amount' => $refundAmount,
                'release_amount' => $releaseAmount,
                'resolution_note' => $note,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            $order->recordEvent('dispute_resolved', $admin, $note, ['resolution' => $resolution]);

            foreach ([$order->client, $order->freelancer] as $party) {
                $this->notifications->notify(
                    $party,
                    'dispute',
                    'Dispute resolved',
                    "The dispute on order {$order->number} was resolved: ".str_replace('_', ' ', $resolution),
                    ['order_id' => $order->id, 'dispute_id' => $dispute->id],
                );
            }
        });
    }

    private function settleDispute(Order $order, Dispute $dispute, float $refund, float $release, bool $cancel = false): void
    {
        if ($release > 0) {
            $commission = round($release * (float) $order->commission_rate, 2);
            $this->walletService->releaseEscrow($order->freelancer, $release, $commission, $dispute, "Dispute settlement on order {$order->number}");
        }

        if ($refund > 0) {
            $this->walletService->refundEscrow($order->freelancer, $refund, $dispute, "Dispute refund to client on order {$order->number}");
        }

        $order->update(
            $cancel || $release <= 0
                ? ['status' => Order::STATUS_CANCELLED, 'cancelled_at' => now()]
                : ['status' => Order::STATUS_COMPLETED, 'completed_at' => now()],
        );
    }

    private function completeOrder(Order $order, bool $releaseFunds): void
    {
        if ($releaseFunds) {
            $this->walletService->releaseEscrow(
                $order->freelancer,
                (float) $order->amount,
                (float) $order->commission_amount,
                $order,
                "Order {$order->number} completed",
            );
        }

        $order->update(['status' => Order::STATUS_COMPLETED, 'completed_at' => now()]);
        $order->recordEvent('completed', $order->client, 'Order approved and completed');

        $profile = $order->freelancer->freelancerProfile;
        $profile?->increment('completed_orders_count');
        $profile?->increment('total_earned', (float) $order->freelancer_amount);

        $order->client->clientProfile?->increment('total_spent', (float) $order->amount);
        $order->client->clientProfile?->increment('hires_count');

        if ($order->service_id !== null) {
            $order->service()->increment('orders_count');
        }
    }

    /**
     * Amount currently held in escrow for this order (paid but not yet released/refunded).
     */
    private function escrowedAmount(Order $order): float
    {
        if ($order->hasMilestones()) {
            return (float) $order->milestones()
                ->whereIn('status', [OrderMilestone::STATUS_FUNDED, OrderMilestone::STATUS_IN_REVIEW])
                ->sum('amount');
        }

        return $order->paid_at !== null && $order->completed_at === null ? (float) $order->amount : 0.0;
    }

    private function nextOrderNumber(): string
    {
        $year = now()->year;
        $sequence = Order::query()->whereYear('created_at', $year)->count() + 1;

        return sprintf('FIT-ORD-%d-%06d', $year, $sequence);
    }
}
