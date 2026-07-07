<?php

namespace App\Http\Resources;

use App\Models\VerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin VerificationRequest */
class VerificationRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'document_type' => $this->document_type,
            'document_url' => Storage::url($this->document_path),
            'note' => $this->note,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'user' => new UserResource($this->whenLoaded('user')),
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
        ];
    }
}
