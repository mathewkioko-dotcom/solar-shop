<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        try {
        DB::table('products')->truncate();
        DB::table('categories')->truncate();

        $inverters   = Category::create(['name' => 'Hybrid Inverters', 'slug' => 'hybrid-inverters']);
        $batteries   = Category::create(['name' => 'Solar Batteries', 'slug' => 'solar-batteries']);
        $panels      = Category::create(['name' => 'Solar Panels', 'slug' => 'solar-panels']);
        $controllers = Category::create(['name' => 'Charge Controllers', 'slug' => 'charge-controllers']);
        $cctv        = Category::create(['name' => 'CCTV Security Cameras', 'slug' => 'cctv-cameras']);
        $accessories = Category::create(['name' => 'Solar Accessories', 'slug' => 'solar-accessories']);

        $imagePath = public_path('images');
        if (!File::exists($imagePath)) return;

        $files = File::files($imagePath);

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $extension = strtolower($file->getExtension());

            if (!in_array($extension, ['webp', 'png', 'jpg', 'jpeg'])) continue;

            $cleanNameNoExt = str_replace('.'.$file->getExtension(), '', $filename);
            $cleanNameNoExt = urldecode($cleanNameNoExt); // Cleans up server text spaces (%20)

            $price = 1500.00;

            // BULLETPROOF PARSER ENGINE: Targets pricing text strictly behind "Ksh" or "KSh"
            if (preg_match('/[kK][sS][hH]\s*([\d,]+)/', $cleanNameNoExt, $matches)) {
                $rawPrice = str_replace(',', '', $matches[1]);
                if (is_numeric($rawPrice)) {
                    $price = (float)$rawPrice;
                }
            }
            // FALLBACK PARSER: Handles items without explicitly stated "Ksh" phrases
            elseif (preg_match('/([\d,]+)\s*$/', $cleanNameNoExt, $matches)) {
                $rawPrice = str_replace(',', '', $matches[1]);
                if (is_numeric($rawPrice)) {
                    $price = (float)$rawPrice;
                }
            }

            // Strips out the pricing footprint to leave item titles clean
            $displayName = preg_replace('/[kK][sS][hH]\s*[\d,.]+/', '', $cleanNameNoExt);
            $displayName = str_replace(['_', '-'], ' ', $displayName);
            $displayName = preg_replace('/\s+/', ' ', trim($displayName));

            $lowercaseName = strtolower($filename);
            $targetCategory = $accessories->id;

            if (Str::contains($lowercaseName, ['battery', 'batterry', 'batteries', 'lithium', 'gel', 'tubular', 'dry cell', 'byd', 'deye', 'storage'])) {
                $targetCategory = $batteries->id;
                if (Str::contains($lowercaseName, ['cable', 'wire'])) {
                    $targetCategory = $accessories->id;
                }
            } elseif (Str::contains($lowercaseName, ['inverter', 'inereter', 'psu'])) {
                $targetCategory = $inverters->id;
            } elseif (Str::contains($lowercaseName, ['pannel', 'panel', 'panels', 'jinko', 'mono'])) {
                $targetCategory = $panels->id;
            } elseif (Str::contains($lowercaseName, ['controller', 'regulator', 'pwm', 'mppt'])) {
                $targetCategory = $controllers->id;
            } elseif (Str::contains($lowercaseName, ['cctv', 'camera'])) {
                $targetCategory = $cctv->id;
            }

            Product::create([
                'category_id' => $targetCategory,
                'name'        => ucwords(strtolower($displayName)),
                'slug'        => Str::slug($displayName) . '-' . Str::random(5),
                'description' => 'Industrial tier-1 equipment layout solution optimized for commercial off-grid distribution networks.',
                'price'       => $price,
                'stock'       => rand(10, 50),
                'image_path'  => 'images/' . $filename,
                'is_featured' => false
            ]);
        }

        // Add a few explicit electric & lighting items if not present in images
        Product::create([
            'category_id' => $accessories->id,
            'name' => 'Solar Ceiling Light - Compact',
            'slug' => 'solar-ceiling-light-compact-' . Str::random(4),
            'description' => 'Low-power solar ceiling light suitable for homes and offices.',
            'price' => 1200.00,
            'stock' => 25,
            'image_path' => 'images/solar-ceiling-light.jpg',
            'is_featured' => false
        ]);

        Product::create([
            'category_id' => $accessories->id,
            'name' => 'Solar Flood Light - 50W',
            'slug' => 'solar-flood-light-50w-' . Str::random(4),
            'description' => 'High-output solar flood light for yards and security.',
            'price' => 4500.00,
            'stock' => 12,
            'image_path' => 'images/solar-flood-light.jpg',
            'is_featured' => false
        ]);

        Product::create([
            'category_id' => $accessories->id,
            'name' => 'Solar Charge Controller 20A (MPPT)',
            'slug' => 'solar-charge-controller-mppt-20a-' . Str::random(4),
            'description' => 'MPPT charge controller for improved efficiency.',
            'price' => 7200.00,
            'stock' => 8,
            'image_path' => 'images/charge-controller-20a.jpg',
            'is_featured' => false
        ]);

        Product::create([
            'category_id' => $accessories->id,
            'name' => 'LED Street Light - Solar Integrated',
            'slug' => 'led-street-light-solar-' . Str::random(4),
            'description' => 'All-in-one solar street light with motion sensor.',
            'price' => 9800.00,
            'stock' => 0,
            'image_path' => 'images/led-street-light.jpg',
            'is_featured' => false
        ]);
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }
}
