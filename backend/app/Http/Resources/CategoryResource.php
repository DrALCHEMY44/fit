<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Category */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_fr' => $this->name_fr,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'parent_id' => $this->parent_id,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'jobs_count' => $this->whenCounted('jobPosts'),
            'services_count' => $this->whenCounted('services'),
        ];
    }
}
