<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\NotificationLog;
use Illuminate\Http\Request;

class AdminMessageController extends Controller
{
    public function threads(Request $request)
    {
        $query = MessageThread::with(['client', 'latestMessage', 'application.product']);

        if ($request->unread) { $query->where('admin_has_unread', true); }

        $threads = $query->orderByDesc('last_message_at')->paginate(20);

        return response()->json($threads);
    }

    public function threadMessages(int $id)
    {
        $thread   = MessageThread::findOrFail($id);
        $messages = Message::with('sender')
            ->where('thread_id', $thread->id)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'messages' => $messages,
            'thread'   => $thread->load('client', 'application.product')
        ]);
    }

    public function sendMessage(Request $request, int $id)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $thread = MessageThread::findOrFail($id);
        $msg    = Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $request->user()->id,
            'body'      => $request->body,
        ]);

        $thread->last_message_at   = now();
        $thread->client_has_unread = true;
        $thread->save();

        // Notify client
        NotificationLog::create([
            'user_id' => $thread->client_id,
            'title'   => 'New Message from Bethel Gen',
            'message' => 'You have a new message from the branch.',
            'type'    => 'info',
            'link'    => '/client/messages',
        ]);

        // Broadcasting removed - using polling instead

        return response()->json(['message' => $msg->load('sender')], 201);
    }

    public function markThreadRead(int $id)
    {
        $thread = MessageThread::findOrFail($id);
        $thread->admin_has_unread = false;
        $thread->save();

        return response()->json(['ok' => true]);
    }
}
