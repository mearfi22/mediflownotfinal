<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\UserSession;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use LogsActivity;

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is approved
        if ($user->status !== 'active') {
            $statusMessage = $user->status === 'pending'
                ? 'Your account is pending approval by an administrator.'
                : 'Your account has been rejected.';

            throw ValidationException::withMessages([
                'email' => [$statusMessage],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // Create user session record
        $session = UserSession::create([
            'user_id' => $user->id,
            'login_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Log the login activity
        Auth::setUser($user);
        self::logActivity(
            'login',
            'User',
            $user->id,
            "User {$user->name} logged in",
            ['session_id' => $session->id]
        );

        return response()->json([
            'user' => $user->load('doctor.department'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Update the last session with logout time
        $lastSession = UserSession::where('user_id', $user->id)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first();

        if ($lastSession) {
            $loginTime = $lastSession->login_at;
            $logoutTime = now();
            $duration = $loginTime->diffInSeconds($logoutTime);

            $lastSession->update([
                'logout_at' => $logoutTime,
                'duration_seconds' => $duration,
            ]);
        }

        // Log the logout activity BEFORE deleting the token
        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'action' => 'logout',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User {$user->name} logged out",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'changes' => ['session_duration' => $lastSession?->duration_seconds],
        ]);

        // Delete the access token after logging
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:staff,doctor',
            'doctor_profile' => 'required_if:role,doctor|array',
            'doctor_profile.department_id' => 'required_if:role,doctor|exists:departments,id',
            'doctor_profile.full_name' => 'required_if:role,doctor|string',
            'doctor_profile.email' => 'nullable|email',
            'doctor_profile.phone' => 'nullable|string',
            'doctor_profile.avg_consultation_minutes' => 'nullable|integer|min:1',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'pending', // All new registrations start as pending
        ]);

        // Create doctor profile if role is doctor
        if ($validated['role'] === 'doctor' && isset($validated['doctor_profile'])) {
            $doctor = Doctor::create([
                'department_id' => $validated['doctor_profile']['department_id'],
                'full_name' => $validated['doctor_profile']['full_name'],
                'email' => $validated['doctor_profile']['email'] ?? $validated['email'],
                'phone' => $validated['doctor_profile']['phone'] ?? null,
                'avg_consultation_minutes' => $validated['doctor_profile']['avg_consultation_minutes'] ?? 15,
            ]);

            // Link user to doctor
            $user->update(['doctor_id' => $doctor->id]);
        }

        // Log registration attempt
        self::logActivity(
            'registered',
            'User',
            $user->id,
            "New {$validated['role']} registration: {$user->name} - Pending admin approval",
            ['user_id' => $user->id, 'role' => $validated['role']]
        );

        return response()->json([
            'message' => 'Registration submitted successfully. Please wait for admin approval.',
            'user' => $user->load('doctor'),
        ], 201);
    }
}
