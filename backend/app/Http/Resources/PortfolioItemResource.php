<?php

namespace App\Http\Resources;

use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin PortfolioItem */
class PortfolioItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'file_url' => $this->file_path ? Storage::url($this->file_path) : null,
            'link_url' => $this->link_url,
            'type' => $this->type,
            'created_at' => $this->created_at,
        ];
    }
}
