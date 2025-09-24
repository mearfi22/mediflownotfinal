<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@careconnect.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create default staff user
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@careconnect.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        // Create Dr. Garcia
        User::create([
            'name' => 'Dr. Maria Garcia',
            'email' => 'dr.garcia@careconnect.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);
    }
}