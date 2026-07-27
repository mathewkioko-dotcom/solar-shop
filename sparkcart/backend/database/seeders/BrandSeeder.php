<?php

namespace Database\Seeders;

use App\Support\BrandCatalog;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        BrandCatalog::syncDatabase();
    }
}
