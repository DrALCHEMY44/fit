<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ClientProfile;
use App\Models\FreelancerProfile;
use App\Models\User;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

#[Group('My Account')]
class ProfileController extends Controller
{
    /**
     * Update my account
     *
     * Updates the base account fields (name, language, city, contact details).
     * Changing email or phone resets its verified status until a new OTP
     * verification is completed.
     */
    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'language' => ['sometimes', Rule::in(['en', 'fr'])],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
        ]);

        if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
            $user->forceFill(['email_verified_at' => null]);
        }

        if (array_key_exists('phone', $data) && $data['phone'] !== $user->phone) {
            $user->forceFill(['phone_verified_at' => null]);
        }

        $user->update($data);

        return new UserResource($user->fresh(['clientProfile', 'freelancerProfile', 'city']));
    }

    /**
     * Upload avatar
     *
     * Stores a profile photo (JPEG/PNG/WebP, max 4 MB) and returns the updated user.
     */
    public function uploadAvatar(Request $request): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        return new UserResource($user->fresh());
    }

    /**
     * Change password
     *
     * Requires the current password. All other API tokens are revoked.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }

        $user->update(['password' => $data['password']]);
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password changed.']);
    }

    /**
     * Switch active role
     *
     * A user can act as both client and freelancer (FIT-AUTH-06). Switching
     * to a role creates the missing profile on first use and flips the
     * account's active role.
     */
    public function switchRole(Request $request): UserResource
    {
        $data = $request->validate([
            'role' => ['required', Rule::in([User::ROLE_CLIENT, User::ROLE_FREELANCER])],
        ]);

        $user = $request->user();

        abort_if($user->isAdmin(), 403, 'Admin accounts cannot switch marketplace roles.');

        if ($data['role'] === User::ROLE_FREELANCER) {
            FreelancerProfile::query()->firstOrCreate(['user_id' => $user->id]);
        } else {
            ClientProfile::query()->firstOrCreate(['user_id' => $user->id]);
        }

        $user->update(['role' => $data['role']]);

        return new UserResource($user->fresh(['clientProfile', 'freelancerProfile', 'city']));
    }
}
