<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number', 30)->unique(); // e.g. FIT-ORD-2026-000123
            $table->foreignId('client_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('freelancer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('job_post_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('proposal_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('requirements')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 5)->default('XAF');
            $table->decimal('commission_rate', 5, 4)->default(0.10);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('freelancer_amount', 12, 2)->default(0);
            $table->unsignedSmallInteger('delivery_days')->nullable();
            $table->date('deadline')->nullable();
            $table->unsignedTinyInteger('revisions_allowed')->default(1);
            $table->unsignedTinyInteger('revisions_used')->default(0);
            $table->string('status', 25)->default('pending_payment')->index();
            // pending_payment|active|submitted|revision_requested|completed|cancelled|disputed
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending|funded|in_review|approved
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event', 50); // created|paid|milestone_funded|delivered|revision_requested|approved|completed|cancelled|disputed|...
            $table->string('note')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_milestone_id')->nullable()->constrained()->nullOnDelete();
            $table->text('message')->nullable();
            $table->json('files')->nullable(); // [{path,name,mime,size_kb}]
            $table->string('link_url')->nullable();
            $table->string('status', 25)->default('submitted')->index(); // submitted|approved|revision_requested
            $table->text('client_feedback')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewee_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->unsignedTinyInteger('rating_quality')->nullable();
            $table->unsignedTinyInteger('rating_communication')->nullable();
            $table->unsignedTinyInteger('rating_deadline')->nullable();
            $table->unsignedTinyInteger('rating_professionalism')->nullable();
            $table->text('comment')->nullable();
            $table->string('status', 20)->default('published')->index(); // published|hidden|flagged
            $table->timestamps();
            $table->unique(['order_id', 'reviewer_id']);
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('opened_by')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 30); // late_delivery|poor_quality|non_payment|behavior|fraud|other
            $table->text('description');
            $table->json('evidence')->nullable(); // [{path,name}]
            $table->string('status', 20)->default('open')->index(); // open|under_review|resolved|cancelled
            $table->string('resolution', 30)->nullable(); // refund_client|release_freelancer|partial_split|cancel_order
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->decimal('release_amount', 12, 2)->nullable();
            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('order_events');
        Schema::dropIfExists('order_milestones');
        Schema::dropIfExists('orders');
    }
};
