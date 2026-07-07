<?php

namespace App\Http\Resources;

use App\Models\ConnectPack;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ConnectPack */
class ConnectPackResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'connects' => $this->connects,
            'price_usd' => (float) $this->price_usd,
            'price_xaf' => (float) $this->price_xaf,
            'badge' => $this->badge,
            'savings_label' => $this->savings_label,
        ];
    }
}
