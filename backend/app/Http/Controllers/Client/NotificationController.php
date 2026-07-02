<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = NotificationLog::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unread = $notifications->where('is_read', false)->count();

        return response()->json(['notifications' => $notifications, 'unread' => $unread]);
    }

    public function markRead(Request $request, int $id)
    {
        NotificationLog::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request)
    {
        NotificationLog::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }
}
