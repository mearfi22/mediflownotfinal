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

        $users = $query->with('doctor.department')->orderBy('created_at', 'desc')->paginate(15);

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
            // Prepare update data
            $updateData = [];

            if (isset($validated['name'])) {
                $updateData['name'] = $validated['name'];
            }
            if (isset($validated['email'])) {
                $updateData['email'] = $validated['email'];
            }
            if (isset($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }
            if (isset($validated['role'])) {
                $updateData['role'] = $validated['role'];
            }

            // Update user account using update() method to trigger observer
            if (!empty($updateData)) {
                $user->update($updateData);
            }

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
        if ($user->id === auth()->user()?->id) {
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

    /**
     * Approve pending user registration
     */
    public function approveUser(User $user)
    {
        if ($user->status !== 'pending') {
            return response()->json([
                'message' => 'User is not in pending status'
            ], 400);
        }

        $user->update(['status' => 'active']);

        // Log approval
        \App\Traits\LogsActivity::logActivity(
            'approved_registration',
            'User',
            $user->id,
            "Approved registration for {$user->role}: {$user->name}",
            ['approved_user_id' => $user->id]
        );

        return response()->json([
            'message' => 'User registration approved successfully',
            'user' => $user->load('doctor.department')
        ]);
    }

    /**
     * Reject pending user registration
     */
    public function rejectUser(Request $request, User $user)
    {
        if ($user->status !== 'pending') {
            return response()->json([
                'message' => 'User is not in pending status'
            ], 400);
        }

        $reason = $request->input('reason', 'No reason provided');

        $user->update(['status' => 'rejected']);

        // Log rejection
        \App\Traits\LogsActivity::logActivity(
            'rejected_registration',
            'User',
            $user->id,
            "Rejected registration for {$user->role}: {$user->name} - Reason: {$reason}",
            ['rejected_user_id' => $user->id, 'reason' => $reason]
        );

        return response()->json([
            'message' => 'User registration rejected successfully'
        ]);
    }

    /**
     * Get pending user registrations
     */
    public function getPendingUsers()
    {
        $pendingUsers = User::with('doctor.department')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pendingUsers);
    }

    /**
     * Update authenticated user's profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|nullable|min:6',
            'doctor_profile' => 'sometimes|array',
            'doctor_profile.full_name' => 'sometimes|string|max:255',
            'doctor_profile.email' => 'sometimes|nullable|email',
            'doctor_profile.phone' => 'sometimes|nullable|string',
            'doctor_profile.department_id' => 'sometimes|exists:departments,id',
            'doctor_profile.avg_consultation_minutes' => 'sometimes|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Update user basic info
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }
            if (isset($validated['password']) && !empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
            $user->save();

            // Update doctor profile if user is a doctor
            if ($user->role === 'doctor' && isset($validated['doctor_profile']) && $user->doctor_id) {
                $doctor = Doctor::find($user->doctor_id);
                if ($doctor) {
                    $doctorData = $validated['doctor_profile'];
                    if (isset($doctorData['full_name'])) {
                        $doctor->full_name = $doctorData['full_name'];
                    }
                    if (isset($doctorData['email'])) {
                        $doctor->email = $doctorData['email'];
                    }
                    if (isset($doctorData['phone'])) {
                        $doctor->phone = $doctorData['phone'];
                    }
                    if (isset($doctorData['department_id'])) {
                        $doctor->department_id = $doctorData['department_id'];
                    }
                    if (isset($doctorData['avg_consultation_minutes'])) {
                        $doctor->avg_consultation_minutes = $doctorData['avg_consultation_minutes'];
                    }
                    $doctor->save();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->load('doctor.department')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
