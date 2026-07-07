<?php

namespace App\Http\Resources;

use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Delivery */
class DeliveryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'order_milestone_id' => $this->order_milestone_id,
            'message' => $this->message,
            'files' => collect($this->files ?? [])->map(fn (array $file) => [
                'name' => $file['name'] ?? basename($file['path']),
                'url' => Storage::url($file['path']),
                'mime' => $file['mime'] ?? null,
                'size_kb' => $file['size_kb'] ?? null,
            ])->all(),
            'link_url' => $this->link_url,
            'status' => $this->status,
            'client_feedback' => $this->client_feedback,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
        ];
    }
}
