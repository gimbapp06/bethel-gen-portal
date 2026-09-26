<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The password-reset OTP had no attempts tracking at all — a wrong code
 * simply returned "invalid" with no counter, and there was no distinct
 * "too many attempts" state. This mirrors the counter already used for
 * registration OTPs (`pending_registrations.attempts`) so both flows behave
 * the same way: a few good-faith mistakes are tolerated, and only repeated
 * failures ever require requesting a fresh code.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('reset_token_attempts')->default(0)->after('reset_token_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('reset_token_attempts');
        });
    }
};
