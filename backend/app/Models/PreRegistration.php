<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreRegistration extends Model
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
        'status',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'approved_at' => 'datetime',
    ];

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function toPatientArray(): array
    {
        return [
            'full_name' => $this->full_name,
            'date_of_birth' => $this->date_of_birth,
            'gender' => $this->gender,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'civil_status' => $this->civil_status,
            'religion' => $this->religion,
            'philhealth_id' => $this->philhealth_id,
            'reason_for_visit' => $this->reason_for_visit,
        ];
    }
}
