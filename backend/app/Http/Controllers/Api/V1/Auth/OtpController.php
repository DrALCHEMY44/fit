<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

#[Group('Authentication')]
class OtpController extends Controller
{
    /**
     * Send OTP
     *
     * Generates a 6-digit one-time code for the given email or phone number
     * (FIT-AUTH-03) and dispatches it over the configured channel. In local /
     * sandbox environments the code is also returned in the response as
     * `debug_code` so mobile and web integration can be tested without an
     * SMS provider.
     *
     * @unauthenticated
     */
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            /** The email address or phone number to verify. @example 237677001122 */
            'identifier' => ['required', 'string', 'max:255'],
            'channel' => ['nullable', Rule::in(['email', 'sms', 'whatsapp'])],
            'purpose' => ['nullable', Rule::in([OtpCode::PURPOSE_VERIFICATION, OtpCode::PURPOSE_PASSWORD_RESET])],
        ]);

        $code = (string) random_int(100000, 999999);
        $purpose = $data['purpose'] ?? OtpCode::PURPOSE_VERIFICATION;

        $user = User::query()
            ->where('email', $data['identifier'])
            ->orWhere('phone', $data['identifier'])
            ->first();

        OtpCode::query()->create([
            'user_id' => $user?->id,
            'identifier' => $data['identifier'],
            'channel' => $data['channel'] ?? (str_contains($data['identifier'], '@') ? 'email' : 'sms'),
            'purpose' => $purpose,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        // Provider integration point: send $code by SMS/WhatsApp/email here.
        Log::info("OTP for {$data['identifier']} ({$purpose}): {$code}");

        return response()->json([
            'message' => 'OTP sent.',
            'expires_in_minutes' => 10,
            'debug_code' => app()->hasDebugModeEnabled() ? $code : null,
        ]);
    }

    /**
     * Verify OTP
     *
     * Confirms the code sent to an email or phone. On success the matching
     * user's `email_verified_at` / `phone_verified_at` is stamped (FIT-TRU-01,
     * FIT-TRU-02).
     *
     * @unauthenticated
     */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            /** @example 123456 */
            'code' => ['required', 'digits:6'],
            'purpose' => ['nullable', Rule::in([OtpCode::PURPOSE_VERIFICATION, OtpCode::PURPOSE_PASSWORD_RESET])],
        ]);

        $otp = $this->findValidOtp($data['identifier'], $data['code'], $data['purpose'] ?? OtpCode::PURPOSE_VERIFICATION);

        $otp->update(['consumed_at' => now()]);

        if ($otp->purpose === OtpCode::PURPOSE_VERIFICATION) {
            $user = User::query()
                ->where('email', $data['identifier'])
                ->orWhere('phone', $data['identifier'])
                ->first();

            if ($user !== null) {
                $field = str_contains($data['identifier'], '@') ? 'email_verified_at' : 'phone_verified_at';
                $user->forceFill([$field => now()])->save();
            }
        }

        return response()->json(['message' => 'Verified.']);
    }

    private function findValidOtp(string $identifier, string $code, string $purpose): OtpCode
    {
        $candidates = OtpCode::query()
            ->where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->limit(3)
            ->get();

        foreach ($candidates as $otp) {
            if (Hash::check($code, $otp->code_hash)) {
                return $otp;
            }
        }

        throw ValidationException::withMessages(['code' => ['Invalid or expired code.']]);
    }
}
