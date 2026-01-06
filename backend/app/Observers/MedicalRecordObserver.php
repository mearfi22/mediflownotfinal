<?php

namespace App\Observers;

use App\Models\MedicalRecord;
use App\Traits\LogsActivity;

class MedicalRecordObserver
{
    use LogsActivity;

    public function created(MedicalRecord $record): void
    {
        $record->load('patient');
        $patientUid = $record->patient->patient_uid ?? 'No ID';

        self::logActivity(
            'created',
            'MedicalRecord',
            $record->id,
            "Created medical record for patient: {$patientUid}",
            ['record' => $record->toArray()]
        );
    }

    public function updated(MedicalRecord $record): void
    {
        $changes = $record->getChanges();
        $original = $record->getRawOriginal();

        $record->load('patient');
        $patientUid = $record->patient->patient_uid ?? 'No ID';

        self::logActivity(
            'updated',
            'MedicalRecord',
            $record->id,
            "Updated medical record for patient: {$patientUid}",
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleted(MedicalRecord $record): void
    {
        $record->load('patient');
        $patientUid = $record->patient->patient_uid ?? 'No ID';

        self::logActivity(
            'deleted',
            'MedicalRecord',
            $record->id,
            "Deleted medical record for patient: {$patientUid}",
            ['record' => $record->toArray()]
        );
    }
}
