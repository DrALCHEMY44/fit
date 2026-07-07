<?php

namespace App\Http\Resources;

use App\Models\ServicePackage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ServicePackage */
class ServicePackageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tier' => $this->tier,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'delivery_days' => $this->delivery_days,
            'revisions_included' => $this->revisions_included,
            'features' => $this->features,
        ];
    }
}
