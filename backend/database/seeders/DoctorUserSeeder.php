<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DoctorUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if doctor user already exists
        $existingUser = User::where('email', 'doctor@hospital.com')->first();

        if ($existingUser) {
            // Update existing user to doctor role
            $existingUser->update(['role' => 'doctor']);
            echo "Existing user updated to doctor role!\n";
        } else {
            // Create a doctor user account
            User::create([
                'name' => 'Dr. Sarah Davis',
                'email' => 'doctor@hospital.com',
                'password' => Hash::make('password'),
                'role' => 'doctor',
                'doctor_id' => 1, // Links to the first doctor in the doctors table
            ]);
            echo "Doctor user created successfully!\n";
        }

        echo "Email: doctor@hospital.com\n";
        echo "Password: password\n";
        echo "Role: doctor\n";
    }
}
