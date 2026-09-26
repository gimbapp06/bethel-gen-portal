<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL enum columns can't be altered via the fluent Blueprint API
        // without doctrine/dbal, so we modify it directly.
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'client') NOT NULL DEFAULT 'client'");

        Schema::table('users', function (Blueprint $table) {
            // Which admin created this staff account (null for self-registered clients / seeded admins)
            $table->foreignId('created_by')->nullable()->after('role')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client') NOT NULL DEFAULT 'client'");
    }
};
