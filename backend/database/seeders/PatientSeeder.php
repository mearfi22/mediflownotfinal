<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Patient;
use Carbon\Carbon;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $patients = [
            [
                'full_name' => 'Juan dela Cruz',
                'date_of_birth' => Carbon::parse('1980-05-15'),
                'gender' => 'male',
                'address' => '123 Barangay Street, Rural Town, Province',
                'contact_number' => '09123456789',
                'civil_status' => 'Married',
                'religion' => 'Catholic',
                'philhealth_id' => 'PH123456789',
                'reason_for_visit' => 'Regular checkup',
            ],
            [
                'full_name' => 'Maria Santos',
                'date_of_birth' => Carbon::parse('1992-08-22'),
                'gender' => 'female',
                'address' => '456 Village Road, Rural Town, Province',
                'contact_number' => '09234567890',
                'civil_status' => 'Single',
                'religion' => 'Catholic',
                'philhealth_id' => 'PH234567890',
                'reason_for_visit' => 'Fever and cough',
            ],
            [
                'full_name' => 'Pedro Gonzales',
                'date_of_birth' => Carbon::parse('1975-12-03'),
                'gender' => 'male',
                'address' => '789 Farm Lane, Rural Town, Province',
                'contact_number' => '09345678901',
                'civil_status' => 'Married',
                'religion' => 'Protestant',
                'philhealth_id' => null,
                'reason_for_visit' => 'Back pain',
            ],
            [
                'full_name' => 'Ana Reyes',
                'date_of_birth' => Carbon::parse('1988-03-10'),
                'gender' => 'female',
                'address' => '321 Market Street, Rural Town, Province',
                'contact_number' => '09456789012',
                'civil_status' => 'Widowed',
                'religion' => 'Catholic',
                'philhealth_id' => 'PH345678901',
                'reason_for_visit' => 'Hypertension follow-up',
            ],
            [
                'full_name' => 'Carlos Mendoza',
                'date_of_birth' => Carbon::parse('1965-07-18'),
                'gender' => 'male',
                'address' => '654 Church Avenue, Rural Town, Province',
                'contact_number' => '09567890123',
                'civil_status' => 'Married',
                'religion' => 'Catholic',
                'philhealth_id' => 'PH456789012',
                'reason_for_visit' => 'Diabetes consultation',
            ],
        ];

        foreach ($patients as $patient) {
            Patient::create($patient);
        }
    }
}