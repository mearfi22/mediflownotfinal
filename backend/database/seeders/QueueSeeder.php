<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Queue;
use App\Models\Patient;
use Carbon\Carbon;

class QueueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = Patient::all();
        $today = Carbon::today();
        
        // Create queue entries for today
        $queueData = [
            [
                'queue_number' => 1,
                'patient_id' => $patients[0]->id,
                'reason_for_visit' => 'Regular checkup',
                'status' => 'served',
                'queue_date' => $today,
                'called_at' => $today->copy()->addHours(8),
                'served_at' => $today->copy()->addHours(8)->addMinutes(30),
            ],
            [
                'queue_number' => 2,
                'patient_id' => $patients[1]->id,
                'reason_for_visit' => 'Fever and cough',
                'status' => 'serving',
                'queue_date' => $today,
                'called_at' => $today->copy()->addHours(8)->addMinutes(45),
            ],
            [
                'queue_number' => 3,
                'patient_id' => $patients[2]->id,
                'reason_for_visit' => 'Back pain consultation',
                'status' => 'waiting',
                'queue_date' => $today,
            ],
            [
                'queue_number' => 4,
                'patient_id' => $patients[3]->id,
                'reason_for_visit' => 'Hypertension follow-up',
                'status' => 'waiting',
                'queue_date' => $today,
            ],
            [
                'queue_number' => 5,
                'patient_id' => $patients[4]->id,
                'reason_for_visit' => 'Diabetes consultation',
                'status' => 'waiting',
                'queue_date' => $today,
            ],
        ];

        foreach ($queueData as $queue) {
            Queue::create($queue);
        }
    }
}
