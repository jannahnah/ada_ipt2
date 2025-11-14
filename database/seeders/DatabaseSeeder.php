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
        $this->call([
            // This ensures your initial data is always loaded
            InitialDataSeeder::class,
            // This ensures your users data is always loaded
            UserSeeder::class,
        ]);
    }
}
