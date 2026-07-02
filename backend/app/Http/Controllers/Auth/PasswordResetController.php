<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
                    ->where('role', 'client')
                    ->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return response()->json([
                'message' => 'If that email exists in our system, you will receive a reset link shortly.',
            ]);
        }

        $token = Str::random(64);
        $user->reset_token = Hash::make($token);
        $user->reset_token_expires_at = now()->addHour();
        $user->save();

        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($user->email);

        // Send email
        Mail::send('emails.password-reset', ['url' => $resetUrl, 'user' => $user], function ($m) use ($user) {
            $m->to($user->email, $user->first_name . ' ' . $user->last_name)
              ->subject('Bethel Gen Portal – Password Reset Request');
        });

        return response()->json([
            'message' => 'If that email exists in our system, you will receive a reset link shortly.',
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = User::where('email', $request->email)
                    ->where('role', 'client')
                    ->whereNotNull('reset_token')
                    ->where('reset_token_expires_at', '>', now())
                    ->first();

        if (!$user || !Hash::check($request->token, $user->reset_token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->reset_token = null;
        $user->reset_token_expires_at = null;
        $user->tokens()->delete();
        $user->save();

        return response()->json([
            'message' => 'Password reset successfully. You may now log in.',
        ]);
    }
}
