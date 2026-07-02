<?php
namespace App\Http\Controllers\Shared;
use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Services\AiService;
use Illuminate\Http\Request;
class AiController extends Controller {
    public function __construct(private AiService $ai) {}
    public function faqAnswer(Request $request) {
        $request->validate(['question'=>'required|string|max:500']);
        $faqs=Faq::where('is_active',true)->get()->toArray();
        $answer=$this->ai->answerFaq($request->question,$faqs);
        return response()->json(['answer'=>$answer]);
    }
}
