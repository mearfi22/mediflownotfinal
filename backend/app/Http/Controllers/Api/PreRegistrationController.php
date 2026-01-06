<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PreRegistration;
use App\Models\Patient;
use App\Models\Queue;
use App\Models\Notification;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PreRegistrationController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $preRegistrations = PreRegistration::with(['approver', 'department', 'doctor'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($preRegistrations);
    }

    /**
     * Store a newly created resource in storage (public endpoint).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'address' => 'required|string|max:500',
            'contact_number' => 'required|string|max:20',
            'sex' => 'required|string|max:10',
            'civil_status' => 'required|string|max:50',
            'spouse_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'age' => 'required|string|max:10',
            'birthplace' => 'required|string|max:255',
            'nationality' => 'required|string|max:100',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:255',
            'reason_for_visit' => 'required|string',
            'priority' => 'nullable|in:regular,senior,pwd,emergency',
            'philhealth_id' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
        ]);

        $preRegistration = PreRegistration::create($validated);

        // Create notification for admins
        Notification::create([
            'type' => 'pre_registration',
            'title' => 'New Pre-Registration',
            'message' => "New pre-registration from {$validated['first_name']} {$validated['last_name']}",
            'data' => [
                'pre_registration_id' => $preRegistration->id,
                'patient_name' => "{$validated['first_name']} {$validated['last_name']}",
            ],
            'user_id' => null, // Null means visible to all admins
        ]);

        return response()->json([
            'message' => 'Pre-registration submitted successfully. Please wait for approval.',
            'pre_registration' => $preRegistration
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PreRegistration $preRegistration): JsonResponse
    {
        $preRegistration->load(['approver', 'department', 'doctor']);
        return response()->json($preRegistration);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PreRegistration $preRegistration): JsonResponse
    {
        $validated = $request->validate([
            'last_name' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'address' => 'sometimes|required|string|max:500',
            'contact_number' => 'sometimes|required|string|max:20',
            'sex' => 'sometimes|required|string|max:10',
            'civil_status' => 'sometimes|required|string|max:50',
            'spouse_name' => 'nullable|string|max:255',
            'date_of_birth' => 'sometimes|required|date',
            'age' => 'sometimes|required|string|max:10',
            'birthplace' => 'sometimes|required|string|max:255',
            'nationality' => 'sometimes|required|string|max:100',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:255',
            'reason_for_visit' => 'sometimes|required|string',
            'philhealth_id' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
        ]);

        $preRegistration->update($validated);

        return response()->json($preRegistration);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PreRegistration $preRegistration): JsonResponse
    {
        $preRegistration->delete();

        return response()->json(['message' => 'Pre-registration deleted successfully']);
    }

    /**
     * Approve pre-registration and create patient + queue entry
     */
    public function approve(Request $request, PreRegistration $preRegistration): JsonResponse
    {
        if ($preRegistration->status !== 'pending') {
            return response()->json(['message' => 'Pre-registration is not in pending status'], 400);
        }

        // Create patient
        $patient = Patient::create($preRegistration->toPatientArray());

        // Create queue entry
        $queueNumber = Queue::getNextQueueNumber();
        $queue = Queue::create([
            'queue_number' => $queueNumber,
            'patient_id' => $patient->id,
            'reason_for_visit' => $preRegistration->reason_for_visit,
            'queue_date' => Carbon::today(),
            'department_id' => $preRegistration->department_id,
            'doctor_id' => $preRegistration->doctor_id,
        ]);

        // Update pre-registration status
        $preRegistration->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Log the approval action
        self::logActivity(
            'approved',
            'PreRegistration',
            $preRegistration->id,
            "Approved pre-registration for {$preRegistration->first_name} {$preRegistration->last_name} - Created patient {$patient->unique_id}",
            [
                'pre_registration_id' => $preRegistration->id,
                'patient_id' => $patient->id,
                'patient_unique_id' => $patient->unique_id,
                'queue_id' => $queue->id
            ]
        );

        return response()->json([
            'message' => 'Pre-registration approved successfully',
            'patient' => $patient,
            'queue' => $queue->load(['patient', 'department', 'doctor']),
        ]);
    }

    /**
     * R// Log the rejection action
        self::logActivity(
            'rejected',
            'PreRegistration',
            $preRegistration->id,
            "Rejected pre-registration for {$preRegistration->first_name} {$preRegistration->last_name}",
            ['pre_registration_id' => $preRegistration->id]
        );

        eject pre-registration
     */
    public function reject(Request $request, PreRegistration $preRegistration): JsonResponse
    {
        if ($preRegistration->status !== 'pending') {
            return response()->json(['message' => 'Pre-registration is not in pending status'], 400);
        }

        $preRegistration->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Pre-registration rejected successfully']);
    }
}
