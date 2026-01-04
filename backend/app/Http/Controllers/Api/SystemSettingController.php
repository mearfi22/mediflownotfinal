<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SystemSettingController extends Controller
{
    /**
     * Get system settings (only one record should exist).
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::first();

        if (!$settings) {
            // Create default settings if none exist
            $settings = SystemSetting::create([
                'hospital_name' => 'MediQueue Hospital',
                'working_hours_start' => '08:00:00',
                'working_hours_end' => '17:00:00',
                'average_consultation_minutes' => 15,
                'timezone' => 'Asia/Manila',
                'auto_approve_preregistration' => false,
                'queue_number_prefix' => 'Q',
            ]);
        }

        return response()->json($settings);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'hospital_name' => 'required|string|max:255',
            'hospital_address' => 'nullable|string',
            'hospital_phone' => 'nullable|string|max:50',
            'hospital_email' => 'nullable|email|max:100',
            'hospital_logo' => 'nullable|string|max:255',
            'working_hours_start' => 'required|date_format:H:i:s',
            'working_hours_end' => 'required|date_format:H:i:s',
            'average_consultation_minutes' => 'required|integer|min:5|max:120',
            'timezone' => 'required|string|max:50',
            'auto_approve_preregistration' => 'required|boolean',
            'queue_number_prefix' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = SystemSetting::first();

        if (!$settings) {
            $settings = SystemSetting::create($request->all());
        } else {
            $settings->update($request->all());
        }

        return response()->json([
            'message' => 'System settings updated successfully',
            'data' => $settings
        ]);
    }
}
