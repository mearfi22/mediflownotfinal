<?php

namespace App\Observers;

use App\Models\Queue;
use App\Traits\LogsActivity;

class QueueObserver
{
    use LogsActivity;

    public function created(Queue $queue): void
    {
        $queue->load('patient', 'doctor.user');
        $patientUid = $queue->patient->patient_uid ?? 'No ID';
        $doctorName = $queue->doctor?->user?->name ?? "Doctor ID {$queue->doctor_id}";

        self::logActivity(
            'created',
            'Queue',
            $queue->id,
            "Added patient to queue: {$patientUid}, Doctor: {$doctorName}",
            ['queue' => $queue->toArray()]
        );
    }

    public function updated(Queue $queue): void
    {
        $changes = $queue->getChanges();
        $original = $queue->getRawOriginal();

        $queue->load('patient');
        $patientUid = $queue->patient->patient_uid ?? 'No ID';

        $statusChanged = isset($changes['status']);
        $description = $statusChanged
            ? "Queue status changed from {$original['status']} to {$changes['status']} for {$patientUid}"
            : "Updated queue entry for {$patientUid}";

        self::logActivity(
            'updated',
            'Queue',
            $queue->id,
            $description,
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleted(Queue $queue): void
    {
        $queue->load('patient');
        $patientUid = $queue->patient->patient_uid ?? 'No ID';

        self::logActivity(
            'deleted',
            'Queue',
            $queue->id,
            "Removed queue entry for {$patientUid}",
            ['queue' => $queue->toArray()]
        );
    }
}
