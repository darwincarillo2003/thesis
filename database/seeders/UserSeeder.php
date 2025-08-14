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
        $adminRole = Role::where('role_name', 'admin')->first();
        $coaRole = Role::where('role_name', 'coa')->first();
        $treasurerRole = Role::where('role_name', 'treasurer')->first();
        $auditorRole = Role::where('role_name', 'auditor')->first();
        
        // Create users with their profiles
        $users = [
            [
                'user' => [
                    'email' => 'admin@example.com',
                    'password' => Hash::make('password'),
                    'role_id' => $adminRole ? $adminRole->role_id : null,
                ],
                'profile' => [
                    'first_name' => 'Admin',
                    'middle_name' => '',
                    'last_name' => 'User',
                    'suffix' => '',
                ]
            ],
            [
                'user' => [
                    'email' => 'coa@example.com',
                    'password' => Hash::make('password'),
                    'role_id' => $coaRole ? $coaRole->role_id : null,
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
                    'role_id' => $treasurerRole ? $treasurerRole->role_id : null,
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
                    'role_id' => $auditorRole ? $auditorRole->role_id : null,
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
            $user = User::updateOrCreate(
                ['email' => $userData['user']['email']],
                [
                    'password' => $userData['user']['password'],
                    'role_id' => $userData['user']['role_id'],
                ]
            );

            // Create or update profile for the user
            Profile::updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'first_name' => $userData['profile']['first_name'],
                    'middle_name' => $userData['profile']['middle_name'],
                    'last_name' => $userData['profile']['last_name'],
                    'suffix' => $userData['profile']['suffix'],
                ]
            );
        }
    }
}
