<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'checkout_submission_id',
    'checkout_recovery_secret_hash',
    'order_number',
    'customer_email',
    'customer_phone',
    'delivery_first_name',
    'delivery_last_name',
    'delivery_phone',
    'delivery_county',
    'delivery_city',
    'delivery_street_address',
    'delivery_building_details',
    'delivery_postal_code',
    'delivery_instructions',
    'delivery_method',
    'payment_method',
    'payment_status',
    'order_status',
    'subtotal',
    'delivery_amount',
    'tax_amount',
    'total',
    'currency',
    'placed_at',
    'terms_accepted_at',
    'terms_version',
    'privacy_accepted_at',
    'privacy_version',
    'guest_access_token_hash',
    'guest_access_token_encrypted',
])]
class Order extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'placed_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'privacy_accepted_at' => 'datetime',
        ];
    }
}
