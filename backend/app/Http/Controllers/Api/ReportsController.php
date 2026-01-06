<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Queue;
use App\Models\PreRegistration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get dashboard statistics overview
     */
    public function dashboard(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        $data = [
            'total_patients' => Patient::count(),
            'total_medical_records' => MedicalRecord::count(),
            'total_queue_entries' => Queue::count(),
            'pending_pre_registrations' => PreRegistration::where('status', 'pending')->count(),

            // Period-specific data
            'period_stats' => [
                'new_patients' => Patient::whereBetween('created_at', [$startDate, $endDate])->count(),
                'medical_records' => MedicalRecord::whereBetween('visit_date', [$startDate, $endDate])->count(),
                'queue_entries' => Queue::whereBetween('queue_date', [$startDate, $endDate])->count(),
                'approved_pre_registrations' => PreRegistration::where('status', 'approved')
                    ->whereBetween('approved_at', [$startDate, $endDate])->count(),
            ],

            // Today's statistics
            'today_stats' => [
                'queue_served' => Queue::where('queue_date', Carbon::today())
                    ->where('status', 'attended')->count(),
                'queue_waiting' => Queue::where('queue_date', Carbon::today())
                    ->where('status', 'waiting')->count(),
                'queue_attending' => Queue::where('queue_date', Carbon::today())
                    ->where('status', 'attending')->count(),
                'queue_no_show' => Queue::where('queue_date', Carbon::today())
                    ->where('status', 'no_show')->count(),
            ]
        ];

        return response()->json($data);
    }

    /**
     * Get patient demographics and statistics
     */
    public function patientAnalytics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        $data = [
            // Gender distribution
            'gender_distribution' => Patient::select('gender', DB::raw('count(*) as count'))
                ->groupBy('gender')
                ->get(),

            // Age distribution
            'age_distribution' => Patient::select(
                DB::raw('CASE
                    WHEN CAST(age AS UNSIGNED) < 18 THEN "Under 18"
                    WHEN CAST(age AS UNSIGNED) BETWEEN 18 AND 30 THEN "18-30"
                    WHEN CAST(age AS UNSIGNED) BETWEEN 31 AND 50 THEN "31-50"
                    WHEN CAST(age AS UNSIGNED) BETWEEN 51 AND 70 THEN "51-70"
                    ELSE "Over 70"
                END as age_group'),
                DB::raw('count(*) as count')
            )->groupBy('age_group')->get(),

            // Civil status distribution
            'civil_status_distribution' => Patient::select('civil_status', DB::raw('count(*) as count'))
                ->groupBy('civil_status')
                ->get(),

            // Registration trends
            'registration_trends' => Patient::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get(),
        ];

        return response()->json($data);
    }

    /**
     * Get queue analytics and performance metrics
     */
    public function queueAnalytics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        $data = [
            // Queue status distribution
            'status_distribution' => Queue::select('status', DB::raw('count(*) as count'))
                ->whereBetween('queue_date', [$startDate, $endDate])
                ->groupBy('status')
                ->get(),

            // Daily queue trends
            'daily_trends' => Queue::select(
                DB::raw('DATE(queue_date) as date'),
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN status = "attended" THEN 1 ELSE 0 END) as attended'),
                DB::raw('SUM(CASE WHEN status = "no_show" THEN 1 ELSE 0 END) as no_show')
            )
            ->whereBetween('queue_date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get(),

            // Peak hours analysis
            'peak_hours' => Queue::select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('count(*) as count')
            )
            ->whereBetween('queue_date', [$startDate, $endDate])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get(),

            // Average waiting time (if served_at and created_at are available)
            'waiting_time_stats' => Queue::whereNotNull('served_at')
                ->whereBetween('queue_date', [$startDate, $endDate])
                ->select(
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, served_at)) as avg_wait_minutes'),
                    DB::raw('MIN(TIMESTAMPDIFF(MINUTE, created_at, served_at)) as min_wait_minutes'),
                    DB::raw('MAX(TIMESTAMPDIFF(MINUTE, created_at, served_at)) as max_wait_minutes')
                )
                ->first(),
        ];

        return response()->json($data);
    }

    /**
     * Get medical records analytics
     */
    public function medicalRecordsAnalytics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        $data = [
            // Visit trends
            'visit_trends' => MedicalRecord::select(
                DB::raw('DATE(visit_date) as date'),
                DB::raw('count(*) as count')
            )
            ->whereBetween('visit_date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get(),

            // Top doctors by visits
            'top_doctors' => MedicalRecord::select(
                'doctor_name',
                DB::raw('count(*) as visit_count')
            )
            ->whereBetween('visit_date', [$startDate, $endDate])
            ->groupBy('doctor_name')
            ->orderBy('visit_count', 'desc')
            ->limit(10)
            ->get(),

            // Top diagnoses
            'top_diagnoses' => MedicalRecord::select(
                'diagnosis',
                DB::raw('count(*) as diagnosis_count')
            )
            ->whereNotNull('diagnosis')
            ->where('diagnosis', '!=', '')
            ->whereBetween('visit_date', [$startDate, $endDate])
            ->groupBy('diagnosis')
            ->orderBy('diagnosis_count', 'desc')
            ->limit(15)
            ->get(),

            // Diagnosis categories (basic classification)
            'diagnosis_categories' => MedicalRecord::select(
                DB::raw('CASE
                    WHEN LOWER(diagnosis) LIKE "%fever%" OR LOWER(diagnosis) LIKE "%flu%" OR LOWER(diagnosis) LIKE "%cold%" THEN "Respiratory/Infectious"
                    WHEN LOWER(diagnosis) LIKE "%hypertension%" OR LOWER(diagnosis) LIKE "%blood pressure%" OR LOWER(diagnosis) LIKE "%heart%" THEN "Cardiovascular"
                    WHEN LOWER(diagnosis) LIKE "%diabetes%" OR LOWER(diagnosis) LIKE "%sugar%" OR LOWER(diagnosis) LIKE "%glucose%" THEN "Endocrine/Metabolic"
                    WHEN LOWER(diagnosis) LIKE "%headache%" OR LOWER(diagnosis) LIKE "%migraine%" OR LOWER(diagnosis) LIKE "%pain%" THEN "Neurological/Pain"
                    WHEN LOWER(diagnosis) LIKE "%injury%" OR LOWER(diagnosis) LIKE "%fracture%" OR LOWER(diagnosis) LIKE "%wound%" THEN "Trauma/Injury"
                    WHEN LOWER(diagnosis) LIKE "%checkup%" OR LOWER(diagnosis) LIKE "%check up%" OR LOWER(diagnosis) LIKE "%routine%" THEN "Routine/Preventive"
                    ELSE "Other"
                END as category'),
                DB::raw('count(*) as count')
            )
            ->whereNotNull('diagnosis')
            ->where('diagnosis', '!=', '')
            ->whereBetween('visit_date', [$startDate, $endDate])
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get(),

            // Records with PDF attachments
            'pdf_attachment_stats' => [
                'total_records' => MedicalRecord::whereBetween('visit_date', [$startDate, $endDate])->count(),
                'records_with_pdf' => MedicalRecord::whereNotNull('pdf_file_path')
                    ->whereBetween('visit_date', [$startDate, $endDate])->count(),
                'pdf_attachment_rate' => MedicalRecord::whereBetween('visit_date', [$startDate, $endDate])->count() > 0 ?
                    round((MedicalRecord::whereNotNull('pdf_file_path')
                        ->whereBetween('visit_date', [$startDate, $endDate])->count() /
                        MedicalRecord::whereBetween('visit_date', [$startDate, $endDate])->count()) * 100, 2) : 0
            ],

            // Monthly visit distribution
            'monthly_distribution' => MedicalRecord::select(
                DB::raw('YEAR(visit_date) as year'),
                DB::raw('MONTH(visit_date) as month'),
                DB::raw('count(*) as count')
            )
            ->whereBetween('visit_date', [$startDate, $endDate])
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
        ];

        return response()->json($data);
    }

    /**
     * Get pre-registration analytics
     */
    public function preRegistrationAnalytics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        $data = [
            // Status distribution
            'status_distribution' => PreRegistration::select('status', DB::raw('count(*) as count'))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('status')
                ->get(),

            // Approval trends
            'approval_trends' => PreRegistration::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved'),
                DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get(),

            // Conversion rate (pre-registration to patient)
            'conversion_stats' => [
                'total_pre_registrations' => PreRegistration::whereBetween('created_at', [$startDate, $endDate])->count(),
                'approved_pre_registrations' => PreRegistration::where('status', 'approved')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
                'approval_rate' => PreRegistration::whereBetween('created_at', [$startDate, $endDate])->count() > 0 ?
                    round((PreRegistration::where('status', 'approved')
                        ->whereBetween('created_at', [$startDate, $endDate])->count() /
                        PreRegistration::whereBetween('created_at', [$startDate, $endDate])->count()) * 100, 2) : 0
            ]
        ];

        return response()->json($data);
    }

    /**
     * Export reports data as CSV
     */
    public function exportData(Request $request): JsonResponse
    {
        $type = $request->get('type', 'dashboard');
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', Carbon::now()->toDateString());

        switch ($type) {
            case 'patients':
                $data = Patient::select('full_name', 'gender', 'age', 'civil_status', 'contact_number', 'created_at')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->get();
                break;
            case 'medical_records':
                $data = MedicalRecord::with('patient')
                    ->whereBetween('visit_date', [$startDate, $endDate])
                    ->get()
                    ->map(function ($record) {
                        return [
                            'patient_name' => $record->patient->full_name ?? 'Unknown',
                            'visit_date' => $record->visit_date,
                            'doctor_name' => $record->doctor_name,
                            'diagnosis' => $record->diagnosis,
                            'treatment' => $record->treatment,
                            'has_pdf' => $record->pdf_file_path ? 'Yes' : 'No'
                        ];
                    });
                break;
            case 'queue':
                $data = Queue::with('patient')
                    ->whereBetween('queue_date', [$startDate, $endDate])
                    ->get()
                    ->map(function ($queue) {
                        return [
                            'queue_number' => $queue->queue_number,
                            'patient_name' => $queue->patient->full_name ?? 'Unknown',
                            'reason_for_visit' => $queue->reason_for_visit,
                            'status' => $queue->status,
                            'queue_date' => $queue->queue_date,
                            'created_at' => $queue->created_at
                        ];
                    });
                break;
            default:
                return response()->json(['error' => 'Invalid export type'], 400);
        }

        return response()->json([
            'data' => $data,
            'filename' => $type . '_report_' . $startDate . '_to_' . $endDate . '.csv'
        ]);
    }
}
