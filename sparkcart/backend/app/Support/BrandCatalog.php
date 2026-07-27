<?php

namespace App\Support;

use App\Models\Brand;

final class BrandCatalog
{
    /**
     * @return array<int, array{name: string, slug: string, filename: string, description: string}>
     */
    public static function definitions(): array
    {
        return [
            ['name' => 'BYD', 'slug' => 'byd', 'filename' => 'byd.svg', 'description' => 'Battery and renewable-energy storage solutions.'],
            ['name' => 'Canadian Solar', 'slug' => 'canadian-solar', 'filename' => 'canadian-solar.png', 'description' => 'Solar photovoltaic modules and energy solutions.'],
            ['name' => 'DEYE', 'slug' => 'deye', 'filename' => 'deye.svg', 'description' => 'Solar inverters and energy-storage technology.'],
            ['name' => 'Growatt', 'slug' => 'growatt', 'filename' => 'growatt.svg', 'description' => 'Distributed solar inverters and smart energy systems.'],
            ['name' => 'Huawei', 'slug' => 'huawei', 'filename' => 'huawei.svg', 'description' => 'Digital power and intelligent solar solutions.'],
            ['name' => 'JA Solar', 'slug' => 'ja-solar', 'filename' => 'ja-solar.svg', 'description' => 'High-performance photovoltaic products.'],
            ['name' => 'Jinko Solar', 'slug' => 'jinko-solar', 'filename' => 'jinko-solar.jpg', 'description' => 'Photovoltaic modules for residential and commercial systems.'],
            ['name' => 'LONGi', 'slug' => 'longi', 'filename' => 'longi.svg', 'description' => 'High-efficiency monocrystalline solar technology.'],
            ['name' => 'Pylontech', 'slug' => 'pylontech', 'filename' => 'pylontech.svg', 'description' => 'Lithium energy-storage systems.'],
            ['name' => 'SMA', 'slug' => 'sma', 'filename' => 'sma.svg', 'description' => 'Solar inverter and energy-management technology.'],
            ['name' => 'Sungrow', 'slug' => 'sungrow', 'filename' => 'sungrow.svg', 'description' => 'Solar inverters and renewable-energy systems.'],
            ['name' => 'Trina Solar', 'slug' => 'trina-solar', 'filename' => 'trina-solar.svg', 'description' => 'Photovoltaic modules and smart energy solutions.'],
            ['name' => 'Victron Energy', 'slug' => 'victron-energy', 'filename' => 'victron-energy.svg', 'description' => 'Power conversion, charging and off-grid energy equipment.'],
        ];
    }

    /**
     * @return array{created: int, updated: int, unchanged: int}
     */
    public static function syncDatabase(): array
    {
        $counts = ['created' => 0, 'updated' => 0, 'unchanged' => 0];

        foreach (self::definitions() as $index => $definition) {
            $brand = Brand::withTrashed()->firstOrNew(['slug' => $definition['slug']]);
            $isNew = ! $brand->exists;

            if ($isNew) {
                $brand->fill([
                    'name' => $definition['name'],
                    'logo_path' => 'brands/logos/'.$definition['filename'],
                    'description' => $definition['description'],
                    'is_active' => true,
                    'display_order' => $index + 1,
                ]);
            } else {
                // Seed maintenance never changes availability, ordering or admin-authored copy.
                $brand->fill([
                    'name' => $definition['name'],
                    'logo_path' => 'brands/logos/'.$definition['filename'],
                ]);
            }

            if ($isNew) {
                $brand->save();
                $counts['created']++;
            } elseif ($brand->isDirty()) {
                $brand->save();
                $counts['updated']++;
            } else {
                $counts['unchanged']++;
            }
        }

        return $counts;
    }
}
