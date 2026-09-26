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
        'role', 'created_by', 'phone', 'address', 'birthdate', 'gender',
        'photo', 'reset_token', 'reset_token_expires_at', 'reset_token_attempts', 'is_active',
        'last_login_at', 'last_login_ip', 'failed_login_attempts', 'locked_until',
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
        'last_login_at'           => 'datetime',
        'locked_until'            => 'datetime',
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

    /** The admin who created this account (staff accounts only). */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
