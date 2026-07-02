<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'thread_id', 'sender_id', 'body',
        'attachment_path', 'attachment_name', 'is_read', 'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function thread() { return $this->belongsTo(MessageThread::class, 'thread_id'); }
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
