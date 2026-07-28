<?php

namespace Database\Seeders;

use App\Models\LandingSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * After schema changes, reset with:
     *   php artisan migrate:fresh --seed
     * (or via Docker: docker compose exec app php artisan migrate:fresh --seed)
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@vellum.edu'],
            [
                'name' => 'Admin User',
                'password' => 'password',
                'email_verified_at' => now(),
                'phone' => '+977 9800000000',
                'role' => 'Administrator',
                'institution' => 'Vellum LMS',
                'notify_fees' => true,
                'notify_stock' => true,
                'notify_absences' => true,
            ]
        );

        LandingSetting::query()->firstOrCreate(
            ['id' => LandingSetting::SINGLETON_ID],
            ['content' => LandingSetting::defaultContent()]
        );
    }
}
