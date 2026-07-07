<?php

namespace App\Http\Resources;

use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin ClientProfile */
class ClientProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'company_name' => $this->company_name,
            'logo_url' => $this->logo_path ? Storage::url($this->logo_path) : null,
            'sector' => $this->sector,
            'address' => $this->address,
            'website' => $this->website,
            'about' => $this->about,
            'payment_verified' => $this->payment_verified,
            'rating' => (float) $this->rating,
            'reviews_count' => $this->reviews_count,
            'total_spent' => (float) $this->total_spent,
            'jobs_posted_count' => $this->jobs_posted_count,
            'hires_count' => $this->hires_count,
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
