<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'queue_id',
        'from_doctor_id',
        'to_doctor_id',
        'from_department_id',
        'to_department_id',
        'reason',
        'transferred_by',
    ];

    public function queue()
    {
        return $this->belongsTo(Queue::class);
    }

    public function fromDoctor()
    {
        return $this->belongsTo(Doctor::class, 'from_doctor_id');
    }

    public function toDoctor()
    {
        return $this->belongsTo(Doctor::class, 'to_doctor_id');
    }

    public function fromDepartment()
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment()
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function transferredBy()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
