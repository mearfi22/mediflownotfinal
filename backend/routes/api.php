<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\PreRegistrationController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\SystemAnalyticsController;
use App\Http\Controllers\Api\NotificationController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/pre-registrations', [PreRegistrationController::class, 'store']);

// Queue display (public)
Route::get('/queue/display', [QueueController::class, 'display']);

// Public dropdown data
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/departments/{department}', [DepartmentController::class, 'show']);
Route::get('/doctors', [QueueController::class, 'getDoctors']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [UserController::class, 'updateProfile']);

    // Patients
    Route::apiResource('patients', PatientController::class);

    // Medical Records
    Route::apiResource('medical-records', MedicalRecordController::class);
    Route::get('/patients/{patient}/medical-records', [MedicalRecordController::class, 'patientHistory']);
    Route::get('/medical-records/{medicalRecord}/download-pdf', [MedicalRecordController::class, 'downloadPdf']);

    // Queue
    Route::apiResource('queue', QueueController::class);
    Route::get('/queue-statistics', [QueueController::class, 'statistics']);
    Route::post('/queue/{queue}/transfer', [QueueController::class, 'transfer']);
    Route::get('/queue/{queue}/transfer-history', [QueueController::class, 'transferHistory']);

    // Individual doctor routes (protected)
    Route::post('/doctors', [DoctorController::class, 'store']);
    Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);
    Route::put('/doctors/{doctor}', [DoctorController::class, 'update']);
    Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy']);
    Route::get('/departments-list', [DoctorController::class, 'getDepartments']);

    // Pre-registrations (staff/admin only)
    Route::apiResource('pre-registrations', PreRegistrationController::class)->except(['store']);
    Route::post('/pre-registrations/{preRegistration}/approve', [PreRegistrationController::class, 'approve']);
    Route::post('/pre-registrations/{preRegistration}/reject', [PreRegistrationController::class, 'reject']);

    // User Management (Admin only)
    Route::apiResource('users', UserController::class);
    Route::get('/staff-list', [UserController::class, 'getStaff']);
    Route::get('/doctor-users', [UserController::class, 'getDoctorUsers']);
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::get('/users-pending', [UserController::class, 'getPendingUsers']);
    Route::post('/users/{user}/approve', [UserController::class, 'approveUser']);
    Route::post('/users/{user}/reject', [UserController::class, 'rejectUser']);

    // Department Management (Admin only)
    Route::apiResource('departments', DepartmentController::class)->except(['index', 'show']);

    // System Settings (Admin only)
    Route::get('/system-settings', [SystemSettingController::class, 'index']);
    Route::put('/system-settings', [SystemSettingController::class, 'update']);

    // Audit Logs (Admin only)
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/statistics', [AuditLogController::class, 'statistics']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // System Analytics (Admin only)
    Route::get('/system-analytics/dashboard', [SystemAnalyticsController::class, 'dashboard']);

    // Reports
    Route::get('/reports/dashboard', [ReportsController::class, 'dashboard']);
    Route::get('/reports/patient-analytics', [ReportsController::class, 'patientAnalytics']);
    Route::get('/reports/queue-analytics', [ReportsController::class, 'queueAnalytics']);
    Route::get('/reports/medical-records-analytics', [ReportsController::class, 'medicalRecordsAnalytics']);
    Route::get('/reports/pre-registration-analytics', [ReportsController::class, 'preRegistrationAnalytics']);
    Route::get('/reports/export', [ReportsController::class, 'exportData']);
});
