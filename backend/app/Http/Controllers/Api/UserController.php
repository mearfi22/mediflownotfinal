<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get all users (staff and doctors)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->with('doctor')->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    /**
     * Get staff list
     */
    public function getStaff()
    {
        $staff = User::where('role', 'staff')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at', 'updated_at']);

        return response()->json($staff);
    }

    /**
     * Get doctors list with their profiles
     */
    public function getDoctorUsers()
    {
        $doctors = User::where('role', 'doctor')
            ->with('doctor.department')
            ->orderBy('name')
            ->get();

        return response()->json($doctors);
    }

    /**
     * Create a new user (staff or doctor)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['staff', 'doctor', 'admin'])],

            // Doctor-specific fields
            'doctor_profile' => 'required_if:role,doctor|array',
            'doctor_profile.department_id' => 'required_if:role,doctor|exists:departments,id',
            'doctor_profile.full_name' => 'required_if:role,doctor|string|max:255',
            'doctor_profile.email' => 'nullable|email|max:255',
            'doctor_profile.phone' => 'nullable|string|max:20',
            'doctor_profile.avg_consultation_minutes' => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Create user account
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            // If creating a doctor, also create doctor profile
            if ($validated['role'] === 'doctor' && isset($validated['doctor_profile'])) {
                $doctor = Doctor::create([
                    'department_id' => $validated['doctor_profile']['department_id'],
                    'full_name' => $validated['doctor_profile']['full_name'],
                    'email' => $validated['doctor_profile']['email'] ?? $validated['email'],
                    'phone' => $validated['doctor_profile']['phone'] ?? null,
                    'status' => 'active',
                    'avg_consultation_minutes' => $validated['doctor_profile']['avg_consultation_minutes'] ?? 15,
                ]);

                // Link user to doctor
                $user->doctor_id = $doctor->id;
                $user->save();

                $user->load('doctor.department');
            }

            DB::commit();

            return response()->json([
                'message' => ucfirst($validated['role']) . ' account created successfully',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user account
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in(['staff', 'doctor', 'admin'])],

            // Doctor-specific fields
            'doctor_profile' => 'sometimes|array',
            'doctor_profile.department_id' => 'sometimes|exists:departments,id',
            'doctor_profile.full_name' => 'sometimes|string|max:255',
            'doctor_profile.email' => 'nullable|email|max:255',
            'doctor_profile.phone' => 'nullable|string|max:20',
            'doctor_profile.status' => 'sometimes|in:active,inactive',
            'doctor_profile.avg_consultation_minutes' => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Update user account
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }
            if (isset($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            if (isset($validated['role'])) {
                $user->role = $validated['role'];
            }

            $user->save();

            // Update doctor profile if exists
            if ($user->role === 'doctor' && $user->doctor && isset($validated['doctor_profile'])) {
                $user->doctor->update($validated['doctor_profile']);
            }

            DB::commit();

            $user->load('doctor.department');

            return response()->json([
                'message' => 'User account updated successfully',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user account
     */
    public function destroy(User $user)
    {
        // Prevent deleting your own account
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        DB::beginTransaction();
        try {
            // If doctor, also delete doctor profile
            if ($user->role === 'doctor' && $user->doctor) {
                $user->doctor->delete();
            }

            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'User account deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete user account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show user details
     */
    public function show(User $user)
    {
        $user->load('doctor.department');
        return response()->json($user);
    }

    /**
     * Toggle user status (active/inactive)
     */
    public function toggleStatus(User $user)
    {
        if ($user->role === 'doctor' && $user->doctor) {
            $newStatus = $user->doctor->status === 'active' ? 'inactive' : 'active';
            $user->doctor->status = $newStatus;
            $user->doctor->save();

            return response()->json([
                'message' => 'Doctor status updated successfully',
                'status' => $newStatus
            ]);
        }

        return response()->json([
            'message' => 'Status toggle is only available for doctors'
        ], 400);
    }
}
