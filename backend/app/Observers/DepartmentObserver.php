<?php

namespace App\Observers;

use App\Models\Department;
use App\Traits\LogsActivity;

class DepartmentObserver
{
    use LogsActivity;

    public function created(Department $department): void
    {
        self::logActivity(
            'created',
            'Department',
            $department->id,
            "Created department: {$department->name}",
            ['department' => $department->toArray()]
        );
    }

    public function updated(Department $department): void
    {
        $changes = $department->getChanges();
        $original = $department->getRawOriginal();

        self::logActivity(
            'updated',
            'Department',
            $department->id,
            "Updated department: {$department->name}",
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleted(Department $department): void
    {
        self::logActivity(
            'deleted',
            'Department',
            $department->id,
            "Deleted department: {$department->name}",
            ['department' => $department->toArray()]
        );
    }
}
