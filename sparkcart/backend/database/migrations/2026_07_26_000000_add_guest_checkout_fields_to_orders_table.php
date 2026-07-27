<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('user_id')->nullable()->change();
            $table->timestamp('terms_accepted_at')->nullable()->after('placed_at');
            $table->string('terms_version', 20)->nullable()->after('terms_accepted_at');
            $table->timestamp('privacy_accepted_at')->nullable()->after('terms_version');
            $table->string('privacy_version', 20)->nullable()->after('privacy_accepted_at');
            $table->char('guest_access_token_hash', 64)->nullable()->unique()->after('privacy_version');
            $table->text('guest_access_token_encrypted')->nullable()->after('guest_access_token_hash');
            $table->unique('checkout_submission_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique(['checkout_submission_id']);
            $table->dropUnique(['guest_access_token_hash']);
            $table->dropColumn([
                'terms_accepted_at',
                'terms_version',
                'privacy_accepted_at',
                'privacy_version',
                'guest_access_token_hash',
                'guest_access_token_encrypted',
            ]);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
