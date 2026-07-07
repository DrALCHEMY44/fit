<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConnectPackResource;
use App\Http\Resources\ConnectTransactionResource;
use App\Http\Resources\PaymentResource;
use App\Models\ConnectPack;
use App\Services\PaymentService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Connects')]
class ConnectController extends Controller
{
    /**
     * List connect packs
     *
     * Purchasable connect bundles with USD and XAF pricing, matching the
     * "Buy Connects" screen (Starter Pack → Power Pack).
     *
     * @unauthenticated
     */
    public function packs(): AnonymousResourceCollection
    {
        return ConnectPackResource::collection(
            ConnectPack::query()->where('is_active', true)->orderBy('sort_order')->get(),
        );
    }

    /**
     * Buy a connect pack
     *
     * Starts a payment for the pack via MTN MoMo, Orange Money, card or PayPal.
     * Connects are credited when the provider confirms (webhook or sandbox
     * confirm endpoint).
     */
    public function purchase(Request $request, ConnectPack $connectPack, PaymentService $paymentService): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required', Rule::in(['mtn_momo', 'orange_money', 'card', 'paypal'])],
            'currency' => ['nullable', Rule::in(['USD', 'XAF'])],
            'phone_number' => ['nullable', 'required_if:provider,mtn_momo,orange_money', 'string', 'max:30'],
        ]);

        $payment = $paymentService->initiateConnectsPurchase(
            $connectPack,
            $request->user(),
            $data['provider'],
            $data['phone_number'] ?? null,
            $data['currency'] ?? 'XAF',
        );

        return new PaymentResource($payment)->response()->setStatusCode(201);
    }

    /**
     * My connects history
     *
     * Balance plus the ledger of purchases, spends, refunds and bonuses.
     */
    public function history(Request $request): JsonResponse
    {
        return response()->json([
            'balance' => $request->user()->connects_balance,
            'transactions' => ConnectTransactionResource::collection(
                $request->user()->connectTransactions()->latest()->paginate(20),
            )->response()->getData(true),
        ]);
    }
}
