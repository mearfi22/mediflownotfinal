<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalRecord::with('patient');
        
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        
        $records = $query->orderBy('visit_date', 'desc')->paginate(15);
        
        return response()->json($records);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'visit_date' => 'required|date',
            'diagnosis' => 'required|string',
            'treatment' => 'required|string',
            'notes' => 'nullable|string',
            'doctor_name' => 'required|string|max:255',
        ]);

        $record = MedicalRecord::create($validated);
        $record->load('patient');
        
        return response()->json($record, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MedicalRecord $medicalRecord): JsonResponse
    {
        $medicalRecord->load('patient');
        return response()->json($medicalRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $validated = $request->validate([
            'visit_date' => 'sometimes|required|date',
            'diagnosis' => 'sometimes|required|string',
            'treatment' => 'sometimes|required|string',
            'notes' => 'nullable|string',
            'doctor_name' => 'sometimes|required|string|max:255',
        ]);

        $medicalRecord->update($validated);
        $medicalRecord->load('patient');
        
        return response()->json($medicalRecord);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MedicalRecord $medicalRecord): JsonResponse
    {
        $medicalRecord->delete();
        
        return response()->json(['message' => 'Medical record deleted successfully']);
    }

    /**
     * Get medical history for a specific patient
     */
    public function patientHistory(Patient $patient): JsonResponse
    {
        $records = $patient->medicalRecords()
            ->orderBy('visit_date', 'desc')
            ->get();
            
        return response()->json($records);
    }
}
