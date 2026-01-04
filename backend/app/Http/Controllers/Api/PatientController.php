<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $patients = Patient::with([
            'department',
            'doctor',
            'queueEntries' => function($query) {
                $query->whereDate('queue_date', today());
            }
        ])->withCount('medicalRecords')->paginate(15);

        return response()->json($patients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'age' => 'required|string|max:10',
            'gender' => 'required|in:male,female,other',
            'birthplace' => 'required|string|max:255',
            'nationality' => 'required|string|max:100',
            'civil_status' => 'required|string|max:50',
            'spouse_name' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:255',
            'address' => 'required|string|max:500',
            'contact_number' => 'required|string|max:20',
            'philhealth_id' => 'nullable|string|max:255',
            'reason_for_visit' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'priority' => 'nullable|in:regular,senior,pwd,emergency',
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient): JsonResponse
    {
        $patient->load(['medicalRecords', 'queueEntries', 'department', 'doctor']);
        return response()->json($patient);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'last_name' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'sometimes|required|date',
            'age' => 'sometimes|required|string|max:10',
            'gender' => 'sometimes|required|in:male,female,other',
            'birthplace' => 'sometimes|required|string|max:255',
            'nationality' => 'sometimes|required|string|max:100',
            'civil_status' => 'sometimes|required|string|max:50',
            'spouse_name' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:255',
            'address' => 'sometimes|required|string|max:500',
            'contact_number' => 'sometimes|required|string|max:20',
            'philhealth_id' => 'nullable|string|max:255',
            'reason_for_visit' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'priority' => 'nullable|in:regular,senior,pwd,emergency',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
