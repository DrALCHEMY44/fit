<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WalletTransactionResource;
use App\Http\Resources\WithdrawalResource;
use App\Models\PlatformSetting;
use App\Services\WalletService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Wallet & Withdrawals')]
class WalletController extends Controller
{
    /**
     * My wallet
     *
     * Balances as shown in the app: pending (escrowed on active orders),
     * available (released earnings), total earned and total withdrawn
     * (FIT-PAY-04).
     */
    public function show(Request $request, WalletService $walletService): WalletResource
    {
        return new WalletResource($walletService->walletFor($request->user()));
    }

    /**
     * Wallet transactions
     *
     * The user's full wallet ledger: escrow holds, releases, commissions,
     * refunds and withdrawals (FIT-PAY-08 for the user's own view).
     */
    public function transactions(Request $request): AnonymousResourceCollection
    {
        return WalletTransactionResource::collection(
            $request->user()->walletTransactions()->latest()->paginate(20),
        );
    }

    /**
     * Request a withdrawal
     *
     * Withdraws available balance to MTN Mobile Money or Orange Money
     * (FIT-PAY-06). The amount is reserved immediately and the request goes to
     * admin approval, following the statuses pending → approved → paid
     * (or rejected/failed).
     */
    public function requestWithdrawal(Request $request, WalletService $walletService): JsonResponse
    {
        $minAmount = (float) PlatformSetting::get('min_withdrawal_amount', 5000);

        $data = $request->validate([
            /** Amount in XAF, at least the platform minimum. @example 25000 */
            'amount' => ['required', 'numeric', "min:{$minAmount}"],
            'method' => ['required', Rule::in(['mtn_momo', 'orange_money'])],
            /** The Mobile Money account to pay out to. @example 237677001122 */
            'account_number' => ['required', 'string', 'max:30'],
            'account_name' => ['nullable', 'string', 'max:255'],
        ]);

        $withdrawal = $walletService->requestWithdrawal(
            $request->user(),
            (float) $data['amount'],
            $data['method'],
            $data['account_number'],
            $data['account_name'] ?? null,
        );

        return new WithdrawalResource($withdrawal)->response()->setStatusCode(201);
    }

    /**
     * My withdrawals
     */
    public function withdrawals(Request $request): AnonymousResourceCollection
    {
        return WithdrawalResource::collection(
            $request->user()->withdrawals()->latest()->paginate(20),
        );
    }
}
