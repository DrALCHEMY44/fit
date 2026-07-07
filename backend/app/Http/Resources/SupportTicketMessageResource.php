<?php

namespace App\Http\Resources;

use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SupportTicketMessage */
class SupportTicketMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'is_staff' => $this->is_staff,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'created_at' => $this->created_at,
        ];
    }
}
