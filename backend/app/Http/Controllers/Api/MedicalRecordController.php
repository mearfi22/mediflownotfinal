<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max - REQUIRED for new records
        ]);

        // Handle PDF file upload
        if ($request->hasFile('pdf_file')) {
            $file = $request->file('pdf_file');
            $fileName = 'medical_record_' . time() . '_' . Str::random(10) . '.pdf';
            $filePath = $file->storeAs('medical_records', $fileName, 'public');
            $validated['pdf_file_path'] = $filePath;
        }

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
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ]);

        // Handle PDF file upload
        if ($request->hasFile('pdf_file')) {
            // Delete old file if exists
            if ($medicalRecord->pdf_file_path && Storage::disk('public')->exists($medicalRecord->pdf_file_path)) {
                Storage::disk('public')->delete($medicalRecord->pdf_file_path);
            }

            $file = $request->file('pdf_file');
            $fileName = 'medical_record_' . time() . '_' . Str::random(10) . '.pdf';
            $filePath = $file->storeAs('medical_records', $fileName, 'public');
            $validated['pdf_file_path'] = $filePath;
        }

        $medicalRecord->update($validated);
        $medicalRecord->load('patient');

        return response()->json($medicalRecord);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MedicalRecord $medicalRecord): JsonResponse
    {
        // Delete associated PDF file if exists
        if ($medicalRecord->pdf_file_path && Storage::disk('public')->exists($medicalRecord->pdf_file_path)) {
            Storage::disk('public')->delete($medicalRecord->pdf_file_path);
        }

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

    /**
     * Download PDF file for a medical record
     */
    public function downloadPdf(MedicalRecord $medicalRecord)
    {
        if (!$medicalRecord->pdf_file_path || !Storage::disk('public')->exists($medicalRecord->pdf_file_path)) {
            return response()->json(['message' => 'PDF file not found'], 404);
        }

        $filePath = Storage::disk('public')->path($medicalRecord->pdf_file_path);
        $originalName = 'medical_record_' . $medicalRecord->id . '_' . $medicalRecord->patient->full_name . '.pdf';

        return response()->download($filePath, $originalName);
    }
}
