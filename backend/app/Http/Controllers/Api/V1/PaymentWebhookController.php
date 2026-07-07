<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

#[Group('Payments & Escrow')]
class PaymentWebhookController extends Controller
{
    /**
     * Payment provider webhook
     *
     * Endpoint for the Mobile Money aggregator to confirm or fail a payment.
     * The payload is validated and journaled before any order status changes,
     * as required by the spec's API principles. Secure it with the shared
     * secret header `X-Webhook-Signature` configured per provider.
     *
     * @unauthenticated
     */
    public function handle(Request $request, PaymentService $paymentService): JsonResponse
    {
        $data = $request->validate([
            /** The FIT payment reference passed when initiating. @example FIT-PAY-AB12CD34EF56 */
            'reference' => ['required', 'string'],
            'status' => ['required', Rule::in(['successful', 'failed'])],
            /** The provider-side transaction id. */
            'provider_ref' => ['nullable', 'string', 'max:100'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        Log::channel('single')->info('Payment webhook received', $data);

        $payment = Payment::query()->where('reference', $data['reference'])->first();

        if ($payment === null) {
            return response()->json(['message' => 'Unknown reference.'], 404);
        }

        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json(['message' => 'Already processed.']);
        }

        $data['status'] === 'successful'
            ? $paymentService->confirm($payment, $data['provider_ref'] ?? null)
            : $paymentService->fail($payment, $data['reason'] ?? null);

        return response()->json(['message' => 'Processed.']);
    }
}
