<?php

namespace App\Http\Resources;

use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Withdrawal */
class WithdrawalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'amount' => (float) $this->amount,
            'fee' => (float) $this->fee,
            'currency' => $this->currency,
            'method' => $this->method,
            'account_number' => $this->account_number,
            'account_name' => $this->account_name,
            'status' => $this->status,
            'admin_note' => $this->admin_note,
            'user' => new UserResource($this->whenLoaded('user')),
            'processed_at' => $this->processed_at,
            'created_at' => $this->created_at,
        ];
    }
}
