<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // freelancer owner
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->string('currency', 5)->default('XAF');
            $table->unsignedSmallInteger('delivery_days');
            $table->unsignedTinyInteger('revisions_included')->default(1);
            $table->json('images')->nullable();
            $table->string('status', 20)->default('active')->index(); // active|paused|removed
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('orders_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->string('tier', 20); // basic|standard|premium
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedSmallInteger('delivery_days');
            $table->unsignedTinyInteger('revisions_included')->default(1);
            $table->json('features')->nullable();
            $table->timestamps();
            $table->unique(['service_id', 'tier']);
        });

        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('budget_type', 20)->default('fixed'); // fixed|hourly|negotiable
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->string('currency', 5)->default('XAF');
            $table->string('duration')->nullable(); // e.g. "3-6 months"
            $table->string('experience_level', 20)->default('intermediate'); // entry|intermediate|expert
            $table->string('urgency', 20)->default('normal'); // low|normal|high
            $table->string('mode', 20)->default('remote'); // remote|onsite|hybrid
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->date('deadline')->nullable();
            $table->string('status', 20)->default('draft')->index(); // draft|open|in_selection|contracted|closed|cancelled
            $table->unsignedTinyInteger('connects_cost')->default(6);
            $table->unsignedInteger('proposals_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('contact_flagged')->default(false); // anti-bypass moderation flag
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('job_post_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unique(['job_post_id', 'skill_id']);
        });

        Schema::create('job_post_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('size_kb')->nullable();
            $table->timestamps();
        });

        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 5)->default('XAF');
            $table->unsignedSmallInteger('delivery_days');
            $table->text('cover_letter');
            $table->string('status', 20)->default('pending')->index(); // pending|shortlisted|accepted|declined|withdrawn
            $table->unsignedTinyInteger('connects_spent')->default(0);
            $table->boolean('is_flagged')->default(false);
            $table->timestamps();
            $table->unique(['job_post_id', 'freelancer_id']);
        });

        Schema::create('proposal_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->string('due_label')->nullable(); // e.g. "2 weeks"
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('favoritable'); // JobPost | Service | User (freelancer)
            $table->timestamps();
            $table->unique(['user_id', 'favoritable_type', 'favoritable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('proposal_milestones');
        Schema::dropIfExists('proposals');
        Schema::dropIfExists('job_post_attachments');
        Schema::dropIfExists('job_post_skills');
        Schema::dropIfExists('job_posts');
        Schema::dropIfExists('service_packages');
        Schema::dropIfExists('services');
    }
};
