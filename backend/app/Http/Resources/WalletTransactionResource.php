<?php

namespace App\Http\Resources;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin WalletTransaction */
class WalletTransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'bucket' => $this->bucket,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'reference' => $this->reference,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
    }
}
