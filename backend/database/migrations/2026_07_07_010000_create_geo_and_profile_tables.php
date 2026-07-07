<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 3)->unique();
            $table->string('currency_code', 5)->default('XAF');
            $table->string('phone_code', 8)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('region')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_fr');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('type', 20)->default('individual'); // individual|company
            $table->string('company_name')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('sector')->nullable();
            $table->string('address')->nullable();
            $table->string('website')->nullable();
            $table->text('about')->nullable();
            $table->boolean('payment_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->decimal('total_spent', 14, 2)->default(0);
            $table->unsignedInteger('jobs_posted_count')->default(0);
            $table->unsignedInteger('hires_count')->default(0);
            $table->timestamps();
        });

        Schema::create('freelancer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('bio')->nullable();
            $table->string('experience_level', 20)->default('entry'); // entry|intermediate|expert
            $table->decimal('hourly_rate', 12, 2)->nullable();
            $table->decimal('min_price', 12, 2)->nullable();
            $table->string('currency', 5)->default('XAF');
            $table->string('availability', 20)->default('available'); // available|busy|unavailable
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedTinyInteger('job_success_score')->default(0); // 0-100 (JSS)
            $table->unsignedInteger('completed_orders_count')->default(0);
            $table->decimal('total_earned', 14, 2)->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_top_rated')->default(false);
            $table->unsignedTinyInteger('profile_completion')->default(0); // 0-100
            $table->timestamps();
        });

        Schema::create('freelancer_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freelancer_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unique(['freelancer_profile_id', 'skill_id']);
        });

        Schema::create('portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('freelancer_profile_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('link_url')->nullable();
            $table->string('type', 20)->default('image'); // image|pdf|link
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_items');
        Schema::dropIfExists('freelancer_skills');
        Schema::dropIfExists('freelancer_profiles');
        Schema::dropIfExists('client_profiles');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('categories');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
        });
        Schema::dropIfExists('cities');
        Schema::dropIfExists('countries');
    }
};
