<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Message threads between client and admin
        Schema::create('message_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('application_id')->nullable()->constrained()->onDelete('set null');
            $table->string('subject')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('client_has_unread')->default(false);
            $table->boolean('admin_has_unread')->default(false);
            $table->timestamps();
        });

        // Individual messages
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('message_threads')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('body');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Admin calendar tasks
        Schema::create('calendar_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('application_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('client_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'done'])->default('pending');
            $table->enum('task_type', ['document_review', 'policy_issuance', 'claim_processing', 'message_reply', 'other'])->default('other');
            $table->date('due_date');
            $table->time('due_time')->nullable();
            $table->boolean('is_checked')->default(false);
            $table->timestamps();
        });

        // Quotes (pre-registration quote requests)
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->text('property_details'); // JSON
            $table->decimal('estimated_premium', 12, 2)->nullable();
            $table->enum('status', ['pending', 'converted', 'declined'])->default('pending');
            $table->timestamps();
        });

        // FAQ entries
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('quotes');
        Schema::dropIfExists('calendar_tasks');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('message_threads');
    }
};
