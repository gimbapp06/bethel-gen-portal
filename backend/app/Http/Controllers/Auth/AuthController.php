<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
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

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => 'client',
            'phone'      => $request->phone,
            'address'    => $request->address,
            'birthdate'  => $request->birthdate,
            'gender'     => $request->gender,
            'is_active'  => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'role'     => 'required|in:admin,client',
        ]);

        $user = User::where('email', $request->email)
                    ->where('role', $request->role)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact the branch.',
            ], 403);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
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
            'created_at' => $user->created_at,
        ];
    }
}
