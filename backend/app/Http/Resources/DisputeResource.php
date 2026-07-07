<?php

namespace App\Http\Resources;

use App\Models\Dispute;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Dispute */
class DisputeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => $this->status,
            'resolution' => $this->resolution,
            'refund_amount' => $this->refund_amount,
            'release_amount' => $this->release_amount,
            'resolution_note' => $this->resolution_note,
            'opener' => new UserResource($this->whenLoaded('opener')),
            'order' => new OrderResource($this->whenLoaded('order')),
            'resolved_at' => $this->resolved_at,
            'created_at' => $this->created_at,
        ];
    }
}
