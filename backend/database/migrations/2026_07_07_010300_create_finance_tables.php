<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique(); // e.g. FIT-PAY-...
            $table->foreignId('payer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_milestone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('purpose', 30)->default('order'); // order|milestone|connects|subscription
            $table->decimal('amount', 12, 2);
            $table->string('currency', 5)->default('XAF');
            $table->string('provider', 30); // mtn_momo|orange_money|card|paypal|sandbox
            $table->string('phone_number', 30)->nullable();
            $table->string('provider_ref')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending|successful|failed|refunded
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('pending_balance', 14, 2)->default(0);
            $table->decimal('available_balance', 14, 2)->default(0);
            $table->decimal('total_earned', 14, 2)->default(0);
            $table->decimal('total_withdrawn', 14, 2)->default(0);
            $table->string('currency', 5)->default('XAF');
            $table->timestamps();
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30)->index();
            // escrow_hold|escrow_release|commission_fee|refund|withdrawal|withdrawal_fee|adjustment
            $table->string('bucket', 15)->default('available'); // pending|available
            $table->decimal('amount', 14, 2); // signed: credit > 0, debit < 0
            $table->string('currency', 5)->default('XAF');
            $table->string('reference', 40)->nullable();
            $table->nullableMorphs('source'); // Order | OrderMilestone | Withdrawal | Payment | Dispute
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('fee', 12, 2)->default(0);
            $table->string('currency', 5)->default('XAF');
            $table->string('method', 30); // mtn_momo|orange_money
            $table->string('account_number', 30);
            $table->string('account_name')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending|approved|paid|rejected|failed
            $table->string('admin_note')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('connect_packs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('connects');
            $table->decimal('price_usd', 8, 2);
            $table->decimal('price_xaf', 12, 2);
            $table->string('badge')->nullable(); // "Most Popular", "Best Value"...
            $table->string('savings_label')->nullable(); // "Save 33%"
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('connect_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20)->index(); // purchase|spend|refund|bonus|subscription
            $table->integer('amount'); // signed
            $table->unsignedInteger('balance_after');
            $table->nullableMorphs('source'); // Payment | Proposal | ...
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('currency', 5)->default('XAF');
            $table->string('period', 15)->default('monthly'); // monthly|yearly
            $table->unsignedInteger('connects_per_period')->default(0);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default('active')->index(); // active|cancelled|expired
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->timestamps();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('type', 15)->default('percent'); // percent|fixed
            $table->decimal('value', 12, 2);
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('connect_transactions');
        Schema::dropIfExists('connect_packs');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('payments');
    }
};
