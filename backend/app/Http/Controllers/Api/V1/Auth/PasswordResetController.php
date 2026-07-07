<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

#[Group('Authentication')]
class PasswordResetController extends Controller
{
    /**
     * Reset password with OTP
     *
     * Completes the password reset flow (FIT-AUTH-04): request a code with
     * `POST /auth/otp/send` using `purpose=password_reset`, then call this
     * endpoint with the code and the new password. All existing tokens are
     * revoked.
     *
     * @unauthenticated
     */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'code' => ['required', 'digits:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::query()
            ->where('email', $data['identifier'])
            ->orWhere('phone', $data['identifier'])
            ->first();

        if ($user === null) {
            throw ValidationException::withMessages(['identifier' => ['No account found for this identifier.']]);
        }

        $otp = OtpCode::query()
            ->where('identifier', $data['identifier'])
            ->where('purpose', OtpCode::PURPOSE_PASSWORD_RESET)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($otp === null || ! Hash::check($data['code'], $otp->code_hash)) {
            throw ValidationException::withMessages(['code' => ['Invalid or expired code.']]);
        }

        $otp->update(['consumed_at' => now()]);
        $user->update(['password' => $data['password']]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password updated. Please log in again.']);
    }
}
