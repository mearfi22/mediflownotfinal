<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $fillable = [
        'full_name',
        'date_of_birth',
        'gender',
        'address',
        'contact_number',
        'civil_status',
        'religion',
        'philhealth_id',
        'reason_for_visit',
        'status'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function queueEntries(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth->age;
    }
}
