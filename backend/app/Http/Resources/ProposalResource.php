<?php

namespace App\Http\Resources;

use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Proposal */
class ProposalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_post_id' => $this->job_post_id,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'delivery_days' => $this->delivery_days,
            'cover_letter' => $this->cover_letter,
            'status' => $this->status,
            'connects_spent' => $this->connects_spent,
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'job' => new JobPostResource($this->whenLoaded('jobPost')),
            'milestones' => ProposalMilestoneResource::collection($this->whenLoaded('milestones')),
            'created_at' => $this->created_at,
        ];
    }
}
