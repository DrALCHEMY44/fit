<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('identifier'); // email or phone number
            $table->string('channel', 15)->default('email'); // email|sms|whatsapp
            $table->string('purpose', 25)->default('verification'); // verification|password_reset
            $table->string('code_hash');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
            $table->index(['identifier', 'purpose']);
        });

        Schema::create('verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 25)->default('identity'); // identity|business|skill
            $table->string('document_path');
            $table->string('document_type', 30)->nullable(); // national_id|passport|business_registration|...
            $table->text('note')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending|approved|rejected
            $table->string('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 60); // user.suspend|withdrawal.approve|dispute.resolve|...
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('audience', 20)->default('all'); // all|freelancers|clients
            $table->foreignId('sent_by')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('recipients_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->string('status', 20)->default('open')->index(); // open|pending|resolved|closed
            $table->string('priority', 15)->default('normal'); // low|normal|high
            $table->timestamps();
        });

        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_staff')->default(false);
            $table->timestamps();
        });

        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company_name');
            $table->string('location')->nullable();
            $table->string('duration')->nullable(); // e.g. "3 months"
            $table->string('stipend')->nullable(); // e.g. "XAF 100,000/mo"
            $table->boolean('is_paid')->default(false);
            $table->string('type', 15)->default('onsite'); // remote|onsite|hybrid
            $table->json('skills')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 15)->default('open')->index(); // open|closed
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('internship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('cover_letter')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('status', 20)->default('submitted')->index(); // submitted|reviewed|accepted|rejected
            $table->timestamps();
            $table->unique(['internship_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_applications');
        Schema::dropIfExists('internships');
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('broadcasts');
        Schema::dropIfExists('admin_audit_logs');
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('verification_requests');
        Schema::dropIfExists('otp_codes');
    }
};
