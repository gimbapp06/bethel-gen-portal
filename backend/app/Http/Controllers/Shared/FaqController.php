<?php
namespace App\Http\Controllers\Shared;
use App\Http\Controllers\Controller;
use App\Models\Faq;
class FaqController extends Controller {
    public function index() { return response()->json(['faqs' => Faq::where('is_active', true)->orderBy('order')->get()]); }
}
