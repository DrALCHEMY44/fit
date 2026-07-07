<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderEventResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Orders & Contracts')]
class OrderController extends Controller
{
    /**
     * My orders
     *
     * Orders where the authenticated user is the client or the freelancer.
     * Filter by `role` (`client`/`freelancer`) and `status`.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'role' => ['nullable', Rule::in(['client', 'freelancer'])],
            'status' => ['nullable', Rule::in([
                'pending_payment', 'active', 'submitted', 'revision_requested',
                'completed', 'cancelled', 'disputed',
            ])],
        ]);

        $user = $request->user();

        $orders = Order::query()
            ->when(($filters['role'] ?? null) === 'client', fn ($query) => $query->where('client_id', $user->id))
            ->when(($filters['role'] ?? null) === 'freelancer', fn ($query) => $query->where('freelancer_id', $user->id))
            ->when(! isset($filters['role']), fn ($query) => $query->where(
                fn ($q) => $q->where('client_id', $user->id)->orWhere('freelancer_id', $user->id),
            ))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->with(['client', 'freelancer', 'milestones'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    /**
     * Order details
     *
     * Full contract view with milestones, deliveries and any dispute
     * (FIT-ORD-02). Only participants can view it.
     */
    public function show(Request $request, Order $order): OrderResource
    {
        $this->authorizeParticipant($request, $order);

        return new OrderResource(
            $order->load(['client.clientProfile', 'freelancer.freelancerProfile', 'milestones', 'deliveries', 'dispute']),
        );
    }

    /**
     * Order timeline
     *
     * Timestamped history of everything that happened on the order (FIT-ORD-06).
     */
    public function events(Request $request, Order $order): AnonymousResourceCollection
    {
        $this->authorizeParticipant($request, $order);

        return OrderEventResource::collection(
            $order->events()->with('actor')->paginate(30),
        );
    }

    /**
     * Cancel an order
     *
     * Either participant can cancel while the order is `pending_payment` or
     * `active`. Escrowed funds are returned to the client and the payment is
     * marked refunded.
     */
    public function cancel(Request $request, Order $order, OrderService $orderService): OrderResource
    {
        $this->authorizeParticipant($request, $order);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $orderService->cancel($order, $request->user(), $data['reason'] ?? null);

        return new OrderResource($order->fresh(['milestones']));
    }

    private function authorizeParticipant(Request $request, Order $order): void
    {
        abort_unless($order->isParticipant($request->user()), 403, 'You are not a participant of this order.');
    }
}
