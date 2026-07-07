<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use App\Models\Order;
use App\Services\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Disputes')]
class DisputeController extends Controller
{
    /**
     * Open a dispute
     *
     * Either participant opens a dispute on an active, submitted or
     * revision-stage order (FIT-DIS-01/02). The order flips to `disputed`,
     * which freezes automatic escrow release until an admin decides
     * (financial rule 6). Evidence files can be attached.
     */
    public function store(Request $request, Order $order, NotificationService $notifications): JsonResponse
    {
        abort_unless($order->isParticipant($request->user()), 403, 'You are not a participant of this order.');
        abort_unless(
            in_array($order->status, [Order::STATUS_ACTIVE, Order::STATUS_SUBMITTED, Order::STATUS_REVISION_REQUESTED], true),
            422,
            'Disputes can only be opened on in-progress orders.',
        );
        abort_if(
            $order->dispute()->whereIn('status', [Dispute::STATUS_OPEN, Dispute::STATUS_UNDER_REVIEW])->exists(),
            422,
            'A dispute is already open on this order.',
        );

        $data = $request->validate([
            'reason' => ['required', Rule::in(['late_delivery', 'poor_quality', 'non_payment', 'behavior', 'fraud', 'other'])],
            'description' => ['required', 'string', 'max:5000'],
            'evidence' => ['nullable', 'array', 'max:10'],
            'evidence.*' => ['file', 'max:10240'],
        ]);

        $evidence = collect($request->file('evidence') ?? [])->map(fn ($file) => [
            'path' => $file->store('disputes', 'public'),
            'name' => $file->getClientOriginalName(),
        ])->all();

        $dispute = Dispute::query()->create([
            'order_id' => $order->id,
            'opened_by' => $request->user()->id,
            'reason' => $data['reason'],
            'description' => $data['description'],
            'evidence' => $evidence ?: null,
            'status' => Dispute::STATUS_OPEN,
        ]);

        $order->update(['status' => Order::STATUS_DISPUTED]);
        $order->recordEvent('disputed', $request->user(), $data['reason']);

        $counterpart = $request->user()->id === $order->client_id ? $order->freelancer : $order->client;
        $notifications->notify(
            $counterpart,
            'dispute',
            'Dispute opened',
            "A dispute was opened on order {$order->number}. FIT support will review the case.",
            ['order_id' => $order->id, 'dispute_id' => $dispute->id],
        );

        return new DisputeResource($dispute->load('opener'))->response()->setStatusCode(201);
    }

    /**
     * My disputes
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        return DisputeResource::collection(
            Dispute::query()
                ->whereHas('order', fn ($query) => $query->where('client_id', $user->id)->orWhere('freelancer_id', $user->id))
                ->with(['order', 'opener'])
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * Dispute details
     */
    public function show(Request $request, Dispute $dispute): DisputeResource
    {
        abort_unless($dispute->order->isParticipant($request->user()), 403, 'You are not a participant of this dispute.');

        return new DisputeResource($dispute->load(['order.milestones', 'opener', 'resolver']));
    }
}
