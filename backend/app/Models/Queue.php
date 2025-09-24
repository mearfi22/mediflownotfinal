<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Queue extends Model
{
    protected $table = 'queue';
    
    protected $fillable = [
        'queue_number',
        'patient_id',
        'reason_for_visit',
        'status',
        'called_at',
        'served_at',
        'queue_date'
    ];

    protected $casts = [
        'called_at' => 'datetime',
        'served_at' => 'datetime',
        'queue_date' => 'date',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public static function getNextQueueNumber($date = null)
    {
        $date = $date ?? Carbon::today();
        $lastQueue = static::where('queue_date', $date)
            ->orderBy('queue_number', 'desc')
            ->first();
        
        return $lastQueue ? $lastQueue->queue_number + 1 : 1;
    }
}
