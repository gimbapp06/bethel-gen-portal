<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function summary()
    {
        $byProduct = Application::with('product')
            ->selectRaw('product_id, status, COUNT(*) as count')
            ->groupBy('product_id', 'status')
            ->get()
            ->groupBy('product_id');

        $byMonth = Application::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json([
            'by_product' => $byProduct,
            'by_month'   => $byMonth,
            'totals'     => [
                'applications' => Application::count(),
                'clients'      => User::where('role', 'client')->count(),
                'documents'    => Document::count(),
                'approved'     => Application::where('status', 'approved')->count(),
            ],
        ]);
    }

    public function applications(Request $request)
    {
        $apps = Application::with(['user', 'product'])
            ->when($request->from, fn($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->where('created_at', '<=', $request->to))
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($apps);
    }

    public function clients()
    {
        $clients = User::where('role', 'client')
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json($clients);
    }
}
