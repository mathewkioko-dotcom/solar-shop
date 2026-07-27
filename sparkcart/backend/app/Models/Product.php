<?php

namespace App\Models;

use App\Support\ManagedPublicFile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'model_number',
        'short_description',
        'description',
        'price',
        'compare_at_price',
        'stock',
        'low_stock_threshold',
        'image_path',
        'wattage',
        'capacity_ah',
        'voltage',
        'warranty',
        'datasheet_path',
        'is_featured',
        'is_active',
        'seo_title',
        'seo_description',
    ];

    /**
     * Get the category that owns the solar product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class)->withTrashed();
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class)
            ->orderBy('display_order')
            ->orderBy('id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)
            ->orderByDesc('is_primary')
            ->orderBy('display_order')
            ->orderBy('id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::forceDeleted(function (Product $product): void {
            $product->loadMissing('images');
            foreach ($product->images as $image) {
                ManagedPublicFile::delete($image->image_path);
            }
            ManagedPublicFile::delete($product->datasheet_path);
        });
    }
}
