<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Application;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function __construct(private AiService $ai) {}

    public function index(Request $request, int $applicationId)
    {
        $app  = Application::where('user_id', $request->user()->id)->findOrFail($applicationId);
        $docs = Document::where('application_id', $app->id)->get();
        return response()->json(['documents' => $docs]);
    }

    public function upload(Request $request, int $applicationId)
    {
        $app = Application::where('user_id', $request->user()->id)->findOrFail($applicationId);

        $request->validate([
            'file'          => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'document_type' => 'required|string|max:100',
        ]);

        $file   = $request->file('file');
        $stored = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store file - use local disk if private not configured
        try {
            $path = $file->storeAs('documents/' . $app->id, $stored, 'private');
        } catch (\Exception $e) {
            $path = $file->storeAs('documents/' . $app->id, $stored, 'local');
        }

        $doc = Document::create([
            'application_id'    => $app->id,
            'user_id'           => $request->user()->id,
            'document_type'     => $request->document_type,
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename'   => $stored,
            'file_path'         => $path,
            'mime_type'         => $file->getMimeType(),
            'file_size'         => $file->getSize(),
            'status'            => 'pending',
        ]);

        // Auto-trigger AI validation (non-blocking)
        $this->runAiValidation($doc, $app);

        return response()->json([
            'message'  => 'Document uploaded successfully.',
            'document' => $doc->fresh(),
        ], 201);
    }

    public function aiValidate(Request $request, int $id)
    {
        $doc = Document::where('user_id', $request->user()->id)->findOrFail($id);
        $app = Application::findOrFail($doc->application_id);
        $this->runAiValidation($doc, $app);
        return response()->json(['document' => $doc->fresh()]);
    }

    public function destroy(Request $request, int $id)
    {
        $doc = Document::where('user_id', $request->user()->id)
                       ->findOrFail($id);

        // Allow deletion only if not yet approved
        if ($doc->status === 'approved') {
            return response()->json(['message' => 'Approved documents cannot be removed.'], 422);
        }

        // Try to delete file from storage (non-blocking if file missing)
        try {
            Storage::disk('private')->delete($doc->file_path);
        } catch (\Exception $e) {
            try { Storage::disk('local')->delete($doc->file_path); } catch (\Exception $e2) {}
        }

        $doc->delete();
        return response()->json(['message' => 'Document removed.']);
    }

    public function download(Request $request, int $id)
    {
        $doc = Document::where('user_id', $request->user()->id)->findOrFail($id);

        // Try private disk first, fallback to local
        try {
            return Storage::disk('private')->download($doc->file_path, $doc->original_filename);
        } catch (\Exception $e) {
            return Storage::disk('local')->download($doc->file_path, $doc->original_filename);
        }
    }

    private function runAiValidation(Document $doc, Application $app): void
    {
        try {
            $product      = $app->product;
            // Fix: parse JSON string to array if needed
            $requiredDocs = $product->required_documents ?? [];
            if (is_string($requiredDocs)) {
                $requiredDocs = json_decode($requiredDocs, true) ?? [];
            }

            $result = $this->ai->validateDocument($doc, $requiredDocs, $doc->document_type);

            $doc->ai_validation_result = $result;
            $doc->ai_reviewed_at       = now();
            $doc->status               = ($result['is_valid'] ?? true) ? 'ai_reviewed' : 'needs_resubmission';
            $doc->save();
        } catch (\Exception $e) {
            \Log::error('AI validation failed: ' . $e->getMessage());
            // Don't fail — just leave as pending
        }
    }
}
