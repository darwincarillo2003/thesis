<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Seed roles first, then users
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
