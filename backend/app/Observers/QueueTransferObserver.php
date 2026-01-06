<?php

namespace App\Observers;

use App\Models\QueueTransfer;
use App\Traits\LogsActivity;

class QueueTransferObserver
{
    use LogsActivity;

    public function created(QueueTransfer $transfer): void
    {
        $transfer->load('queue.patient', 'fromDoctor.user', 'toDoctor.user', 'fromDepartment', 'toDepartment');

        $patientUid = $transfer->queue->patient->patient_uid ?? 'No ID';
        $fromDoctor = $transfer->fromDoctor?->user?->name ?? 'No doctor';
        $toDoctor = $transfer->toDoctor?->user?->name ?? 'No doctor';
        $fromDept = $transfer->fromDepartment?->name ?? 'No department';
        $toDept = $transfer->toDepartment?->name ?? 'No department';

        $description = "Transferred queue for patient {$patientUid}: ";
        $description .= "From {$fromDoctor} ({$fromDept}) to {$toDoctor} ({$toDept})";

        if ($transfer->reason) {
            $description .= " - Reason: {$transfer->reason}";
        }

        self::logActivity(
            'transfer',
            'QueueTransfer',
            $transfer->id,
            $description,
            ['transfer' => $transfer->toArray()]
        );
    }
}
