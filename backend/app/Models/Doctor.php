<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $fillable = [
        'department_id',
        'full_name',
        'email',
        'phone',
        'status',
        'avg_consultation_minutes'
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function queueEntries(): HasMany
    {
        return $this->hasMany(Queue::class);
    }
}
