<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );

        $this->call(BlogSeeder::class);

        // Seed default navigation menus
        \App\Domains\Setting\Models\Menu::create(['label' => 'Home', 'url' => '/', 'order' => 1]);
        \App\Domains\Setting\Models\Menu::create(['label' => 'Blogs', 'url' => '/blogs', 'order' => 2]);
        \App\Domains\Setting\Models\Menu::create(['label' => 'About', 'url' => '/about', 'order' => 3]);
        \App\Domains\Setting\Models\Menu::create(['label' => 'Services', 'url' => '/services', 'order' => 4]);
        \App\Domains\Setting\Models\Menu::create(['label' => 'Contact', 'url' => '/contact', 'order' => 5]);
    }
}
