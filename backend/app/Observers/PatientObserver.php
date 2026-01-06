<?php

namespace App\Observers;

use App\Models\Patient;
use App\Traits\LogsActivity;

class PatientObserver
{
    use LogsActivity;

    public function created(Patient $patient): void
    {
        // Refresh to get the patient_uid that was generated in the creating event
        $patient->refresh();

        self::logActivity(
            'created',
            'Patient',
            $patient->id,
            "Created patient: {$patient->first_name} {$patient->last_name}",
            ['patient' => $patient->toArray()]
        );
    }

    public function updated(Patient $patient): void
    {
        $changes = $patient->getChanges();
        $original = $patient->getRawOriginal();

        self::logActivity(
            'updated',
            'Patient',
            $patient->id,
            "Updated patient: {$patient->first_name} {$patient->last_name}",
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleting(Patient $patient): void
    {
        self::logActivity(
            'deleted',
            'Patient',
            $patient->id,
            "Deleted patient: {$patient->first_name} {$patient->last_name}",
            ['patient' => $patient->toArray()]
        );
    }
}
