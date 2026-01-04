<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class QueueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today());

        $queue = Queue::with(['patient', 'department', 'doctor'])
            ->whereDate('queue_date', $date)
            ->orderByRaw("FIELD(priority, 'emergency', 'senior', 'pwd', 'regular')")
            ->orderBy('queue_number')
            ->get();

        return response()->json($queue);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'reason_for_visit' => 'required|string',
            'queue_date' => 'nullable|date',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'priority' => 'nullable|in:regular,senior,pwd,emergency',
        ]);

        $queueDate = $validated['queue_date'] ?? Carbon::today();
        $queueNumber = Queue::getNextQueueNumber($queueDate);
        $priority = $validated['priority'] ?? 'regular';

        $queue = Queue::create([
            'queue_number' => $queueNumber,
            'patient_id' => $validated['patient_id'],
            'reason_for_visit' => $validated['reason_for_visit'],
            'queue_date' => $queueDate,
            'department_id' => $validated['department_id'] ?? null,
            'doctor_id' => $validated['doctor_id'] ?? null,
            'priority' => $priority,
            'status' => 'waiting',
        ]);

        // Calculate estimated wait time
        $this->calculateEstimatedWaitTime($queue);

        $queue->load(['patient', 'department', 'doctor']);

        return response()->json($queue, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Queue $queue): JsonResponse
    {
        $queue->load(['patient', 'department', 'doctor']);
        return response()->json($queue);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Queue $queue): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,attending,attended,skipped',
            'department_id' => 'nullable|exists:departments,id',
            'doctor_id' => 'nullable|exists:doctors,id',
            'priority' => 'nullable|in:regular,senior,pwd,emergency',
        ]);

        if ($validated['status'] === 'attending' && $queue->status !== 'attending') {
            $queue->called_at = now();
        } elseif ($validated['status'] === 'attended' && $queue->status !== 'attended') {
            $queue->served_at = now();
        }

        $queue->update($validated);

        // Recalculate wait times for waiting patients
        $this->recalculateWaitTimes($queue->queue_date);

        $queue->load(['patient', 'department', 'doctor']);

        return response()->json($queue);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Queue $queue): JsonResponse
    {
        $queue->delete();

        return response()->json(['message' => 'Queue entry deleted successfully']);
    }

    /**
     * Get queue statistics for dashboard
     */
    public function statistics(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today());

        $stats = [
            'total_patients_today' => Queue::whereDate('queue_date', $date)->count(),
            'now_serving' => Queue::with(['patient', 'department', 'doctor'])
                ->whereDate('queue_date', $date)
                ->where('status', 'attending')
                ->first(),
            'served' => Queue::whereDate('queue_date', $date)->where('status', 'attended')->count(),
            'skipped' => Queue::whereDate('queue_date', $date)->where('status', 'skipped')->count(),
            'waiting' => Queue::whereDate('queue_date', $date)->where('status', 'waiting')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get queue display data for public screen
     */
    public function display(Request $request): JsonResponse
    {
        $date = $request->get('date', Carbon::today());

        $nowServing = Queue::with(['patient', 'department', 'doctor'])
            ->whereDate('queue_date', $date)
            ->where('status', 'attending')
            ->orderByRaw("FIELD(priority, 'emergency', 'senior', 'pwd', 'regular')")
            ->first();

        $nextFive = Queue::with(['patient', 'department', 'doctor'])
            ->whereDate('queue_date', $date)
            ->where('status', 'waiting')
            ->orderByRaw("FIELD(priority, 'emergency', 'senior', 'pwd', 'regular')")
            ->orderBy('queue_number')
            ->take(5)
            ->get();

        return response()->json([
            'now_serving' => $nowServing,
            'next_five' => $nextFive,
        ]);
    }

    /**
     * Get departments for dropdown
     */
    public function getDepartments(): JsonResponse
    {
        $departments = Department::orderBy('name')->get();
        return response()->json($departments);
    }

    /**
     * Get doctors for dropdown (all or by department)
     */
    public function getDoctors(Request $request): JsonResponse
    {
        $departmentId = $request->get('department_id');

        $query = Doctor::with('department')->where('status', 'active');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $doctors = $query->orderBy('full_name')->get();
        return response()->json($doctors);
    }

    /**
     * Transfer queue to another doctor/department
     */
    public function transfer(Request $request, Queue $queue): JsonResponse
    {
        $validated = $request->validate([
            'to_doctor_id' => 'nullable|exists:doctors,id',
            'to_department_id' => 'nullable|exists:departments,id',
            'reason' => 'nullable|string',
        ]);

        $transfer = \App\Models\QueueTransfer::create([
            'queue_id' => $queue->id,
            'from_doctor_id' => $queue->doctor_id,
            'to_doctor_id' => $validated['to_doctor_id'] ?? null,
            'from_department_id' => $queue->department_id,
            'to_department_id' => $validated['to_department_id'] ?? null,
            'reason' => $validated['reason'] ?? null,
            'transferred_by' => auth()->id(),
        ]);

        $queue->update([
            'doctor_id' => $validated['to_doctor_id'] ?? $queue->doctor_id,
            'department_id' => $validated['to_department_id'] ?? $queue->department_id,
        ]);

        // Recalculate wait times
        $this->recalculateWaitTimes($queue->queue_date);

        $queue->load(['patient', 'department', 'doctor']);

        return response()->json([
            'queue' => $queue,
            'transfer' => $transfer,
        ]);
    }

    /**
     * Get transfer history for a queue
     */
    public function transferHistory(Queue $queue): JsonResponse
    {
        $transfers = \App\Models\QueueTransfer::with([
            'fromDoctor',
            'toDoctor',
            'fromDepartment',
            'toDepartment',
            'transferredBy',
        ])
            ->where('queue_id', $queue->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transfers);
    }

    /**
     * Calculate estimated wait time for a queue entry
     */
    private function calculateEstimatedWaitTime(Queue $queue): void
    {
        if (!$queue->doctor_id) {
            $queue->estimated_wait_minutes = null;
            $queue->save();
            return;
        }

        $doctor = Doctor::find($queue->doctor_id);
        $avgTime = $doctor->avg_consultation_minutes ?? 15;

        // Count patients ahead in queue (same doctor, waiting or attending)
        $patientsAhead = Queue::whereDate('queue_date', $queue->queue_date)
            ->where('doctor_id', $queue->doctor_id)
            ->whereIn('status', ['waiting', 'attending'])
            ->where(function ($query) use ($queue) {
                $query->where('queue_number', '<', $queue->queue_number)
                    ->orWhere(function ($q) use ($queue) {
                        $q->where('queue_number', '=', $queue->queue_number)
                            ->where('id', '<', $queue->id);
                    });
            })
            ->orderByRaw("FIELD(priority, 'emergency', 'senior', 'pwd', 'regular')")
            ->count();

        $queue->estimated_wait_minutes = $patientsAhead * $avgTime;
        $queue->save();
    }

    /**
     * Recalculate wait times for all waiting patients
     */
    private function recalculateWaitTimes(string $date): void
    {
        $waitingQueues = Queue::whereDate('queue_date', $date)
            ->where('status', 'waiting')
            ->get();

        foreach ($waitingQueues as $queue) {
            $this->calculateEstimatedWaitTime($queue);
        }
    }
}
