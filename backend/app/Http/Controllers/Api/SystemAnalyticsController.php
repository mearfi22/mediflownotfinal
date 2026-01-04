<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSession;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Queue;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemAnalyticsController extends Controller
{
    /**
     * Get system analytics dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        return response()->json([
            'user_activity' => $this->getUserActivity($startDate, $endDate),
            'login_trends' => $this->getLoginTrends($startDate, $endDate),
            'system_usage' => $this->getSystemUsage($startDate, $endDate),
            'growth_metrics' => $this->getGrowthMetrics($startDate, $endDate),
            'active_users' => $this->getActiveUsers($startDate, $endDate),
        ]);
    }

    /**
     * Get user activity metrics.
     */
    private function getUserActivity($startDate, $endDate): array
    {
        $totalLogins = UserSession::whereBetween('login_at', [$startDate, $endDate])->count();

        $averageSessionDuration = UserSession::whereBetween('login_at', [$startDate, $endDate])
            ->whereNotNull('duration_seconds')
            ->avg('duration_seconds');

        $mostActiveUsers = UserSession::with('user:id,name,role')
            ->select('user_id', DB::raw('COUNT(*) as login_count'), DB::raw('SUM(duration_seconds) as total_duration'))
            ->whereBetween('login_at', [$startDate, $endDate])
            ->groupBy('user_id')
            ->orderBy('login_count', 'desc')
            ->limit(10)
            ->get();

        $inactiveUsers = User::whereDoesntHave('sessions', function ($query) use ($startDate) {
            $query->where('login_at', '>=', $startDate);
        })->count();

        return [
            'total_logins' => $totalLogins,
            'average_session_duration' => round($averageSessionDuration / 60, 2), // Convert to minutes
            'most_active_users' => $mostActiveUsers,
            'inactive_users_count' => $inactiveUsers,
        ];
    }

    /**
     * Get login trends (hourly and daily).
     */
    private function getLoginTrends($startDate, $endDate): array
    {
        // Daily login trend
        $dailyLogins = UserSession::whereBetween('login_at', [$startDate, $endDate])
            ->selectRaw('DATE(login_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Peak hours (hourly distribution)
        $peakHours = UserSession::whereBetween('login_at', [$startDate, $endDate])
            ->selectRaw('HOUR(login_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Busiest days of week
        $busiestDays = UserSession::whereBetween('login_at', [$startDate, $endDate])
            ->selectRaw('DAYNAME(login_at) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('count', 'desc')
            ->get();

        return [
            'daily_logins' => $dailyLogins,
            'peak_hours' => $peakHours,
            'busiest_days' => $busiestDays,
        ];
    }

    /**
     * Get system usage statistics.
     */
    private function getSystemUsage($startDate, $endDate): array
    {
        // Most performed actions
        $topActions = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Activity by model type
        $activityByModel = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('model_type')
            ->selectRaw('model_type, COUNT(*) as count')
            ->groupBy('model_type')
            ->orderBy('count', 'desc')
            ->get();

        return [
            'top_actions' => $topActions,
            'activity_by_model' => $activityByModel,
        ];
    }

    /**
     * Get growth metrics.
     */
    private function getGrowthMetrics($startDate, $endDate): array
    {
        // Patients growth
        $patientsGrowth = Patient::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Medical records growth
        $recordsGrowth = MedicalRecord::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Queue volume
        $queueVolume = Queue::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Users growth
        $usersGrowth = User::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'patients_growth' => $patientsGrowth,
            'records_growth' => $recordsGrowth,
            'queue_volume' => $queueVolume,
            'users_growth' => $usersGrowth,
        ];
    }

    /**
     * Get currently active users and recent activity.
     */
    private function getActiveUsers($startDate, $endDate): array
    {
        // Users by role
        $usersByRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->get();

        // Recent user registrations
        $recentUsers = User::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        // Last login per user
        $lastLogins = UserSession::select('user_id', DB::raw('MAX(login_at) as last_login'))
            ->groupBy('user_id')
            ->with('user:id,name,role')
            ->orderBy('last_login', 'desc')
            ->limit(10)
            ->get();

        return [
            'users_by_role' => $usersByRole,
            'recent_users' => $recentUsers,
            'last_logins' => $lastLogins,
        ];
    }
}
