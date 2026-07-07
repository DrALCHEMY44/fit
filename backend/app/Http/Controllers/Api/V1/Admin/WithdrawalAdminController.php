<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use App\Services\WalletService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Withdrawals')]
class WithdrawalAdminController extends Controller
{
    /**
     * List withdrawal requests
     *
     * Payout queue with the spec's statuses: pending, approved, paid,
     * rejected, failed (FIT-ADM-05).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'paid', 'rejected', 'failed'])],
        ]);

        return WithdrawalResource::collection(
            Withdrawal::query()
                ->with('user')
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Approve a withdrawal
     *
     * Marks the request approved for payout processing.
     */
    public function approve(Request $request, Withdrawal $withdrawal, AuditLogger $audit): WithdrawalResource
    {
        abort_unless($withdrawal->status === Withdrawal::STATUS_PENDING, 422, 'Only pending withdrawals can be approved.');

        $withdrawal->update([
            'status' => Withdrawal::STATUS_APPROVED,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $audit->log($request->user(), 'withdrawal.approve', $withdrawal);

        return new WithdrawalResource($withdrawal->fresh('user'));
    }

    /**
     * Mark a withdrawal paid
     *
     * Confirms the Mobile Money transfer went out; updates the freelancer's
     * total withdrawn.
     */
    public function markPaid(Request $request, Withdrawal $withdrawal, WalletService $walletService, AuditLogger $audit, NotificationService $notifications): WithdrawalResource
    {
        abort_unless($withdrawal->status === Withdrawal::STATUS_APPROVED, 422, 'Approve the withdrawal first.');

        $withdrawal->update([
            'status' => Withdrawal::STATUS_PAID,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $walletService->markWithdrawalPaid($withdrawal);

        $audit->log($request->user(), 'withdrawal.mark_paid', $withdrawal);

        $notifications->notify(
            $withdrawal->user,
            'payment',
            'Withdrawal paid',
            "Your withdrawal {$withdrawal->reference} of {$withdrawal->amount} {$withdrawal->currency} was sent to {$withdrawal->account_number}.",
        );

        return new WithdrawalResource($withdrawal->fresh('user'));
    }

    /**
     * Reject a withdrawal
     *
     * Returns the reserved amount to the freelancer's available balance.
     */
    public function reject(Request $request, Withdrawal $withdrawal, WalletService $walletService, AuditLogger $audit, NotificationService $notifications): WithdrawalResource
    {
        abort_unless(
            in_array($withdrawal->status, [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_APPROVED], true),
            422,
            'This withdrawal was already finalized.',
        );

        $data = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        $withdrawal->update([
            'status' => Withdrawal::STATUS_REJECTED,
            'admin_note' => $data['reason'],
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $walletService->cancelWithdrawal($withdrawal, 'Withdrawal rejected: '.$data['reason']);

        $audit->log($request->user(), 'withdrawal.reject', $withdrawal, ['reason' => $data['reason']]);

        $notifications->notify(
            $withdrawal->user,
            'payment',
            'Withdrawal rejected',
            "Your withdrawal {$withdrawal->reference} was rejected: {$data['reason']}. The amount is back in your available balance.",
        );

        return new WithdrawalResource($withdrawal->fresh('user'));
    }
}
