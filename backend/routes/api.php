<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\PreRegistrationController;
use App\Http\Controllers\Api\ReportsController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/pre-registrations', [PreRegistrationController::class, 'store']);

// Queue display (public)
Route::get('/queue/display', [QueueController::class, 'display']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Patients
    Route::apiResource('patients', PatientController::class);

    // Medical Records
    Route::apiResource('medical-records', MedicalRecordController::class);
    Route::get('/patients/{patient}/medical-records', [MedicalRecordController::class, 'patientHistory']);
    Route::get('/medical-records/{medicalRecord}/download-pdf', [MedicalRecordController::class, 'downloadPdf']);

    // Queue
    Route::apiResource('queue', QueueController::class);
    Route::get('/queue-statistics', [QueueController::class, 'statistics']);

    // Pre-registrations (staff/admin only)
    Route::apiResource('pre-registrations', PreRegistrationController::class)->except(['store']);
    Route::post('/pre-registrations/{preRegistration}/approve', [PreRegistrationController::class, 'approve']);
    Route::post('/pre-registrations/{preRegistration}/reject', [PreRegistrationController::class, 'reject']);

    // Reports
    Route::get('/reports/dashboard', [ReportsController::class, 'dashboard']);
    Route::get('/reports/patient-analytics', [ReportsController::class, 'patientAnalytics']);
    Route::get('/reports/queue-analytics', [ReportsController::class, 'queueAnalytics']);
    Route::get('/reports/medical-records-analytics', [ReportsController::class, 'medicalRecordsAnalytics']);
    Route::get('/reports/pre-registration-analytics', [ReportsController::class, 'preRegistrationAnalytics']);
    Route::get('/reports/export', [ReportsController::class, 'exportData']);
});
