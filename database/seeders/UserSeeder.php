<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get role IDs
        $coaRole = Role::where('role_name', 'coa')->first();
        $treasurerRole = Role::where('role_name', 'treasurer')->first();
        $auditorRole = Role::where('role_name', 'auditor')->first();
        
        // Create users with their profiles
        $users = [
            [
                'user' => [
                    'email' => 'coa@example.com',
                    'password' => Hash::make('password'),
                    'role_id' => $coaRole->role_id,
                ],
                'profile' => [
                    'first_name' => 'COA',
                    'middle_name' => 'Admin',
                    'last_name' => 'User',
                    'suffix' => '',
                ]
            ],
            [
                'user' => [
                    'email' => 'treasurer@example.com',
                    'password' => Hash::make('password'),
                    'role_id' => $treasurerRole->role_id,
                ],
                'profile' => [
                    'first_name' => 'Treasurer',
                    'middle_name' => 'Finance',
                    'last_name' => 'Manager',
                    'suffix' => '',
                ]
            ],
            [
                'user' => [
                    'email' => 'auditor@example.com',
                    'password' => Hash::make('password'),
                    'role_id' => $auditorRole->role_id,
                ],
                'profile' => [
                    'first_name' => 'Auditor',
                    'middle_name' => 'Financial',
                    'last_name' => 'Reviewer',
                    'suffix' => '',
                ]
            ],
        ];
        
        foreach ($users as $userData) {
            $user = User::create($userData['user']);
            
            // Create profile for the user
            $userData['profile']['user_id'] = $user->user_id;
            Profile::create($userData['profile']);
        }
    }
}
