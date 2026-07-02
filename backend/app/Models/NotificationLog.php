<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $table = 'notifications_log';

    protected $fillable = [
        'user_id', 'title', 'message', 'type', 'link', 'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
