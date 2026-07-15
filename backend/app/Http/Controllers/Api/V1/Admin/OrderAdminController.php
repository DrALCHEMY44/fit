<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Orders & Payments')]
class OrderAdminController extends Controller
{
    /**
     * List all orders
     *
     * Full order supervision (FIT-ADM-04) with status filter and search by
     * order number.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in([
                'pending_payment', 'active', 'submitted', 'revision_requested',
                'completed', 'cancelled', 'disputed',
            ])],
            'search' => ['nullable', 'string', 'max:50'],
        ]);

        return OrderResource::collection(
            Order::query()
                ->with(['client', 'freelancer', 'milestones'])
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('number', 'like', "%{$search}%"))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Order details (admin)
     */
    public function show(Order $order): OrderResource
    {
        return new OrderResource(
            $order->load(['client', 'freelancer', 'milestones', 'deliveries', 'payments', 'dispute', 'events.actor']),
        );
    }

    /**
     * Force order status
     *
     * Manual intervention with mandatory note; recorded in the order timeline
     * and the audit log (admin dashboard "Commandes" module). Use dispute
     * resolution for money movements — this only overrides the status flag.
     */
    public function updateStatus(Request $request, Order $order, AuditLogger $audit): OrderResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([
                'pending_payment', 'active', 'submitted', 'revision_requested',
                'completed', 'cancelled', 'disputed',
            ])],
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $order->update(['status' => $data['status']]);
        $order->recordEvent('admin_status_override', $request->user(), $data['note'], ['status' => $data['status']]);

        $audit->log($request->user(), 'order.status_override', $order, $data);

        return new OrderResource($order->fresh(['milestones']));
    }

    /**
     * List all payments
     *
     * The platform financial journal (FIT-PAY-08): every payment with status
     * and provider, filterable.
     */
    public function payments(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'successful', 'failed', 'refunded'])],
            'provider' => ['nullable', Rule::in(['mtn_momo', 'orange_money', 'card', 'paypal', 'sandbox'])],
            'purpose' => ['nullable', Rule::in(['order', 'milestone', 'connects', 'subscription'])],
        ]);

        return PaymentResource::collection(
            Payment::query()
                ->with(['payer', 'order.freelancer'])
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($filters['provider'] ?? null, fn ($query, $provider) => $query->where('provider', $provider))
                ->when($filters['purpose'] ?? null, fn ($query, $purpose) => $query->where('purpose', $purpose))
                ->latest()
                ->paginate(20),
        );
    }
}
