<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Products / insurance types
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('required_documents'); // JSON array of required doc names
            $table->text('basic_info_fields');  // JSON: fields needed for initial quote
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Client applications (policy applications)
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->string('reference_number')->unique();
            $table->enum('type', ['policy', 'claim'])->default('policy');
            $table->enum('status', [
                'draft',
                'submitted',
                'under_review',
                'pending_documents',
                'approved',
                'rejected',
                'cancelled'
            ])->default('draft');
            $table->text('property_details')->nullable(); // JSON: basic property info for quote
            $table->decimal('estimated_premium', 12, 2)->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        // Uploaded documents per application
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('document_type'); // e.g. "OR/CR", "Driver's License", "Photos"
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->integer('file_size'); // bytes
            $table->enum('status', ['pending', 'ai_reviewed', 'approved', 'rejected', 'needs_resubmission'])->default('pending');
            $table->text('ai_validation_result')->nullable(); // JSON: AI analysis
            $table->text('admin_feedback')->nullable();
            $table->timestamp('ai_reviewed_at')->nullable();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, success, warning, error
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('products');
        Schema::dropIfExists('notifications_log');
    }
};
