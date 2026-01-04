<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, make sure we have departments
        $departments = DB::table('departments')->pluck('id', 'name')->toArray();

        $doctors = [
            [
                'department_id' => $departments['General Medicine'] ?? 1,
                'full_name' => 'Dr. John Smith',
                'email' => 'john.smith@hospital.com',
                'phone' => '+63 912 345 6789',
                'status' => 'active'
            ],
            [
                'department_id' => $departments['Pediatrics'] ?? 2,
                'full_name' => 'Dr. Emily Johnson',
                'email' => 'emily.johnson@hospital.com',
                'phone' => '+63 912 345 6790',
                'status' => 'active'
            ],
            [
                'department_id' => $departments['Cardiology'] ?? 3,
                'full_name' => 'Dr. Michael Brown',
                'email' => 'michael.brown@hospital.com',
                'phone' => '+63 912 345 6791',
                'status' => 'active'
            ],
            [
                'department_id' => $departments['Orthopedics'] ?? 4,
                'full_name' => 'Dr. Sarah Davis',
                'email' => 'sarah.davis@hospital.com',
                'phone' => '+63 912 345 6792',
                'status' => 'active'
            ],
            [
                'department_id' => $departments['Dermatology'] ?? 5,
                'full_name' => 'Dr. Robert Wilson',
                'email' => 'robert.wilson@hospital.com',
                'phone' => '+63 912 345 6793',
                'status' => 'active'
            ],
        ];

        foreach ($doctors as $doctor) {
            DB::table('doctors')->updateOrInsert(
                ['full_name' => $doctor['full_name']],
                array_merge($doctor, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
