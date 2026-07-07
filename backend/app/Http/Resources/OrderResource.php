<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'title' => $this->title,
            'requirements' => $this->requirements,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'commission_rate' => (float) $this->commission_rate,
            'commission_amount' => (float) $this->commission_amount,
            'freelancer_amount' => (float) $this->freelancer_amount,
            'delivery_days' => $this->delivery_days,
            'deadline' => $this->deadline?->toDateString(),
            'revisions_allowed' => $this->revisions_allowed,
            'revisions_used' => $this->revisions_used,
            'status' => $this->status,
            'job_post_id' => $this->job_post_id,
            'service_id' => $this->service_id,
            'proposal_id' => $this->proposal_id,
            'client' => new UserResource($this->whenLoaded('client')),
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'milestones' => OrderMilestoneResource::collection($this->whenLoaded('milestones')),
            'deliveries' => DeliveryResource::collection($this->whenLoaded('deliveries')),
            'dispute' => new DisputeResource($this->whenLoaded('dispute')),
            'paid_at' => $this->paid_at,
            'delivered_at' => $this->delivered_at,
            'completed_at' => $this->completed_at,
            'cancelled_at' => $this->cancelled_at,
            'created_at' => $this->created_at,
        ];
    }
}
