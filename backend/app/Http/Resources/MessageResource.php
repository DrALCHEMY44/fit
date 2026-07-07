<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin Message */
class MessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'attachment_url' => $this->attachment_path ? Storage::url($this->attachment_path) : null,
            'attachment_name' => $this->attachment_name,
            'attachment_mime' => $this->attachment_mime,
            'is_flagged' => $this->is_flagged,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
