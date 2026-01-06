<?php

namespace App\Observers;

use App\Models\PreRegistration;
use App\Traits\LogsActivity;

class PreRegistrationObserver
{
    use LogsActivity;

    public function created(PreRegistration $preReg): void
    {
        self::logActivity(
            'created',
            'PreRegistration',
            $preReg->id,
            "New pre-registration: {$preReg->first_name} {$preReg->last_name}",
            ['pre_registration' => $preReg->toArray()]
        );
    }

    public function updated(PreRegistration $preReg): void
    {
        $changes = $preReg->getChanges();
        $original = $preReg->getRawOriginal();

        $statusChanged = isset($changes['status']);
        $description = $statusChanged
            ? "Pre-registration status changed to {$changes['status']} for {$preReg->first_name} {$preReg->last_name}"
            : "Updated pre-registration for {$preReg->first_name} {$preReg->last_name}";

        self::logActivity(
            'updated',
            'PreRegistration',
            $preReg->id,
            $description,
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleted(PreRegistration $preReg): void
    {
        self::logActivity(
            'deleted',
            'PreRegistration',
            $preReg->id,
            "Deleted pre-registration: {$preReg->first_name} {$preReg->last_name}",
            ['pre_registration' => $preReg->toArray()]
        );
    }
}
