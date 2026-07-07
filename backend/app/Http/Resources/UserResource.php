<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $canViewContact = $viewer !== null && ($viewer->id === $this->id || $viewer->isAdmin());

        return [
            'id' => $this->id,
            'name' => $this->name,
            // Contact details are masked from other users until an order exists (retention rule 5).
            'email' => $this->when($canViewContact, $this->email),
            'phone' => $this->when($canViewContact, $this->phone),
            'role' => $this->role,
            'status' => $this->when($canViewContact, $this->status),
            'language' => $this->language,
            'avatar_url' => $this->avatar_path ? Storage::url($this->avatar_path) : null,
            'city' => new CityResource($this->whenLoaded('city')),
            'connects_balance' => $this->when($viewer?->id === $this->id, $this->connects_balance),
            'referral_code' => $this->when($viewer?->id === $this->id, $this->referral_code),
            'email_verified' => $this->email_verified_at !== null,
            'phone_verified' => $this->phone_verified_at !== null,
            'freelancer_profile' => new FreelancerProfileResource($this->whenLoaded('freelancerProfile')),
            'client_profile' => new ClientProfileResource($this->whenLoaded('clientProfile')),
            'created_at' => $this->created_at,
        ];
    }
}
