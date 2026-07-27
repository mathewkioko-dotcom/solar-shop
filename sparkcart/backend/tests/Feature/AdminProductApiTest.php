<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_complete_product_with_files_and_specifications(): void
    {
        Storage::fake('public');
        [$admin, $categoryId, $brand] = $this->fixtures();

        $response = $this->withToken($admin->createToken('admin')->plainTextToken)
            ->post('/api/admin/products', [
                'category_id' => $categoryId,
                'brand_id' => $brand->id,
                'name' => 'Deye 5kWh Battery',
                'sku' => 'DEYE-5KWH',
                'model_number' => 'RW-M6.1',
                'short_description' => 'Compact lithium storage.',
                'description' => 'Complete battery description.',
                'price' => '125000.00',
                'compare_at_price' => '130000.00',
                'stock' => 4,
                'low_stock_threshold' => 5,
                'warranty' => '10 years',
                'is_featured' => true,
                'is_active' => true,
                'specifications' => [[
                    'name' => 'Battery Capacity',
                    'value' => '5.12',
                    'unit' => 'kWh',
                    'display_order' => 1,
                ]],
                'images' => [UploadedFile::fake()->create('battery.jpg', 20, 'image/jpeg')],
                'datasheet' => UploadedFile::fake()->create('battery.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json']);

        $response
            ->assertCreated()
            ->assertJsonPath('data.sku', 'DEYE-5KWH')
            ->assertJsonPath('data.brand.name', $brand->name)
            ->assertJsonPath('data.specifications.0.name', 'Battery Capacity')
            ->assertJsonPath('data.images.0.is_primary', true);

        $product = Product::query()->with(['images', 'specifications'])->firstOrFail();
        $this->assertCount(1, $product->images);
        $this->assertCount(1, $product->specifications);
        $this->assertSame($product->images->first()->image_path, $product->image_path);
        Storage::disk('public')->assertExists($product->image_path);
        Storage::disk('public')->assertExists($product->datasheet_path);
    }

    public function test_admin_can_update_existing_product_without_losing_legacy_data(): void
    {
        [$admin, $categoryId, $brand] = $this->fixtures();
        $product = Product::query()->create($this->attributes($categoryId, [
            'image_path' => 'images/legacy-product.webp',
            'description' => 'Legacy description',
        ]));

        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->patchJson("/api/admin/products/{$product->id}", [
                'brand_id' => $brand->id,
                'price' => '2500.50',
                'specifications' => [
                    ['name' => 'Voltage', 'value' => '48', 'unit' => 'V', 'display_order' => 0],
                    ['name' => 'Warranty', 'value' => '5 years', 'display_order' => 1],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.image_path', 'images/legacy-product.webp')
            ->assertJsonCount(2, 'data.specifications');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'description' => 'Legacy description',
            'image_path' => 'images/legacy-product.webp',
            'brand_id' => $brand->id,
        ]);
    }

    public function test_price_stock_and_invalid_files_are_rejected(): void
    {
        [$admin, $categoryId] = $this->fixtures();
        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)->postJson('/api/admin/products', [
            ...$this->attributes($categoryId),
            'price' => -1,
            'stock' => -2,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['price', 'stock']);

        $product = Product::query()->create($this->attributes($categoryId));
        $this->withToken($token)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'image' => UploadedFile::fake()->create('malware.pdf', 10, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');

        $this->withToken($token)
            ->post('/api/admin/products/'.$product->id.'/datasheet', [
                'datasheet' => UploadedFile::fake()->create('not-a-pdf.jpg', 10, 'image/jpeg'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('datasheet');
    }

    public function test_gallery_management_enforces_one_primary_image(): void
    {
        Storage::fake('public');
        [$admin, $categoryId] = $this->fixtures();
        $product = Product::query()->create($this->attributes($categoryId));
        $token = $admin->createToken('admin')->plainTextToken;

        $first = $this->withToken($token)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'image' => UploadedFile::fake()->create('first.jpg', 20, 'image/jpeg'),
            ], ['Accept' => 'application/json'])
            ->assertCreated();
        $second = $this->withToken($token)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'image' => UploadedFile::fake()->create('second.png', 20, 'image/png'),
            ], ['Accept' => 'application/json'])
            ->assertCreated();

        $this->withToken($token)
            ->patchJson(
                "/api/admin/products/{$product->id}/images/{$second->json('data.id')}",
                ['alt_text' => 'Installed solar product', 'display_order' => 3]
            )
            ->assertOk()
            ->assertJsonPath('data.alt_text', 'Installed solar product')
            ->assertJsonPath('data.display_order', 3);

        $this->withToken($token)
            ->patchJson(
                "/api/admin/products/{$product->id}/images/{$second->json('data.id')}/primary"
            )
            ->assertOk();

        $this->assertSame(1, $product->images()->where('is_primary', true)->count());
        $this->assertSame($second->json('data.image_path'), $product->refresh()->image_path);

        $firstPath = $first->json('data.image_path');
        $this->withToken($token)
            ->deleteJson("/api/admin/products/{$product->id}/images/{$first->json('data.id')}")
            ->assertOk();
        Storage::disk('public')->assertMissing($firstPath);
    }

    public function test_datasheet_replacement_and_force_delete_clean_up_managed_files(): void
    {
        Storage::fake('public');
        [$admin, $categoryId] = $this->fixtures();
        $product = Product::query()->create($this->attributes($categoryId));
        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)->post('/api/admin/products/'.$product->id.'/images', [
            'image' => UploadedFile::fake()->create('product.webp', 20, 'image/webp'),
        ], ['Accept' => 'application/json'])->assertCreated();
        $this->withToken($token)->post('/api/admin/products/'.$product->id.'/datasheet', [
            'datasheet' => UploadedFile::fake()->create('first.pdf', 30, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertOk();
        $firstDatasheet = $product->refresh()->datasheet_path;

        $this->withToken($token)->post('/api/admin/products/'.$product->id.'/datasheet', [
            'datasheet' => UploadedFile::fake()->create('second.pdf', 30, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('public')->assertMissing($firstDatasheet);

        $product->refresh()->load('images');
        $imagePath = $product->images->first()->image_path;
        $datasheetPath = $product->datasheet_path;
        $product->delete();

        $this->withToken($token)
            ->deleteJson("/api/admin/products/{$product->id}/force", ['confirmation' => 'DELETE'])
            ->assertOk();

        Storage::disk('public')->assertMissing($imagePath);
        Storage::disk('public')->assertMissing($datasheetPath);
    }

    public function test_public_products_filter_by_active_brand_and_category_and_exclude_archived(): void
    {
        [, $categoryId, $deye] = $this->fixtures();
        $other = Brand::factory()->create(['slug' => 'other']);
        $visible = Product::query()->create($this->attributes($categoryId, [
            'name' => 'Visible Deye',
            'slug' => 'visible-deye',
            'brand_id' => $deye->id,
        ]));
        Product::query()->create($this->attributes($categoryId, [
            'name' => 'Other Brand',
            'slug' => 'other-brand',
            'brand_id' => $other->id,
        ]));
        Product::query()->create($this->attributes($categoryId, [
            'name' => 'Inactive Deye',
            'slug' => 'inactive-deye',
            'brand_id' => $deye->id,
            'is_active' => false,
        ]));
        $archived = Product::query()->create($this->attributes($categoryId, [
            'name' => 'Archived Deye',
            'slug' => 'archived-deye',
            'brand_id' => $deye->id,
        ]));
        $archived->delete();

        $this->getJson('/api/products?brand=deye&category=batteries')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id)
            ->assertJsonPath('data.0.brand.slug', 'deye')
            ->assertJsonPath('data.0.category.slug', 'batteries');
    }

    public function test_admin_listing_is_paginated_filters_low_stock_and_eager_loads_relations(): void
    {
        [$admin, $categoryId, $brand] = $this->fixtures();
        foreach (range(1, 6) as $index) {
            Product::query()->create($this->attributes($categoryId, [
                'name' => "Battery {$index}",
                'slug' => "battery-{$index}",
                'brand_id' => $brand->id,
                'stock' => $index,
                'low_stock_threshold' => 3,
            ]));
        }

        $token = $admin->createToken('admin')->plainTextToken;
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->withToken($token)
            ->getJson('/api/admin/products?low_stock=1&per_page=2&sort=stock&direction=asc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2);
        $twoProductQueryCount = count(DB::getQueryLog());

        DB::flushQueryLog();
        $response = $this->withToken($token)
            ->getJson('/api/admin/products?low_stock=1&per_page=6&sort=stock&direction=asc')
            ->assertOk()
            ->assertJsonCount(3, 'data');
        $sixProductQueryCount = count(DB::getQueryLog());
        DB::disableQueryLog();

        $this->assertLessThanOrEqual(
            $twoProductQueryCount + 1,
            $sixProductQueryCount,
            'Admin product listing query count grows with result count.'
        );
        $this->assertSame(1, $response->json('data.0.stock'));
    }

    public function test_product_can_be_archived_restored_and_status_fields_updated(): void
    {
        [$admin, $categoryId] = $this->fixtures();
        $product = Product::query()->create($this->attributes($categoryId));
        $token = $admin->createToken('admin')->plainTextToken;

        $this->withToken($token)
            ->patchJson("/api/admin/products/{$product->id}/stock", ['stock' => 0])
            ->assertOk()
            ->assertJsonPath('data.stock', 0);
        $this->withToken($token)
            ->patchJson("/api/admin/products/{$product->id}/featured", ['is_featured' => true])
            ->assertOk()
            ->assertJsonPath('data.is_featured', true);
        $this->withToken($token)
            ->patchJson("/api/admin/products/{$product->id}/active", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->withToken($token)->deleteJson("/api/admin/products/{$product->id}")->assertOk();
        $this->assertSoftDeleted($product);

        $this->withToken($token)
            ->postJson("/api/admin/products/{$product->id}/restore")
            ->assertOk();
        $this->assertNotSoftDeleted($product->refresh());
    }

    /**
     * @return array{User, int, Brand}
     */
    private function fixtures(): array
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $categoryId = (int) DB::table('categories')->insertGetId([
            'name' => 'Batteries',
            'slug' => 'batteries',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $brand = Brand::factory()->create(['name' => 'Deye', 'slug' => 'deye']);

        return [$admin, $categoryId, $brand];
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function attributes(int $categoryId, array $overrides = []): array
    {
        return [
            'category_id' => $categoryId,
            'name' => 'Test Product',
            'slug' => 'test-product-'.uniqid(),
            'price' => 1000,
            'stock' => 5,
            'is_active' => true,
            ...$overrides,
        ];
    }
}
