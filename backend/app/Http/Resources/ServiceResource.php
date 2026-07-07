<?php

namespace App\Http\Resources;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Service */
class ServiceResource extends JsonResource
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
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'delivery_days' => $this->delivery_days,
            'revisions_included' => $this->revisions_included,
            'image_urls' => collect($this->images ?? [])->map(fn (string $path) => Storage::url($path))->all(),
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'orders_count' => $this->orders_count,
            'rating' => (float) $this->rating,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'packages' => ServicePackageResource::collection($this->whenLoaded('packages')),
            'created_at' => $this->created_at,
        ];
    }
}
