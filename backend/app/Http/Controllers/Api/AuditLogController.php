<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email,role');

        // Filter by user
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        // Filter by model type
        if ($request->has('model_type') && $request->model_type) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search description
        if ($request->has('search') && $request->search) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($logs);
    }

    /**
     * Get statistics about audit logs.
     */
    public function statistics(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        $totalLogs = AuditLog::whereBetween('created_at', [$startDate, $endDate])->count();

        $byAction = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->get();

        $byUser = AuditLog::with('user:id,name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $byModelType = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('model_type')
            ->selectRaw('model_type, COUNT(*) as count')
            ->groupBy('model_type')
            ->get();

        $recentActivity = AuditLog::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'total_logs' => $totalLogs,
            'by_action' => $byAction,
            'by_user' => $byUser,
            'by_model_type' => $byModelType,
            'recent_activity' => $recentActivity,
        ]);
    }
}
