<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        $thread = $this->message->thread;
        return [
            new PrivateChannel('thread.' . $thread->id),
            new PrivateChannel('client.' . $thread->client_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-message';
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'thread_id'       => $this->message->thread_id,
            'sender_id'       => $this->message->sender_id,
            'body'            => $this->message->body,
            'created_at'      => $this->message->created_at,
            'sender'          => $this->message->sender ? [
                'id'        => $this->message->sender->id,
                'full_name' => $this->message->sender->full_name,
                'role'      => $this->message->sender->role,
                'photo'     => $this->message->sender->photo,
            ] : null,
        ];
    }
}
