<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\OrderMilestone;
use App\Models\Payment;
use App\Services\PaymentService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Payments & Escrow')]
class PaymentController extends Controller
{
    /**
     * Pay an order
     *
     * The client funds the full order via Mobile Money or card (FIT-PAY-01/02).
     * Creates a `pending` payment intent; the money is confirmed by the
     * provider webhook, or by `POST /payments/{reference}/confirm-sandbox`
     * while integrating. Once confirmed, the order becomes `active` and the
     * amount is held in escrow.
     */
    public function payOrder(Request $request, Order $order, PaymentService $paymentService): JsonResponse
    {
        abort_unless($order->client_id === $request->user()->id, 403, 'Only the client can pay this order.');

        $data = $request->validate([
            'provider' => ['required', Rule::in(['mtn_momo', 'orange_money', 'card', 'paypal'])],
            /** Mobile Money number to debit (required for momo providers). @example 237677001122 */
            'phone_number' => ['nullable', 'required_if:provider,mtn_momo,orange_money', 'string', 'max:30'],
        ]);

        $payment = $paymentService->initiateOrderPayment($order, $request->user(), $data['provider'], $data['phone_number'] ?? null);

        return response()->json([
            'payment' => new PaymentResource($payment),
            'instructions' => 'Confirm the debit on your phone. The order activates automatically once the provider confirms.',
        ], 201);
    }

    /**
     * Fund a milestone
     *
     * Funds a single milestone instead of the whole order (FIT-ORD-04,
     * FIT-PAY-03). Same confirmation flow as order payments.
     */
    public function payMilestone(Request $request, OrderMilestone $milestone, PaymentService $paymentService): JsonResponse
    {
        abort_unless($milestone->order->client_id === $request->user()->id, 403, 'Only the client can fund this milestone.');

        $data = $request->validate([
            'provider' => ['required', Rule::in(['mtn_momo', 'orange_money', 'card', 'paypal'])],
            'phone_number' => ['nullable', 'required_if:provider,mtn_momo,orange_money', 'string', 'max:30'],
        ]);

        $payment = $paymentService->initiateMilestonePayment($milestone, $request->user(), $data['provider'], $data['phone_number'] ?? null);

        return new PaymentResource($payment)->response()->setStatusCode(201);
    }

    /**
     * My payments
     *
     * Payment history of the authenticated user (receipts — FIT-PAY-07).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return PaymentResource::collection(
            Payment::query()
                ->where('payer_id', $request->user()->id)
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Payment status
     *
     * Poll a payment by its FIT reference to know when the provider confirmed it.
     */
    public function show(Request $request, string $reference): PaymentResource
    {
        $payment = Payment::query()->where('reference', $reference)->firstOrFail();

        abort_unless(
            $payment->payer_id === $request->user()->id || $request->user()->isAdmin(),
            403,
            'This payment is not yours.',
        );

        return new PaymentResource($payment);
    }

    /**
     * Confirm payment (sandbox)
     *
     * Development/sandbox helper that simulates the Mobile Money provider
     * confirming the transaction. Settles the payment exactly like the real
     * webhook: activates the order / funds the milestone / credits connects.
     * Disable or protect this route in production.
     */
    public function confirmSandbox(Request $request, string $reference, PaymentService $paymentService): PaymentResource
    {
        $payment = Payment::query()->where('reference', $reference)->firstOrFail();

        abort_unless(
            $payment->payer_id === $request->user()->id || $request->user()->isAdmin(),
            403,
            'This payment is not yours.',
        );

        return new PaymentResource($paymentService->confirm($payment));
    }
}
