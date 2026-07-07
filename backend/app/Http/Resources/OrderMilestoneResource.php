<?php

namespace App\Http\Resources;

use App\Models\OrderMilestone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderMilestone */
class OrderMilestoneResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'title' => $this->title,
            'amount' => (float) $this->amount,
            'due_date' => $this->due_date?->toDateString(),
            'status' => $this->status,
            'sort_order' => $this->sort_order,
            'funded_at' => $this->funded_at,
            'approved_at' => $this->approved_at,
        ];
    }
}
