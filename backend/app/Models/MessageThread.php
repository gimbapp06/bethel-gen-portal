<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageThread extends Model
{
    protected $fillable = [
        'client_id', 'application_id', 'subject',
        'last_message_at', 'client_has_unread', 'admin_has_unread',
    ];

    protected $casts = [
        'last_message_at'   => 'datetime',
        'client_has_unread' => 'boolean',
        'admin_has_unread'  => 'boolean',
    ];

    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
    public function application() { return $this->belongsTo(Application::class); }
    public function messages()    { return $this->hasMany(Message::class, 'thread_id'); }

    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'thread_id')->latestOfMany();
    }
}
