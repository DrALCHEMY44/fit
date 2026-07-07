<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Review */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'rating' => $this->rating,
            'rating_quality' => $this->rating_quality,
            'rating_communication' => $this->rating_communication,
            'rating_deadline' => $this->rating_deadline,
            'rating_professionalism' => $this->rating_professionalism,
            'comment' => $this->comment,
            'status' => $this->status,
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'reviewee' => new UserResource($this->whenLoaded('reviewee')),
            'created_at' => $this->created_at,
        ];
    }
}
