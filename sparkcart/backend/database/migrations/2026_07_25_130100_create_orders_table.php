<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->uuid('checkout_submission_id');
            $table->string('order_number', 32)->unique();
            $table->string('customer_email');
            $table->string('customer_phone', 20);
            $table->string('delivery_first_name', 100);
            $table->string('delivery_last_name', 100);
            $table->string('delivery_phone', 20);
            $table->string('delivery_county', 100);
            $table->string('delivery_city', 100);
            $table->string('delivery_street_address');
            $table->string('delivery_building_details')->nullable();
            $table->string('delivery_postal_code', 20)->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->string('delivery_method', 50);
            $table->string('payment_method', 50);
            $table->string('payment_status', 30)->default('pending');
            $table->string('order_status', 30)->default('pending');
            $table->decimal('subtotal', 14, 2);
            $table->decimal('delivery_amount', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total', 14, 2);
            $table->char('currency', 3)->default('KES');
            $table->timestamp('placed_at');
            $table->timestamps();

            $table->unique(['user_id', 'checkout_submission_id']);
            $table->index(['user_id', 'placed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
