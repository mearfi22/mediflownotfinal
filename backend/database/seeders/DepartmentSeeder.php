<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'General Medicine'],
            ['name' => 'Pediatrics'],
            ['name' => 'Cardiology'],
            ['name' => 'Orthopedics'],
            ['name' => 'Dermatology'],
            ['name' => 'Gynecology'],
            ['name' => 'Ophthalmology'],
            ['name' => 'ENT (Ear, Nose, Throat)'],
            ['name' => 'Neurology'],
            ['name' => 'Psychiatry'],
        ];

        foreach ($departments as $department) {
            DB::table('departments')->updateOrInsert(
                ['name' => $department['name']],
                $department
            );
        }
    }
}
