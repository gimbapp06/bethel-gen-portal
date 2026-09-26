<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Holds new client sign-ups that have not yet confirmed their email via
 * OTP. Nothing is written to the `users` table until the code is verified,
 * so an unverified email never blocks someone else from registering with it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password'); // already hashed before insert
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->date('birthdate')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();

            $table->string('otp_hash');
            $table->timestamp('otp_expires_at');
            $table->unsignedTinyInteger('attempts')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
