<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DoctorController extends Controller
{
    /**
     * Display a listing of doctors.
     */
    public function index(): JsonResponse
    {
        $doctors = Doctor::with('department')->get();
        return response()->json($doctors);
    }

    /**
     * Store a newly created doctor.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'full_name' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $doctor = Doctor::create($validated);

        $doctor->load('department');

        return response()->json($doctor, 201);
    }

    /**
     * Display the specified doctor.
     */
    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load('department');
        return response()->json($doctor);
    }

    /**
     * Update the specified doctor.
     */
    public function update(Request $request, Doctor $doctor): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'sometimes|required|exists:departments,id',
            'full_name' => 'sometimes|required|string|max:150',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:50',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $doctor->update($validated);

        $doctor->load('department');

        return response()->json($doctor);
    }

    /**
     * Remove the specified doctor.
     */
    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete();

        return response()->json(['message' => 'Doctor deleted successfully']);
    }

    /**
     * Get all departments.
     */
    public function getDepartments(): JsonResponse
    {
        $departments = Department::all();
        return response()->json($departments);
    }
}
