<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Patient extends Model
{
    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'date_of_birth',
        'age',
        'gender',
        'birthplace',
        'nationality',
        'civil_status',
        'spouse_name',
        'religion',
        'occupation',
        'address',
        'contact_number',
        'philhealth_id',
        'reason_for_visit',
        'department_id',
        'doctor_id',
        'priority',
        'status',
        'patient_uid'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    protected $appends = [
        'full_name'
    ];

    // Generate a unique patient UID before creating
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($patient) {
            if (empty($patient->patient_uid)) {
                $patient->patient_uid = (string) Str::uuid();
            }
        });
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function queueEntries(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function getFullNameAttribute()
    {
        $middleInitial = $this->middle_name ? strtoupper(substr($this->middle_name, 0, 1)) . '.' : '';
        $fullName = trim($this->last_name . ', ' . $this->first_name . ' ' . $middleInitial);
        return $fullName ?: 'Unknown Patient';
    }
}
