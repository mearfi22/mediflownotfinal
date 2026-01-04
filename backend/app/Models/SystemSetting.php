<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'hospital_name',
        'hospital_address',
        'hospital_phone',
        'hospital_email',
        'hospital_logo',
        'working_hours_start',
        'working_hours_end',
        'average_consultation_minutes',
        'timezone',
        'auto_approve_preregistration',
        'queue_number_prefix',
    ];

    protected $casts = [
        'auto_approve_preregistration' => 'boolean',
        'average_consultation_minutes' => 'integer',
    ];
}
