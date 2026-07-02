<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageThread;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function threads(Request $request)
    {
        $threads = MessageThread::with(['latestMessage', 'application.product'])
            ->where('client_id', $request->user()->id)
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json(['threads' => $threads]);
    }

    public function createThread(Request $request)
    {
        $request->validate([
            'subject'        => 'nullable|string|max:200',
            'body'           => 'required|string|max:2000',
            'application_id' => 'nullable|exists:applications,id',
        ]);

        $thread = MessageThread::create([
            'client_id'        => $request->user()->id,
            'application_id'   => $request->application_id,
            'subject'          => $request->subject ?? 'General Inquiry',
            'last_message_at'  => now(),
            'admin_has_unread' => true,
        ]);

        $msg = Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $request->user()->id,
            'body'      => $request->body,
        ]);

        // Broadcasting removed - using polling instead

        return response()->json(['thread' => $thread->load('latestMessage')], 201);
    }

    public function threadMessages(Request $request, int $id)
    {
        $thread = MessageThread::where('client_id', $request->user()->id)->findOrFail($id);

        $messages = Message::with('sender')
            ->where('thread_id', $thread->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['messages' => $messages]);
    }

    public function sendMessage(Request $request, int $id)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $thread = MessageThread::where('client_id', $request->user()->id)->findOrFail($id);

        $msg = Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $request->user()->id,
            'body'      => $request->body,
        ]);

        $thread->last_message_at  = now();
        $thread->admin_has_unread = true;
        $thread->save();

        // Broadcasting removed - using polling instead

        return response()->json(['message' => $msg->load('sender')], 201);
    }

    public function markThreadRead(Request $request, int $id)
    {
        $thread = MessageThread::where('client_id', $request->user()->id)->findOrFail($id);
        $thread->client_has_unread = false;
        $thread->save();

        return response()->json(['ok' => true]);
    }
}
