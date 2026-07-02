<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['application.user', 'application.product']);
        if ($request->status)         { $query->where('status', $request->status); }
        if ($request->application_id) { $query->where('application_id', $request->application_id); }
        $docs = $query->orderByDesc('created_at')->paginate(20);
        return response()->json($docs);
    }

    public function approve(Request $request, int $id)
    {
        $request->validate(['feedback' => 'nullable|string|max:500']);
        $doc = Document::with('application')->findOrFail($id);
        $doc->status            = 'approved';
        $doc->admin_feedback    = $request->feedback ?? 'Document approved.';
        $doc->admin_reviewed_at = now();
        $doc->save();

        NotificationLog::create([
            'user_id' => $doc->application->user_id,
            'title'   => 'Document Approved',
            'message' => 'Your document "' . $doc->document_type . '" for application ' . $doc->application->reference_number . ' has been approved.',
            'type'    => 'success',
            'link'    => '/client/applications/' . $doc->application_id,
        ]);

        return response()->json(['document' => $doc]);
    }

    public function reject(Request $request, int $id)
    {
        $request->validate(['feedback' => 'required|string|max:500']);
        $doc = Document::with('application')->findOrFail($id);
        $doc->status            = 'rejected';
        $doc->admin_feedback    = $request->feedback;
        $doc->admin_reviewed_at = now();
        $doc->save();

        NotificationLog::create([
            'user_id' => $doc->application->user_id,
            'title'   => 'Document Rejected',
            'message' => 'Your document "' . $doc->document_type . '" was rejected. Reason: ' . $request->feedback,
            'type'    => 'error',
            'link'    => '/client/applications/' . $doc->application_id,
        ]);

        return response()->json(['document' => $doc]);
    }

    public function download(int $id)
    {
        $doc = Document::findOrFail($id);

        // Try private disk first, fallback to local
        try {
            if (Storage::disk('private')->exists($doc->file_path)) {
                return Storage::disk('private')->download($doc->file_path, $doc->original_filename);
            }
        } catch (\Exception $e) {}

        try {
            if (Storage::disk('local')->exists($doc->file_path)) {
                return Storage::disk('local')->download($doc->file_path, $doc->original_filename);
            }
        } catch (\Exception $e) {}

        return response()->json(['message' => 'File not found on server.'], 404);
    }
}
