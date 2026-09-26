<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingRegistration extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'email', 'password',
        'phone', 'address', 'birthdate', 'gender',
        'otp_hash', 'otp_expires_at', 'attempts',
    ];

    protected $hidden = [
        'password', 'otp_hash',
    ];

    protected $casts = [
        'birthdate'      => 'date',
        'otp_expires_at' => 'datetime',
    ];
}
