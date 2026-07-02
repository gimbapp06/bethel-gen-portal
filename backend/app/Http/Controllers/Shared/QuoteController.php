<?php
namespace App\Http\Controllers\Shared;
use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\Request;
class QuoteController extends Controller {
    public function store(Request $request) {
        $request->validate(['full_name'=>'required|string|max:200','email'=>'required|email','phone'=>'nullable|string|max:20','product_id'=>'required|exists:products,id','property_details'=>'required|array']);
        $quote = Quote::create($request->only('full_name','email','phone','product_id','property_details'));
        return response()->json(['message'=>'Quote request submitted. Our branch will contact you shortly.','quote'=>$quote],201);
    }
    public function index() { return response()->json(['quotes'=>Quote::with('product')->orderByDesc('created_at')->paginate(20)]); }
    public function convert(int $id) { Quote::findOrFail($id)->update(['status'=>'converted']); return response()->json(['message'=>'Quote marked as converted.']); }
}
