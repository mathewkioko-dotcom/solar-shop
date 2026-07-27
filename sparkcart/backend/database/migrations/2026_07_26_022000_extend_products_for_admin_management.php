<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->foreignId('brand_id')->nullable()->after('category_id')
                ->constrained()->nullOnDelete();
            $table->string('sku')->nullable()->after('slug')->unique();
            $table->string('model_number')->nullable()->after('sku');
            $table->text('short_description')->nullable()->after('description');
            $table->decimal('compare_at_price', 10, 2)->nullable()->after('price');
            $table->unsignedInteger('low_stock_threshold')->default(5)->after('stock');
            $table->string('warranty')->nullable()->after('voltage');
            $table->string('datasheet_path')->nullable()->after('warranty');
            $table->boolean('is_active')->default(true)->after('is_featured')->index();
            $table->string('seo_title')->nullable()->after('is_active');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->softDeletes();

            $table->index('is_featured');
            $table->index('stock');
            $table->index(['is_active', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropIndex(['is_active', 'deleted_at']);
            $table->dropIndex(['stock']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['is_active']);
            $table->dropUnique(['sku']);
            $table->dropConstrainedForeignId('brand_id');
            $table->dropColumn([
                'sku',
                'model_number',
                'short_description',
                'compare_at_price',
                'low_stock_threshold',
                'warranty',
                'datasheet_path',
                'is_active',
                'seo_title',
                'seo_description',
                'deleted_at',
            ]);
        });
    }
};
