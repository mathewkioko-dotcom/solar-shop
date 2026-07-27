<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_category_routes_are_protected(): void
    {
        $this->getJson('/api/admin/categories')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => User::ROLE_CUSTOMER]));
        $this->getJson('/api/admin/categories')->assertForbidden();
    }

    public function test_admin_can_create_update_and_list_categories(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => User::ROLE_ADMIN]));

        $category = $this->postJson('/api/admin/categories', [
            'name' => 'Solar Batteries',
            'slug' => 'solar-batteries',
            'description' => 'Storage products',
            'display_order' => 2,
            'is_active' => true,
        ])->assertCreated()->json('data');

        $this->patchJson("/api/admin/categories/{$category['id']}", [
            'name' => 'Battery Storage',
        ])->assertOk()->assertJsonPath('data.name', 'Battery Storage');

        $this->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.products_count', 0);
    }

    public function test_assigned_category_cannot_be_archived_and_public_list_is_active_only(): void
    {
        $active = Category::query()->create(['name' => 'Active', 'slug' => 'active']);
        Category::query()->create(['name' => 'Hidden', 'slug' => 'hidden', 'is_active' => false]);
        Product::query()->create([
            'category_id' => $active->id,
            'name' => 'Assigned product',
            'slug' => 'assigned-product',
            'price' => 1000,
            'stock' => 2,
        ]);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'active');

        Sanctum::actingAs(User::factory()->create(['role' => User::ROLE_ADMIN]));
        $this->deleteJson("/api/admin/categories/{$active->id}")
            ->assertConflict()
            ->assertJsonPath('message', 'This category cannot be archived while products are assigned.');
    }
}
