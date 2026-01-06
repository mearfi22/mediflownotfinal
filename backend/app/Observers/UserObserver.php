<?php

namespace App\Observers;

use App\Models\User;
use App\Traits\LogsActivity;

class UserObserver
{
    use LogsActivity;

    public function created(User $user): void
    {
        self::logActivity(
            'created',
            'User',
            $user->id,
            "Created user account: {$user->name} ({$user->role})",
            ['user' => $user->only(['id', 'name', 'email', 'role'])]
        );
    }

    public function updated(User $user): void
    {
        $changes = $user->getChanges();
        $original = $user->getRawOriginal();

        // Don't log password changes in the audit log
        unset($changes['password'], $original['password']);

        if (empty($changes)) {
            return;
        }

        self::logActivity(
            'updated',
            'User',
            $user->id,
            "Updated user account: {$user->name}",
            [
                'before' => array_intersect_key($original, $changes),
                'after' => $changes
            ]
        );
    }

    public function deleted(User $user): void
    {
        self::logActivity(
            'deleted',
            'User',
            $user->id,
            "Deleted user account: {$user->name} ({$user->role})",
            ['user' => $user->only(['id', 'name', 'email', 'role'])]
        );
    }
}
