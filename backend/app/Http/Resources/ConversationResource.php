<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Conversation */
class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'job_post_id' => $this->job_post_id,
            'order_id' => $this->order_id,
            'client' => new UserResource($this->whenLoaded('client')),
            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'last_message' => new MessageResource($this->whenLoaded('lastMessage')),
            'unread_count' => $this->when(
                $viewer !== null,
                fn () => $this->messages()->whereNull('read_at')->where('sender_id', '!=', $viewer->id)->count(),
            ),
            'last_message_at' => $this->last_message_at,
            'created_at' => $this->created_at,
        ];
    }
}
