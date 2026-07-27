<?php

namespace App\Console\Commands;

use App\Support\BrandCatalog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class SyncBrandAssets extends Command
{
    protected $signature = 'brands:sync-assets';

    protected $description = 'Copy tracked brand logos to public storage and idempotently sync the supported brand catalogue.';

    public function handle(): int
    {
        $sourceDirectory = database_path('seeders/assets/brands');
        $missing = collect(BrandCatalog::definitions())
            ->filter(fn (array $brand): bool => ! File::isFile($sourceDirectory.'/'.$brand['filename']))
            ->pluck('filename');

        if ($missing->isNotEmpty()) {
            $this->error('Brand asset sync stopped. Missing expected assets: '.$missing->join(', '));

            return self::FAILURE;
        }

        $copied = 0;
        $existing = 0;
        foreach (BrandCatalog::definitions() as $brand) {
            $destination = 'brands/logos/'.$brand['filename'];
            if (Storage::disk('public')->exists($destination)) {
                $existing++;
                continue;
            }

            Storage::disk('public')->put(
                $destination,
                File::get($sourceDirectory.'/'.$brand['filename'])
            );
            $copied++;
        }

        $database = BrandCatalog::syncDatabase();
        $this->info("Brand assets synchronized: {$copied} copied, {$existing} already present.");
        $this->info(
            "Brand records synchronized: {$database['created']} created, "
            ."{$database['updated']} updated, {$database['unchanged']} unchanged."
        );

        return self::SUCCESS;
    }
}
