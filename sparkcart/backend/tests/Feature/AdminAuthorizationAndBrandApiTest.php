<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminAuthorizationAndBrandApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_routes_require_authentication(): void
    {
        $this->getJson('/api/admin/brands')->assertUnauthorized();
    }

    public function test_customers_cannot_access_admin_routes(): void
    {
        $customer = User::factory()->create();
        $this->withToken($customer->createToken('customer')->plainTextToken)
            ->getJson('/api/admin/brands')
            ->assertForbidden()
            ->assertJsonPath('message', 'Administrator access is required.');
    }

    public function test_admins_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->getJson('/api/admin/brands')
            ->assertOk();
    }

    public function test_existing_user_can_be_promoted_with_secure_command(): void
    {
        $user = User::factory()->create(['email' => 'owner@example.com']);

        $this->artisan('user:make-admin', ['email' => 'OWNER@example.com'])
            ->expectsOutput('owner@example.com was promoted to administrator.')
            ->assertSuccessful();

        $this->assertSame('admin', $user->refresh()->role);

        $this->artisan('user:make-admin', ['email' => 'missing@example.com'])
            ->expectsOutput('No user exists with email missing@example.com.')
            ->assertFailed();
    }

    public function test_admin_can_create_update_and_upload_brand_logo(): void
    {
        Storage::fake('public');
        $admin = $this->admin();

        $response = $this->withToken($admin->createToken('admin')->plainTextToken)
            ->post('/api/admin/brands', [
                'name' => 'Deye',
                'description' => 'Solar power electronics.',
                'website_url' => 'https://www.deye.com',
                'logo' => UploadedFile::fake()->create('deye.png', 20, 'image/png'),
            ], ['Accept' => 'application/json']);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Deye')
            ->assertJsonPath('data.slug', 'deye');

        $brand = Brand::query()->firstOrFail();
        Storage::disk('public')->assertExists($brand->logo_path);

        $this->withToken($admin->createToken('admin-update')->plainTextToken)
            ->patchJson("/api/admin/brands/{$brand->id}", [
                'name' => 'Deye Energy',
                'display_order' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Deye Energy')
            ->assertJsonPath('data.display_order', 2);
    }

    public function test_brand_validation_and_safe_archive_behavior(): void
    {
        $admin = $this->admin();
        $brand = Brand::factory()->create(['slug' => 'deye']);
        $other = Brand::factory()->create(['slug' => 'victron']);

        $this->withToken($admin->createToken('admin')->plainTextToken)
            ->patchJson("/api/admin/brands/{$other->id}", ['slug' => 'deye'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');

        $categoryId = $this->categoryId();
        Product::query()->create($this->productAttributes($categoryId, ['brand_id' => $brand->id]));

        $this->withToken($admin->createToken('admin-delete')->plainTextToken)
            ->deleteJson("/api/admin/brands/{$brand->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Brand archived safely because products are assigned to it.');

        $this->assertSoftDeleted($brand);
        $this->assertDatabaseHas('products', ['brand_id' => $brand->id]);

        $this->withToken($admin->createToken('admin-force')->plainTextToken)
            ->deleteJson("/api/admin/brands/{$brand->id}/force", ['confirmation' => 'DELETE'])
            ->assertConflict();
    }

    public function test_public_brand_listing_returns_only_active_non_archived_brands(): void
    {
        $active = Brand::factory()->create(['name' => 'Active', 'is_active' => true]);
        Brand::factory()->create(['name' => 'Inactive', 'is_active' => false]);
        $archived = Brand::factory()->create(['name' => 'Archived', 'is_active' => true]);
        $archived->delete();

        Product::query()->create($this->productAttributes($this->categoryId(), [
            'brand_id' => $active->id,
        ]));

        $this->getJson('/api/brands')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Active')
            ->assertJsonPath('data.0.products_count', 1);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function categoryId(): int
    {
        return (int) \DB::table('categories')->insertGetId([
            'name' => 'Batteries',
            'slug' => 'batteries',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function productAttributes(int $categoryId, array $overrides = []): array
    {
        return [
            'category_id' => $categoryId,
            'name' => 'Test Battery',
            'slug' => 'test-battery-'.uniqid(),
            'price' => 1000,
            'stock' => 5,
            ...$overrides,
        ];
    }
}
