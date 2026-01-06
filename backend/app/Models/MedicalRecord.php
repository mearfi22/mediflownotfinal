<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'visit_date',
        'diagnosis',
        'treatment',
        'notes',
        'doctor_name',
        'pdf_file_path',
        // Admission fields
        'admission_date',
        'admission_time',
        'ward_room',
        'admitting_remarks',
        'admitting_diagnosis',
        'admitting_rod',
        'consultant_on_deck',
        'er_nurse_on_duty',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'admission_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
