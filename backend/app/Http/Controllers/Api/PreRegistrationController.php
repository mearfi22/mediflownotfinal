<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PreRegistration;
use App\Models\Patient;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PreRegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $preRegistrations = PreRegistration::with('approver')
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
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:255',
            'civil_status' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'philhealth_id' => 'nullable|string|max:255',
            'reason_for_visit' => 'required|string',
        ]);

        $preRegistration = PreRegistration::create($validated);
        
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
        $preRegistration->load('approver');
        return response()->json($preRegistration);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PreRegistration $preRegistration): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'date_of_birth' => 'sometimes|required|date',
            'gender' => 'sometimes|required|in:male,female,other',
            'address' => 'sometimes|required|string',
            'contact_number' => 'sometimes|required|string|max:255',
            'civil_status' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'philhealth_id' => 'nullable|string|max:255',
            'reason_for_visit' => 'sometimes|required|string',
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
        ]);

        // Update pre-registration status
        $preRegistration->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pre-registration approved successfully',
            'patient' => $patient,
            'queue' => $queue->load('patient'),
        ]);
    }

    /**
     * Reject pre-registration
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
