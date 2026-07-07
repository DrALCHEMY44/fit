<?php

namespace App\Http\Resources;

use App\Models\JobPostAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin JobPostAttachment */
class JobPostAttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'file_url' => Storage::url($this->file_path),
            'mime_type' => $this->mime_type,
            'size_kb' => $this->size_kb,
        ];
    }
}
