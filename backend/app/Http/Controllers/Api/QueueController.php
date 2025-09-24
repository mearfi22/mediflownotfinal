<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use App\Models\Patient;
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
        
        $queue = Queue::with('patient')
            ->whereDate('queue_date', $date)
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
        ]);

        $queueDate = $validated['queue_date'] ?? Carbon::today();
        $queueNumber = Queue::getNextQueueNumber($queueDate);

        $queue = Queue::create([
            'queue_number' => $queueNumber,
            'patient_id' => $validated['patient_id'],
            'reason_for_visit' => $validated['reason_for_visit'],
            'queue_date' => $queueDate,
        ]);

        $queue->load('patient');
        
        return response()->json($queue, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Queue $queue): JsonResponse
    {
        $queue->load('patient');
        return response()->json($queue);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Queue $queue): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,serving,served,skipped',
        ]);

        if ($validated['status'] === 'serving' && $queue->status !== 'serving') {
            $queue->called_at = now();
        } elseif ($validated['status'] === 'served' && $queue->status !== 'served') {
            $queue->served_at = now();
        }

        $queue->update($validated);
        $queue->load('patient');
        
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
            'now_serving' => Queue::whereDate('queue_date', $date)->where('status', 'serving')->first(),
            'served' => Queue::whereDate('queue_date', $date)->where('status', 'served')->count(),
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
        
        $nowServing = Queue::with('patient')
            ->whereDate('queue_date', $date)
            ->where('status', 'serving')
            ->first();
            
        $nextThree = Queue::with('patient')
            ->whereDate('queue_date', $date)
            ->where('status', 'waiting')
            ->orderBy('queue_number')
            ->take(3)
            ->get();
            
        return response()->json([
            'now_serving' => $nowServing,
            'next_three' => $nextThree,
        ]);
    }
}
