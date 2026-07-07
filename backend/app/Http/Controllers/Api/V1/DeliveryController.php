<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Http\Resources\OrderResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Services\OrderService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

#[Group('Deliveries')]
class DeliveryController extends Controller
{
    /**
     * Submit a delivery
     *
     * The freelancer delivers work on an active order with files, a link
     * and/or a message (FIT-DEL-01). Moves the order to `submitted` (and the
     * milestone to `in_review` when `milestone_id` is provided).
     */
    public function store(Request $request, Order $order, OrderService $orderService): JsonResponse
    {
        abort_unless($order->freelancer_id === $request->user()->id, 403, 'Only the freelancer on this order can deliver.');

        $data = $request->validate([
            'message' => ['nullable', 'string', 'max:5000'],
            'link_url' => ['nullable', 'url', 'max:255'],
            'milestone_id' => ['nullable', 'integer', 'exists:order_milestones,id'],
            'files' => ['nullable', 'array', 'max:10'],
            'files.*' => ['file', 'max:20480'],
        ]);

        if (isset($data['milestone_id'])) {
            abort_unless(
                $order->milestones()->whereKey($data['milestone_id'])->exists(),
                422,
                'This milestone does not belong to the order.',
            );
        }

        $files = collect($request->file('files') ?? [])->map(fn ($file) => [
            'path' => $file->store('deliveries', 'public'),
            'name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size_kb' => (int) round($file->getSize() / 1024),
        ])->all();

        $delivery = $orderService->submitDelivery($order, [
            'message' => $data['message'] ?? null,
            'link_url' => $data['link_url'] ?? null,
            'order_milestone_id' => $data['milestone_id'] ?? null,
            'files' => $files ?: null,
        ]);

        return new DeliveryResource($delivery)->response()->setStatusCode(201);
    }

    /**
     * Approve a delivery
     *
     * The client validates the work (FIT-DEL-02). Completes the order (or the
     * milestone), releases the escrowed payment to the freelancer's wallet net
     * of the FIT commission, and unlocks reviews.
     */
    public function approve(Request $request, Delivery $delivery, OrderService $orderService): OrderResource
    {
        abort_unless($delivery->order->client_id === $request->user()->id, 403, 'Only the client on this order can approve.');
        abort_unless($delivery->status === Delivery::STATUS_SUBMITTED, 422, 'This delivery was already reviewed.');

        $orderService->approveDelivery($delivery);

        return new OrderResource($delivery->order->fresh(['milestones', 'deliveries']));
    }

    /**
     * Request a revision
     *
     * The client asks for changes with feedback (FIT-DEL-02/03). Fails once
     * the order's included revisions are exhausted.
     */
    public function requestRevision(Request $request, Delivery $delivery, OrderService $orderService): OrderResource
    {
        abort_unless($delivery->order->client_id === $request->user()->id, 403, 'Only the client on this order can request revisions.');
        abort_unless($delivery->status === Delivery::STATUS_SUBMITTED, 422, 'This delivery was already reviewed.');

        $data = $request->validate([
            /** What needs to change? Shared with the freelancer. */
            'feedback' => ['required', 'string', 'max:5000'],
        ]);

        $orderService->requestRevision($delivery, $data['feedback']);

        return new OrderResource($delivery->order->fresh(['milestones', 'deliveries']));
    }
}
