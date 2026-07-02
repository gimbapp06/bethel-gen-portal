<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\NotificationLog;
use App\Events\ApplicationStatusUpdated;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $apps = Application::with(['product'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['applications' => $apps]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'type'             => 'required|in:policy,claim',
            'property_details' => 'nullable|array',
        ]);

        $app = Application::create([
            'user_id'          => $request->user()->id,
            'product_id'       => $request->product_id,
            'type'             => $request->type,
            'property_details' => $request->property_details,
            'status'           => 'draft',
        ]);

        return response()->json([
            'message'     => 'Application created.',
            'application' => $app->load('product'),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $app = Application::with(['product', 'documents'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['application' => $app]);
    }

    public function update(Request $request, int $id)
    {
        $app = Application::where('user_id', $request->user()->id)->findOrFail($id);

        if (!in_array($app->status, ['draft', 'pending_documents'])) {
            return response()->json(['message' => 'This application can no longer be edited.'], 422);
        }

        $request->validate([
            'property_details' => 'nullable|array',
            'status'           => 'nullable|in:submitted',
        ]);

        $app->update($request->only('property_details'));

        if ($request->status === 'submitted') {
            $app->status       = 'submitted';
            $app->submitted_at = now();
            $app->save();

            // Notify admin
            NotificationLog::create([
                'user_id' => 1, // default admin; extend for multi-admin
                'title'   => 'New Application Submitted',
                'message' => $request->user()->full_name . ' submitted application ' . $app->reference_number,
                'type'    => 'info',
                'link'    => '/admin/applications/' . $app->id,
            ]);
        }

        return response()->json(['application' => $app->load('product')]);
    }

    public function destroy(Request $request, int $id)
    {
        $app = Application::where('user_id', $request->user()->id)
                          ->where('status', 'draft')
                          ->findOrFail($id);

        $app->delete();

        return response()->json(['message' => 'Application deleted.']);
    }
}
