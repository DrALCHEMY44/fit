<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ClientProfile;
use App\Models\ConnectTransaction;
use App\Models\FreelancerProfile;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\ConnectService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

#[Group('Authentication')]
class AuthController extends Controller
{
    /**
     * Register
     *
     * Creates a FIT account as a client or freelancer (FIT-AUTH-01, FIT-AUTH-05).
     * At least one of `email` or `phone` is required. The matching profile
     * (client or freelancer) and the wallet are created automatically, and the
     * signup connects bonus is credited for freelancers. Returns a Sanctum
     * bearer token to use in the `Authorization: Bearer {token}` header.
     *
     * @unauthenticated
     */
    public function register(Request $request, ConnectService $connectService): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in([User::ROLE_CLIENT, User::ROLE_FREELANCER])],
            'language' => ['nullable', Rule::in(['en', 'fr'])],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'referral_code' => ['nullable', 'string', 'exists:users,referral_code'],
        ]);

        $user = DB::transaction(function () use ($data, $connectService) {
            $referrer = isset($data['referral_code'])
                ? User::query()->where('referral_code', $data['referral_code'])->first()
                : null;

            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role' => $data['role'],
                'language' => $data['language'] ?? 'en',
                'city_id' => $data['city_id'] ?? null,
                'referral_code' => strtoupper(Str::random(8)),
                'referred_by' => $referrer?->id,
            ]);

            if ($data['role'] === User::ROLE_FREELANCER) {
                FreelancerProfile::query()->create(['user_id' => $user->id]);

                $signupBonus = (int) PlatformSetting::get('free_connects_on_signup', 10);
                $connectService->credit($user, $signupBonus, ConnectTransaction::TYPE_BONUS, null, 'Welcome bonus');
            } else {
                ClientProfile::query()->create(['user_id' => $user->id]);
            }

            if ($referrer !== null) {
                $referralBonus = (int) PlatformSetting::get('referral_bonus_connects', 5);
                $connectService->credit($referrer, $referralBonus, ConnectTransaction::TYPE_BONUS, $user, "Referral bonus for inviting {$user->name}");
            }

            $user->wallet()->create([]);

            return $user;
        });

        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => new UserResource($user->refresh()->load(['clientProfile', 'freelancerProfile', 'city'])),
        ], 201);
    }

    /**
     * Login
     *
     * Authenticates with email **or** phone plus password (FIT-AUTH-02).
     * After 5 failed attempts the account is locked for 15 minutes (FIT-AUTH-08).
     *
     * @unauthenticated
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            /** @example diane@fit.cm */
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            /** @example mobile-app */
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::query()
            ->where('email', $data['identifier'])
            ->orWhere('phone', $data['identifier'])
            ->first();

        if ($user === null) {
            throw ValidationException::withMessages(['identifier' => ['These credentials do not match our records.']]);
        }

        if ($user->locked_until !== null && $user->locked_until->isFuture()) {
            throw ValidationException::withMessages([
                'identifier' => ['Account temporarily locked after too many failed attempts. Try again at '.$user->locked_until->toTimeString().'.'],
            ]);
        }

        if (! Hash::check($data['password'], $user->password)) {
            $user->increment('failed_login_attempts');

            if ($user->failed_login_attempts >= 5) {
                $user->forceFill(['locked_until' => now()->addMinutes(15), 'failed_login_attempts' => 0])->save();
            }

            throw ValidationException::withMessages(['identifier' => ['These credentials do not match our records.']]);
        }

        abort_unless($user->isActive(), 403, 'Your account is '.$user->status.'. Contact FIT support.');

        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'last_login_at' => now(),
        ])->save();

        return response()->json([
            'token' => $user->createToken($data['device_name'] ?? 'api')->plainTextToken,
            'user' => new UserResource($user->load(['clientProfile', 'freelancerProfile', 'city'])),
        ]);
    }

    /**
     * Logout
     *
     * Revokes the bearer token used for this request (FIT-AUTH-07).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * Current user
     *
     * Returns the authenticated account with both profiles, city and wallet-related counters.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource(
            $request->user()->load(['clientProfile', 'freelancerProfile.skills', 'city']),
        );
    }
}
