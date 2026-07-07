<?php

namespace App\Http\Resources;

use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Wallet */
class WalletResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'pending_balance' => (float) $this->pending_balance,
            'available_balance' => (float) $this->available_balance,
            'total_earned' => (float) $this->total_earned,
            'total_withdrawn' => (float) $this->total_withdrawn,
            'currency' => $this->currency,
        ];
    }
}
