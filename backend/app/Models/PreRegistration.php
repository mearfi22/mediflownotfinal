<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreRegistration extends Model
{
    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'address',
        'contact_number',
        'sex',
        'civil_status',
        'spouse_name',
        'date_of_birth',
        'age',
        'birthplace',
        'nationality',
        'religion',
        'occupation',
        'reason_for_visit',
        'priority',
        'philhealth_id',
        'status',
        'approved_by',
        'approved_at',
        'department_id',
        'doctor_id'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'approved_at' => 'datetime',
    ];

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    public function toPatientArray(): array
    {
        return [
            'last_name' => $this->last_name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'date_of_birth' => $this->date_of_birth,
            'age' => $this->age,
            'gender' => $this->sex, // Convert 'sex' to 'gender'
            'birthplace' => $this->birthplace,
            'nationality' => $this->nationality,
            'civil_status' => $this->civil_status,
            'spouse_name' => $this->spouse_name,
            'religion' => $this->religion,
            'occupation' => $this->occupation,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'philhealth_id' => $this->philhealth_id,
            'reason_for_visit' => $this->reason_for_visit,
            'department_id' => $this->department_id,
            'doctor_id' => $this->doctor_id,
            'priority' => $this->priority ?? 'regular',
        ];
    }
}
