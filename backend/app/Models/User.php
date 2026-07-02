<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'password',
        'role', 'phone', 'address', 'birthdate', 'gender',
        'photo', 'reset_token', 'reset_token_expires_at', 'is_active',
    ];

    protected $hidden = [
        'password', 'remember_token', 'reset_token',
    ];

    protected $casts = [
        'email_verified_at'       => 'datetime',
        'reset_token_expires_at'  => 'datetime',
        'birthdate'               => 'date',
        'is_active'               => 'boolean',
        'password'                => 'hashed',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function messageThreads()
    {
        return $this->hasMany(MessageThread::class, 'client_id');
    }

    public function notifications()
    {
        return $this->hasMany(NotificationLog::class);
    }

    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}
