<?php

use Illuminate\Support\Facades\Broadcast;

// Client channel: only the client themselves can listen
Broadcast::channel('client.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Admin channel: only admin role
Broadcast::channel('admin', function ($user) {
    return $user->role === 'admin';
});

// Message thread: only participants (client or admin)
Broadcast::channel('thread.{threadId}', function ($user, $threadId) {
    $thread = \App\Models\MessageThread::find($threadId);
    if (!$thread) return false;
    return $user->id === $thread->client_id || $user->role === 'admin';
});
