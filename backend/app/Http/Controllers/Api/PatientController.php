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
        $patients = Patient::with(['queueEntries' => function($query) {
            $query->whereDate('queue_date', today());
        }])->paginate(15);
        
        return response()->json($patients);
    }

    /**
     * Store a newly created resource in storage.
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
            'reason_for_visit' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);
        
        return response()->json($patient, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient): JsonResponse
    {
        $patient->load(['medicalRecords', 'queueEntries']);
        return response()->json($patient);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient): JsonResponse
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
            'reason_for_visit' => 'nullable|string',
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