<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use App\Models\Document;
use App\Models\Message;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_clients'          => User::where('role', 'client')->count(),
            'total_applications'     => Application::count(),
            'pending_applications'   => Application::whereIn('status', ['submitted', 'under_review'])->count(),
            'pending_documents'      => Document::where('status', 'pending')->count(),
            'approved_applications'  => Application::where('status', 'approved')->count(),
            'rejected_applications'  => Application::where('status', 'rejected')->count(),
            'unread_messages'        => \App\Models\MessageThread::where('admin_has_unread', true)->count(),
        ];

        $recentApplications = Application::with(['user', 'product'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $recentClients = User::where('role', 'client')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'stats'                => $stats,
            'recent_applications'  => $recentApplications,
            'recent_clients'       => $recentClients,
        ]);
    }

    public function clients(Request $request)
    {
        $query = User::where('role', 'client');

        if ($request->search) {
            $q = $request->search;
            $query->where(fn($qb) =>
                $qb->where('first_name', 'like', "%$q%")
                   ->orWhere('last_name', 'like', "%$q%")
                   ->orWhere('email', 'like', "%$q%")
            );
        }

        $clients = $query->withCount('applications')->orderByDesc('created_at')->paginate(20);

        return response()->json($clients);
    }

    public function toggleClient(Request $request, int $id)
    {
        $user = User::where('role', 'client')->findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json(['user' => $user, 'message' => 'Client status updated.']);
    }
}
