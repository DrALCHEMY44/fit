<?php

namespace App\Http\Resources;

use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Internship */
class InternshipResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'company_name' => $this->company_name,
            'location' => $this->location,
            'duration' => $this->duration,
            'stipend' => $this->stipend,
            'is_paid' => $this->is_paid,
            'type' => $this->type,
            'skills' => $this->skills,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
