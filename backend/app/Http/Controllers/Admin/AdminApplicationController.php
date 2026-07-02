<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\NotificationLog;
use App\Models\CalendarTask;
use Illuminate\Http\Request;

class AdminApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with(['user', 'product']);

        if ($request->status)  { $query->where('status', $request->status); }
        if ($request->type)    { $query->where('type', $request->type); }
        if ($request->search)  {
            $q = $request->search;
            $query->where(fn($qb) =>
                $qb->where('reference_number', 'like', "%$q%")
                   ->orWhereHas('user', fn($u) =>
                       $u->where('first_name', 'like', "%$q%")
                         ->orWhere('last_name', 'like', "%$q%")
                   )
            );
        }

        $apps = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($apps);
    }

    public function show(int $id)
    {
        $app = Application::with(['user', 'product', 'documents'])->findOrFail($id);

        return response()->json(['application' => $app]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status'           => 'required|in:under_review,pending_documents,approved,rejected,cancelled',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:500',
            'admin_notes'      => 'nullable|string|max:1000',
        ]);

        $app = Application::findOrFail($id);
        $oldStatus = $app->status;

        $app->status = $request->status;
        if ($request->rejection_reason) $app->rejection_reason = $request->rejection_reason;
        if ($request->admin_notes)      $app->admin_notes = $request->admin_notes;
        if ($request->status === 'approved') $app->approved_at = now();
        $app->save();

        // Notify client
        $statusLabels = [
            'under_review'      => 'is now under review',
            'pending_documents' => 'requires additional documents',
            'approved'          => 'has been APPROVED',
            'rejected'          => 'has been rejected',
            'cancelled'         => 'has been cancelled',
        ];

        NotificationLog::create([
            'user_id' => $app->user_id,
            'title'   => 'Application Status Updated',
            'message' => 'Your application ' . $app->reference_number . ' ' . ($statusLabels[$request->status] ?? $request->status) . '.',
            'type'    => in_array($request->status, ['approved']) ? 'success' : (in_array($request->status, ['rejected']) ? 'error' : 'info'),
            'link'    => '/client/applications/' . $app->id,
        ]);

        // Auto-create calendar task for document review if pending
        if ($request->status === 'pending_documents') {
            CalendarTask::create([
                'admin_id'       => $request->user()->id,
                'application_id' => $app->id,
                'client_id'      => $app->user_id,
                'title'          => 'Follow up: ' . $app->reference_number,
                'description'    => 'Awaiting additional documents from client.',
                'priority'       => 'medium',
                'task_type'      => 'document_review',
                'due_date'       => now()->addDays(3)->toDateString(),
            ]);
        }

        return response()->json(['application' => $app, 'message' => 'Status updated.']);
    }

    public function setPremium(Request $request, int $id)
    {
        $request->validate(['estimated_premium' => 'required|numeric|min:0']);

        $app = Application::findOrFail($id);
        $app->estimated_premium = $request->estimated_premium;
        $app->save();

        NotificationLog::create([
            'user_id' => $app->user_id,
            'title'   => 'Premium Estimate Available',
            'message' => 'An estimated premium of PHP ' . number_format($request->estimated_premium, 2) . ' has been set for your application ' . $app->reference_number . '.',
            'type'    => 'info',
            'link'    => '/client/applications/' . $app->id,
        ]);

        return response()->json(['application' => $app]);
    }

    public function addNote(Request $request, int $id)
    {
        $request->validate(['note' => 'required|string|max:1000']);

        $app = Application::findOrFail($id);
        $existing = $app->admin_notes ?? '';
        $app->admin_notes = $existing . "\n[" . now()->format('Y-m-d H:i') . "] " . $request->note;
        $app->save();

        return response()->json(['application' => $app]);
    }
}
