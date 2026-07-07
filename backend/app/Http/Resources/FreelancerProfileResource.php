<?php

namespace App\Http\Resources;

use App\Models\FreelancerProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FreelancerProfile */
class FreelancerProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'bio' => $this->bio,
            'experience_level' => $this->experience_level,
            'hourly_rate' => $this->hourly_rate,
            'min_price' => $this->min_price,
            'currency' => $this->currency,
            'availability' => $this->availability,
            'rating' => (float) $this->rating,
            'reviews_count' => $this->reviews_count,
            'job_success_score' => $this->job_success_score,
            'completed_orders_count' => $this->completed_orders_count,
            'total_earned' => (float) $this->total_earned,
            'is_verified' => $this->is_verified,
            'is_top_rated' => $this->is_top_rated,
            'profile_completion' => $this->profile_completion,
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
            'portfolio_items' => PortfolioItemResource::collection($this->whenLoaded('portfolioItems')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
