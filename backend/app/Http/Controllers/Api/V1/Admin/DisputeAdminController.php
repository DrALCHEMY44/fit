<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Dispute;
use App\Models\Message;
use App\Services\AuditLogger;
use App\Services\OrderService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Disputes')]
class DisputeAdminController extends Controller
{
    /**
     * Dispute queue
     *
     * All disputes, filterable by status (FIT-ADM-06).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['open', 'under_review', 'resolved', 'cancelled'])],
        ]);

        return DisputeResource::collection(
            Dispute::query()
                ->with(['order.client', 'order.freelancer', 'opener'])
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->oldest()
                ->paginate(20),
        );
    }

    /**
     * Dispute details with evidence
     */
    public function show(Dispute $dispute): DisputeResource
    {
        return new DisputeResource(
            $dispute->load(['order.milestones', 'order.deliveries', 'order.payments', 'opener', 'resolver']),
        );
    }

    /**
     * Read the order conversation
     *
     * Admin access to the participants' chat, allowed only in dispute context
     * (FIT-CHAT-05). Returns the messages of every conversation linked to the
     * disputed order or its job.
     */
    public function conversation(Dispute $dispute): AnonymousResourceCollection
    {
        $order = $dispute->order;

        $conversations = Conversation::query()
            ->where(function ($query) use ($order) {
                $query->where('order_id', $order->id)
                    ->orWhere(function ($q) use ($order) {
                        $q->where('client_id', $order->client_id)->where('freelancer_id', $order->freelancer_id);
                    });
            })
            ->pluck('id');

        return MessageResource::collection(
            Message::query()
                ->whereIn('conversation_id', $conversations)
                ->with('sender')
                ->oldest()
                ->paginate(50),
        );
    }

    /**
     * Take a dispute under review
     */
    public function underReview(Request $request, Dispute $dispute, AuditLogger $audit): DisputeResource
    {
        abort_unless($dispute->status === Dispute::STATUS_OPEN, 422, 'Only open disputes can be taken under review.');

        $dispute->update(['status' => Dispute::STATUS_UNDER_REVIEW]);
        $audit->log($request->user(), 'dispute.under_review', $dispute);

        return new DisputeResource($dispute->fresh());
    }

    /**
     * Resolve a dispute
     *
     * Applies the admin decision (FIT-DIS-04): refund the client, release to
     * the freelancer, split the escrow, or cancel the order. Escrow moves
     * accordingly and both parties are notified. `refund_amount` and
     * `release_amount` are required for `partial_split`.
     */
    public function resolve(Request $request, Dispute $dispute, OrderService $orderService, AuditLogger $audit): JsonResponse
    {
        abort_unless(
            in_array($dispute->status, [Dispute::STATUS_OPEN, Dispute::STATUS_UNDER_REVIEW], true),
            422,
            'This dispute was already resolved.',
        );

        $data = $request->validate([
            'resolution' => ['required', Rule::in(['refund_client', 'release_freelancer', 'partial_split', 'cancel_order'])],
            'refund_amount' => ['nullable', 'required_if:resolution,partial_split', 'numeric', 'min:0'],
            'release_amount' => ['nullable', 'required_if:resolution,partial_split', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $orderService->resolveDispute(
            $dispute,
            $request->user(),
            $data['resolution'],
            isset($data['refund_amount']) ? (float) $data['refund_amount'] : null,
            isset($data['release_amount']) ? (float) $data['release_amount'] : null,
            $data['note'] ?? null,
        );

        $audit->log($request->user(), 'dispute.resolve', $dispute, ['resolution' => $data['resolution']]);

        return new DisputeResource($dispute->fresh(['order', 'resolver']))->response();
    }
}
