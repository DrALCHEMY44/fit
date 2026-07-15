<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Payment */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'order_id' => $this->order_id,
            'order_milestone_id' => $this->order_milestone_id,
            'purpose' => $this->purpose,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'provider' => $this->provider,
            'phone_number' => $this->phone_number,
            'provider_ref' => $this->provider_ref,
            'status' => $this->status,
            'payer' => new UserResource($this->whenLoaded('payer')),
            'order' => new OrderResource($this->whenLoaded('order')),
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
