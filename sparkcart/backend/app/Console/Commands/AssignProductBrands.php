<?php

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Console\Command;

class AssignProductBrands extends Command
{
    protected $signature = 'products:assign-brands';

    protected $description = 'Assign unbranded products using an explicit, reviewed manufacturer-name mapping.';

    /**
     * @var array<string, string>
     */
    private const PATTERNS = [
        'canadian-solar' => '/\bCanadian\s+Solar\b/i',
        'victron-energy' => '/\bVictron(?:\s+Energy|\s+SmartSolar)?\b/i',
        'jinko-solar' => '/\bJinko(?:\s+Solar)?\b/i',
        'trina-solar' => '/\bTrina\s+Solar\b/i',
        'ja-solar' => '/\bJA\s+Solar\b/i',
        'pylontech' => '/\bPylontech\b/i',
        'sungrow' => '/\bSungrow\b/i',
        'growatt' => '/\bGrowatt\b/i',
        'huawei' => '/\bHuawei\b/i',
        'longi' => '/\bLONGi\b/i',
        'deye' => '/\bDeye\b/i',
        'byd' => '/\bBYD\b/i',
        'sma' => '/\bSMA\b/i',
    ];

    public function handle(): int
    {
        $brands = Brand::query()
            ->whereIn('slug', array_keys(self::PATTERNS))
            ->get()
            ->keyBy('slug');
        $missing = collect(array_keys(self::PATTERNS))->diff($brands->keys());
        if ($missing->isNotEmpty()) {
            $this->error('Brand assignment stopped. Run brands:sync-assets first. Missing: '.$missing->join(', '));

            return self::FAILURE;
        }

        $counts = [
            'assigned' => 0,
            'unmatched' => 0,
            'ambiguous' => 0,
            'already_assigned' => Product::query()->whereNotNull('brand_id')->count(),
        ];

        Product::query()
            ->whereNull('brand_id')
            ->select(['id', 'name'])
            ->orderBy('id')
            ->chunkById(100, function ($products) use ($brands, &$counts): void {
                foreach ($products as $product) {
                    $matches = collect(self::PATTERNS)
                        ->filter(fn (string $pattern): bool => preg_match($pattern, $product->name) === 1)
                        ->keys();

                    if ($matches->count() === 1) {
                        $product->update(['brand_id' => $brands[$matches->first()]->id]);
                        $counts['assigned']++;
                    } elseif ($matches->isEmpty()) {
                        $counts['unmatched']++;
                    } else {
                        $counts['ambiguous']++;
                    }
                }
            });

        $this->info("Assigned: {$counts['assigned']}");
        $this->line("Already assigned: {$counts['already_assigned']}");
        $this->line("Unmatched: {$counts['unmatched']}");
        $this->line("Ambiguous (left unchanged): {$counts['ambiguous']}");

        return self::SUCCESS;
    }
}
