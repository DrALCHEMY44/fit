<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientProfileResource;
use App\Models\ClientProfile;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

#[Group('My Account')]
class ClientProfileController extends Controller
{
    /**
     * My client profile
     */
    public function show(Request $request): ClientProfileResource
    {
        return new ClientProfileResource($this->profileFor($request));
    }

    /**
     * Update my client profile
     *
     * Individual or company details (FIT-CLI-01, FIT-CLI-04). Company accounts
     * can set a commercial name, sector and logo.
     */
    public function update(Request $request): ClientProfileResource
    {
        $profile = $this->profileFor($request);

        $data = $request->validate([
            'type' => ['sometimes', Rule::in(['individual', 'company'])],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sector' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'about' => ['sometimes', 'nullable', 'string', 'max:3000'],
        ]);

        $profile->update($data);

        if ($request->hasFile('logo')) {
            $request->validate(['logo' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096']]);
            $profile->update(['logo_path' => $request->file('logo')->store('logos', 'public')]);
        }

        return new ClientProfileResource($profile->fresh());
    }

    private function profileFor(Request $request): ClientProfile
    {
        return ClientProfile::query()->firstOrCreate(['user_id' => $request->user()->id]);
    }
}
