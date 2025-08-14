<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create default roles (idempotent)
        $roles = [
            [
                'role_name' => 'admin',
                'description' => 'Administrator - Full system access to manage users, roles, and forms.'
            ],
            [
                'role_name' => 'coa',
                'description' => 'Commission on Audit - Responsible for auditing financial transactions and ensuring compliance with financial regulations.'
            ],
            [
                'role_name' => 'treasurer',
                'description' => 'Treasurer - Manages financial resources, processes payments, and maintains financial records.'
            ],
            [
                'role_name' => 'auditor',
                'description' => 'Auditor - Conducts internal audits, reviews financial statements, and ensures accuracy of financial reporting.'
            ]
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['role_name' => $role['role_name']],
                ['description' => $role['description']]
            );
        }
    }
}
