<?php

namespace App\Http\Resources;

use App\Models\JobPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin JobPost */
class JobPostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'budget_type' => $this->budget_type,
            'budget_min' => $this->budget_min,
            'budget_max' => $this->budget_max,
            'currency' => $this->currency,
            'duration' => $this->duration,
            'experience_level' => $this->experience_level,
            'urgency' => $this->urgency,
            'mode' => $this->mode,
            'deadline' => $this->deadline?->toDateString(),
            'status' => $this->status,
            'connects_cost' => $this->connects_cost,
            'proposals_count' => $this->proposals_count,
            'views_count' => $this->views_count,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'city' => new CityResource($this->whenLoaded('city')),
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
            'client' => new UserResource($this->whenLoaded('client')),
            'attachments' => JobPostAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at,
        ];
    }
}
