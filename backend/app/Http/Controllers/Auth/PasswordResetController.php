<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    /** OTP validity window, in minutes. */
    private const OTP_MINUTES = 10;

    /** Max OTP verification attempts before the reset code is voided. */
    private const MAX_RESET_ATTEMPTS = 5;

    /**
     * Step 1: request a One-Time PIN (OTP) for password reset.
     *
     * A 6-digit numeric code is generated, hashed, and stored on the user
     * record with a short expiry. We *always* try to email it, but a mail
     * failure (e.g. no local SMTP server configured) never breaks this
     * endpoint — the OTP is also written to the log for local development,
     * and the client always gets the same generic success response either
     * way (prevents email enumeration).
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
                    ->where('role', 'client')
                    ->first();

        $generic = ['message' => 'If that email exists in our system, we have sent a 6-digit verification code to it.'];

        if (!$user) {
            AuditLogService::log(
                'auth.password_reset.requested',
                "Password reset requested for unknown/non-client email: {$request->email}",
                null,
                'failed',
                null,
                $request
            );

            return response()->json($generic);
        }

        $otp = (string) random_int(100000, 999999);
        $user->reset_token = Hash::make($otp);
        $user->reset_token_expires_at = now()->addMinutes(self::OTP_MINUTES);
        $user->reset_token_attempts = 0;
        $user->save();

        // Always visible for local/dev testing, regardless of mail status.
        Log::info("PASSWORD RESET OTP for {$user->email} ---> {$otp} (valid " . self::OTP_MINUTES . ' minutes)');

        // Best-effort email — failures (e.g. no SMTP server on localhost)
        // are logged but never surfaced to the client or thrown further.
        try {
            Mail::send('emails.password-reset', ['otp' => $otp, 'user' => $user, 'minutes' => self::OTP_MINUTES], function ($m) use ($user) {
                $m->to($user->email, $user->first_name . ' ' . $user->last_name)
                  ->subject('Bethel Gen Portal – Your Password Reset Code');
            });
        } catch (\Throwable $e) {
            Log::warning('Password reset email could not be sent (non-fatal): ' . $e->getMessage());
        }

        AuditLogService::log(
            'auth.password_reset.requested',
            "Password reset OTP generated for {$user->email}.",
            $user,
            'success',
            $user,
            $request
        );

        return response()->json($generic);
    }

    /**
     * Step 2: verify the OTP and set a new password.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'otp'      => 'required|digits:6',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        // Same reasoning as registration's verifyRegistration(): lock the row
        // for the duration of the check-and-update so two near-simultaneous
        // requests (double-click, retry) can't race each other, and
        // distinguish "wrong code, tries left" from "locked out" from
        // "expired" instead of one generic message for everything.
        $result = DB::transaction(function () use ($request) {
            $user = User::where('email', $request->email)
                        ->where('role', 'client')
                        ->whereNotNull('reset_token')
                        ->where('reset_token_expires_at', '>', now())
                        ->lockForUpdate()
                        ->first();

            if (!$user) {
                return ['state' => 'expired'];
            }

            if ($user->reset_token_attempts >= self::MAX_RESET_ATTEMPTS) {
                return ['state' => 'locked'];
            }

            if (!Hash::check(trim((string) $request->otp), $user->reset_token)) {
                $user->increment('reset_token_attempts');

                $remaining = self::MAX_RESET_ATTEMPTS - $user->reset_token_attempts;

                if ($remaining <= 0) {
                    $user->reset_token = null;
                    $user->reset_token_expires_at = null;
                    $user->reset_token_attempts = 0;
                    $user->save();

                    return ['state' => 'locked'];
                }

                return ['state' => 'wrong', 'attempts_remaining' => $remaining];
            }

            return ['state' => 'ok', 'user' => $user];
        });

        if ($result['state'] !== 'ok') {
            AuditLogService::log(
                'auth.password_reset.failed',
                "Invalid/expired password reset OTP attempt for {$request->email} ({$result['state']}).",
                null,
                'failed',
                null,
                $request
            );

            return match ($result['state']) {
                'wrong' => response()->json([
                    'message'            => $result['attempts_remaining'] === 1
                        ? 'Incorrect code. You have 1 attempt left before you must request a new code.'
                        : "Incorrect code. You have {$result['attempts_remaining']} attempts left.",
                    'attempts_remaining' => $result['attempts_remaining'],
                ], 422),
                'locked' => response()->json([
                    'message' => 'Too many incorrect attempts. Please request a new verification code.',
                    'locked'  => true,
                ], 422),
                default => response()->json([
                    'message' => 'This code has expired or is no longer valid. Please request a new code.',
                    'locked'  => true,
                ], 422),
            };
        }

        $user = $result['user'];

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->tokens()->delete();
        $user->save();

        AuditLogService::log(
            'auth.password_reset.success',
            "{$user->email} successfully reset their password via OTP.",
            $user,
            'success',
            $user,
            $request
        );

        return response()->json([
            'message' => 'Password reset successfully. You may now log in.',
        ]);
    }
}
