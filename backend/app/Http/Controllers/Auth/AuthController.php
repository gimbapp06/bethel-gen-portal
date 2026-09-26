<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /** Max failed login attempts before an account is temporarily locked. */
    private const MAX_ATTEMPTS = 5;

    /** Lockout duration once the threshold above is hit. */
    private const LOCKOUT_MINUTES = 15;

    /** Registration OTP validity window, in minutes. */
    private const REG_OTP_MINUTES = 10;

    /** Max OTP verification attempts before the pending registration is voided. */
    private const REG_OTP_MAX_ATTEMPTS = 5;

    /**
     * Step 1: submit registration details.
     *
     * No `users` row is created yet. Instead the form data is stashed in
     * `pending_registrations` (password already hashed) and a 6-digit OTP is
     * emailed to confirm the address belongs to the applicant. The actual
     * client account is only created once verifyRegistration() succeeds.
     */
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|max:255|unique:users,email',
            'password'   => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'phone'     => 'nullable|string|max:20',
            'address'   => 'nullable|string|max:255',
            'birthdate' => 'nullable|date|before:today',
            'gender'    => 'nullable|in:male,female,other',
        ], [
            'email.unique'       => 'This email is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        $otp = (string) random_int(100000, 999999);

        // Replace any earlier unverified attempt for the same email so a
        // person can safely retry registration without a stale row blocking
        // them via the unique constraint. Wrapped in a transaction so a
        // double form-submit (double-click, slow network causing a retry)
        // can't interleave delete+create from two requests and leave the
        // applicant holding an OTP for a row that a second request already
        // replaced.
        $pending = DB::transaction(function () use ($request, $otp) {
            PendingRegistration::where('email', $request->email)->delete();

            return PendingRegistration::create([
                'first_name'     => strip_tags($request->first_name),
                'last_name'      => strip_tags($request->last_name),
                'email'          => $request->email,
                'password'       => Hash::make($request->password),
                'phone'          => $request->phone,
                'address'        => $request->address ? strip_tags($request->address) : null,
                'birthdate'      => $request->birthdate,
                'gender'         => $request->gender,
                'otp_hash'       => Hash::make($otp),
                'otp_expires_at' => now()->addMinutes(self::REG_OTP_MINUTES),
                'attempts'       => 0,
            ]);
        });

        // Always visible for local/dev testing, regardless of mail status.
        Log::info("REGISTRATION OTP for {$pending->email} ---> {$otp} (valid " . self::REG_OTP_MINUTES . ' minutes)');

        try {
            Mail::send('emails.registration-otp', [
                'otp'        => $otp,
                'first_name' => $pending->first_name,
                'minutes'    => self::REG_OTP_MINUTES,
            ], function ($m) use ($pending) {
                $m->to($pending->email, $pending->first_name . ' ' . $pending->last_name)
                  ->subject('Bethel Gen Portal – Verify Your Email');
            });
        } catch (\Throwable $e) {
            Log::warning('Registration OTP email could not be sent (non-fatal): ' . $e->getMessage());
        }

        AuditLogService::log(
            'auth.register.otp_sent',
            "Registration OTP sent to {$pending->email}, pending email verification.",
            null,
            'success',
            null,
            $request
        );

        return response()->json([
            'message' => 'We sent a 6-digit verification code to your email. Enter it to activate your account.',
            'email'   => $pending->email,
        ], 200);
    }

    /**
     * Step 2: verify the registration OTP and create the real client account.
     */
    public function verifyRegistration(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        // Everything below runs inside one transaction with the row locked
        // (`lockForUpdate`) for the duration. Without this, two verification
        // requests for the same email (e.g. a slow first click plus an
        // impatient retry, or a mistaken double-submit) can interleave: both
        // read the row before either writes, so the attempts counter can be
        // lost, and — in the worst case — a request that re-reads a stale
        // copy of the row can fail a check that a fresh read would have
        // passed. Locking the row up front makes each request see the
        // latest committed state and serializes concurrent attempts.
        //
        // The outcome is one of four distinct states, so the frontend can
        // tell a person exactly what happened instead of a single generic
        // "invalid or expired" for every case:
        //   - success                  → $result['pending'] set
        //   - wrong code, tries left   → 'wrong'   + attempts_remaining
        //   - wrong code, out of tries → 'locked'
        //   - no row / expired         → 'expired'
        //
        // IMPORTANT: once attempts are exhausted, the row is kept (not
        // deleted). Deleting it here used to silently break "Resend Code",
        // which looks up the row by email to revive it — with no row left,
        // resend had nothing to send, forcing the person all the way back
        // to step 2 to re-register from scratch just to get unstuck.
        $result = DB::transaction(function () use ($request) {
            $pending = PendingRegistration::where('email', $request->email)
                ->where('otp_expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (!$pending) {
                return ['state' => 'expired'];
            }

            if ($pending->attempts >= self::REG_OTP_MAX_ATTEMPTS) {
                return ['state' => 'locked'];
            }

            if (!Hash::check(trim((string) $request->otp), $pending->otp_hash)) {
                $pending->increment('attempts');

                $remaining = self::REG_OTP_MAX_ATTEMPTS - $pending->attempts;

                if ($remaining <= 0) {
                    return ['state' => 'locked'];
                }

                return ['state' => 'wrong', 'attempts_remaining' => $remaining];
            }

            return ['state' => 'ok', 'pending' => $pending];
        });

        if ($result['state'] !== 'ok') {
            AuditLogService::log(
                'auth.register.otp_failed',
                "Invalid/expired registration OTP attempt for {$request->email} ({$result['state']}).",
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

        $pending = $result['pending'];

        // Guard against a race where the email got registered by another
        // path (e.g. an admin-created account) while the OTP was pending.
        if (User::where('email', $pending->email)->exists()) {
            $pending->delete();
            return response()->json([
                'message' => 'This email is already registered.',
            ], 422);
        }

        $user = User::create([
            'first_name'        => $pending->first_name,
            'last_name'         => $pending->last_name,
            'email'             => $pending->email,
            'password'          => $pending->password, // already hashed
            'role'              => 'client',
            'phone'             => $pending->phone,
            'address'           => $pending->address,
            'birthdate'         => $pending->birthdate,
            'gender'            => $pending->gender,
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        $pending->delete();

        $token = $user->createToken('auth_token', ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        AuditLogService::log(
            'auth.register',
            "New client account registered and email-verified: {$user->email}",
            $user,
            'success',
            $user,
            $request
        );

        return response()->json([
            'message' => 'Account created successfully.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Resend a fresh registration OTP for a still-pending sign-up.
     */
    public function resendRegistrationOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $pending = PendingRegistration::where('email', $request->email)->first();

        // Same generic response whether or not a pending row exists, to
        // avoid leaking which emails have attempted registration.
        $generic = ['message' => 'If a pending registration exists for that email, a new code has been sent.'];

        if (!$pending) {
            return response()->json($generic);
        }

        $otp = (string) random_int(100000, 999999);
        $pending->otp_hash = Hash::make($otp);
        $pending->otp_expires_at = now()->addMinutes(self::REG_OTP_MINUTES);
        $pending->attempts = 0;
        $pending->save();

        Log::info("REGISTRATION OTP (resend) for {$pending->email} ---> {$otp} (valid " . self::REG_OTP_MINUTES . ' minutes)');

        try {
            Mail::send('emails.registration-otp', [
                'otp'        => $otp,
                'first_name' => $pending->first_name,
                'minutes'    => self::REG_OTP_MINUTES,
            ], function ($m) use ($pending) {
                $m->to($pending->email, $pending->first_name . ' ' . $pending->last_name)
                  ->subject('Bethel Gen Portal – Verify Your Email');
            });
        } catch (\Throwable $e) {
            Log::warning('Registration OTP resend email could not be sent (non-fatal): ' . $e->getMessage());
        }

        return response()->json($generic);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'role'     => 'required|in:admin,staff,client',
        ]);

        // Look up by email only (not email + role together). Matching on
        // both, as before, meant that picking the wrong tab — e.g. a staff
        // member clicking the Client tab by mistake — produced the exact
        // same "Invalid email or password" as an actually wrong password,
        // with no way for the person to tell the two mistakes apart.
        //
        // Checking the password against the account itself lets us tell
        // them apart below. The wrong-tab hint is only ever returned once
        // the password has already been verified correct for that email,
        // so simply guessing an email never confirms which role it
        // belongs to.
        $user = User::where('email', $request->email)->first();

        // ── Account lockout check (brute-force protection) ──────────
        if ($user && $user->locked_until && $user->locked_until->isFuture()) {
            AuditLogService::log(
                'auth.login.blocked',
                "Login blocked for {$request->email} — account temporarily locked.",
                null,
                'failed',
                $user,
                $request
            );

            return response()->json([
                'message' => 'Account temporarily locked due to repeated failed login attempts. Please try again later or reset your password.',
            ], 423);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            if ($user) {
                $user->increment('failed_login_attempts');
                if ($user->failed_login_attempts >= self::MAX_ATTEMPTS) {
                    $user->locked_until = now()->addMinutes(self::LOCKOUT_MINUTES);
                    $user->save();
                }
            }

            AuditLogService::log(
                'auth.login.failed',
                "Failed login attempt for {$request->email} (role: {$request->role}).",
                null,
                'failed',
                $user,
                $request
            );

            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        // ── Right credentials, wrong tab ─────────────────────────────
        // The password checks out for this account, but it's registered
        // under a different role than the tab the person used. Tell them
        // which tab to use instead of a generic invalid-credentials
        // message, so the mistake is obvious and easy to fix.
        if ($user->role !== $request->role) {
            AuditLogService::log(
                'auth.login.wrong_tab',
                "{$user->email} entered correct credentials on the {$request->role} tab, but the account is registered as {$user->role}.",
                $user,
                'failed',
                $user,
                $request
            );

            return response()->json([
                'message'      => 'This account is registered as ' . self::roleLabel($user->role) . '. Please switch to the ' . self::roleLabel($user->role) . ' tab and sign in again.',
                'wrong_tab'    => true,
                'correct_role' => $user->role,
            ], 401);
        }

        if (!$user->is_active) {
            AuditLogService::log(
                'auth.login.deactivated',
                "Login attempt on deactivated account: {$user->email}.",
                $user,
                'failed',
                $user,
                $request
            );

            return response()->json([
                'message' => 'Your account has been deactivated. Please contact the branch.',
            ], 403);
        }

        // ── Successful login: reset lockout counters, enforce single active session ──
        $user->failed_login_attempts = 0;
        $user->locked_until          = null;
        $user->last_login_at         = now();
        $user->last_login_ip         = $request->ip();
        $user->save();

        // Revoke old tokens so only one active session/token exists per user
        $user->tokens()->delete();

        $expiresAt = config('sanctum.expiration')
            ? now()->addMinutes(config('sanctum.expiration'))
            : null;

        $token = $user->createToken('auth_token', ['*'], $expiresAt)->plainTextToken;

        AuditLogService::log(
            'auth.login.success',
            "{$user->email} logged in successfully.",
            $user,
            'success',
            $user,
            $request
        );

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        AuditLogService::log(
            'auth.logout',
            "{$user->email} logged out.",
            $user,
            'success',
            $user,
            $request
        );

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    /** Human-readable label for a role, used in the wrong-tab login message. */
    private static function roleLabel(string $role): string
    {
        return match ($role) {
            'admin' => 'Admin',
            'staff' => 'Staff',
            default => 'Client',
        };
    }

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'full_name'  => $user->first_name . ' ' . $user->last_name,
            'email'      => $user->email,
            'role'       => $user->role,
            'phone'      => $user->phone,
            'address'    => $user->address,
            'birthdate'  => $user->birthdate,
            'gender'     => $user->gender,
            'photo'      => $user->photo ? asset('storage/' . $user->photo) : null,
            'is_active'  => $user->is_active,
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at,
        ];
    }
}
