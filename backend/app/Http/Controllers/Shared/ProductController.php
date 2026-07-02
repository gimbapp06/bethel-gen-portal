<?php
namespace App\Http\Controllers\Shared;
use App\Http\Controllers\Controller;
use App\Models\Product;
class ProductController extends Controller {
    public function index() { return response()->json(['products' => Product::where('is_active', true)->get()]); }
    public function show(string $slug) { return response()->json(['product' => Product::where('slug', $slug)->where('is_active', true)->firstOrFail()]); }
}
