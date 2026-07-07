<?php

namespace App\Http\Resources;

use App\Models\OrderEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderEvent */
class OrderEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'note' => $this->note,
            'meta' => $this->meta,
            'actor' => new UserResource($this->whenLoaded('actor')),
            'created_at' => $this->created_at,
        ];
    }
}
