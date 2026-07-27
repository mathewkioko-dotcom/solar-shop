<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use App\Support\BrandCatalog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BrandCatalogWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_asset_sync_is_idempotent_and_preserves_admin_and_custom_data(): void
    {
        Storage::fake('public');
        $custom = Brand::factory()->create(['name' => 'Custom Brand', 'slug' => 'custom-brand']);
        $deye = Brand::factory()->create([
            'name' => 'Old DEYE',
            'slug' => 'deye',
            'description' => 'Administrator description',
            'website_url' => 'https://example.com/deye',
            'is_active' => false,
            'display_order' => 99,
        ]);

        $this->artisan('brands:sync-assets')
            ->expectsOutputToContain('Brand assets synchronized: 13 copied')
            ->assertSuccessful();
        $this->artisan('brands:sync-assets')
            ->expectsOutputToContain('Brand assets synchronized: 0 copied, 13 already present.')
            ->assertSuccessful();

        $this->assertSame(14, Brand::query()->count());
        $this->assertDatabaseHas('brands', ['id' => $custom->id, 'slug' => 'custom-brand']);
        $deye->refresh();
        $this->assertFalse($deye->is_active);
        $this->assertSame(99, $deye->display_order);
        $this->assertSame('Administrator description', $deye->description);
        $this->assertSame('https://example.com/deye', $deye->website_url);
        $this->assertSame('brands/logos/deye.svg', $deye->logo_path);
        Storage::disk('public')->assertExists('brands/logos/deye.svg');
    }

    public function test_public_listing_excludes_inactive_and_archived_and_returns_logo_url(): void
    {
        Storage::fake('public');
        $this->artisan('brands:sync-assets')->assertSuccessful();
        Brand::query()->where('slug', 'byd')->update(['is_active' => false]);
        Brand::query()->where('slug', 'sma')->firstOrFail()->delete();

        $response = $this->getJson('/api/brands')
            ->assertOk()
            ->assertJsonMissing(['slug' => 'byd'])
            ->assertJsonMissing(['slug' => 'sma'])
            ->assertJsonPath('data.0.slug', 'canadian-solar');

        $logoUrl = $response->json('data.0.logo_url');
        $this->assertIsString($logoUrl);
        $this->assertStringEndsWith('/storage/brands/logos/canadian-solar.png', $logoUrl);
    }

    public function test_admin_brand_filters_and_availability_action_work(): void
    {
        $active = Brand::factory()->create(['name' => 'Active', 'is_active' => true]);
        $inactive = Brand::factory()->create(['name' => 'Inactive', 'is_active' => false]);
        $archived = Brand::factory()->create(['name' => 'Archived', 'is_active' => false]);
        $archived->delete();
        $token = User::factory()->create(['role' => User::ROLE_ADMIN])
            ->createToken('admin')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/brands?status=active')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $active->id);
        $this->withToken($token)->getJson('/api/admin/brands?status=inactive')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $inactive->id);
        $this->withToken($token)->getJson('/api/admin/brands?status=archived')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $archived->id);

        $this->withToken($token)
            ->patchJson("/api/admin/brands/{$inactive->id}/active", ['is_active' => true])
            ->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    public function test_permanent_delete_requires_no_assigned_products(): void
    {
        $empty = Brand::factory()->create();
        $assigned = Brand::factory()->create();
        Product::query()->create($this->productAttributes('assigned-product', $assigned->id));
        $empty->delete();
        $assigned->delete();
        $token = User::factory()->create(['role' => User::ROLE_ADMIN])
            ->createToken('admin')->plainTextToken;

        $this->withToken($token)
            ->deleteJson("/api/admin/brands/{$assigned->id}/force", ['confirmation' => 'DELETE'])
            ->assertConflict();
        $this->withToken($token)
            ->deleteJson("/api/admin/brands/{$empty->id}/force", ['confirmation' => 'DELETE'])
            ->assertOk();
        $this->assertDatabaseMissing('brands', ['id' => $empty->id]);
    }

    public function test_product_assignment_command_matches_only_reviewed_unambiguous_names(): void
    {
        BrandCatalog::syncDatabase();
        $jinko = Product::query()->create($this->productAttributes('jinko-panel', null, 'Jinko Solar 600W Panel'));
        $deye = Product::query()->create($this->productAttributes('deye-inverter', null, 'Deye 5kW Hybrid Inverter'));
        $unknown = Product::query()->create($this->productAttributes('unknown-panel', null, 'Premium Mono Panel'));
        $ambiguous = Product::query()->create($this->productAttributes('ambiguous-kit', null, 'Deye BYD Storage Kit'));

        $this->artisan('products:assign-brands')
            ->expectsOutput('Assigned: 2')
            ->expectsOutput('Unmatched: 1')
            ->expectsOutput('Ambiguous (left unchanged): 1')
            ->assertSuccessful();

        $this->assertSame('jinko-solar', $jinko->refresh()->brand->slug);
        $this->assertSame('deye', $deye->refresh()->brand->slug);
        $this->assertNull($unknown->refresh()->brand_id);
        $this->assertNull($ambiguous->refresh()->brand_id);

        $this->artisan('products:assign-brands')
            ->expectsOutput('Assigned: 0')
            ->expectsOutput('Already assigned: 2')
            ->assertSuccessful();
    }

    /**
     * @return array<string, mixed>
     */
    private function productAttributes(
        string $slug,
        ?int $brandId,
        string $name = 'Test Product'
    ): array {
        $categoryId = DB::table('categories')->value('id')
            ?? DB::table('categories')->insertGetId([
                'name' => 'Solar Products',
                'slug' => 'solar-products',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        return [
            'category_id' => $categoryId,
            'brand_id' => $brandId,
            'name' => $name,
            'slug' => $slug,
            'price' => 1000,
            'stock' => 5,
        ];
    }
}
