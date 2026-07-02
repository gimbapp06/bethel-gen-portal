<?php
namespace App\Http\Controllers\Shared;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
class ProfileController extends Controller {
    public function show(Request $request) { return response()->json(['user'=>$request->user()]); }
    public function update(Request $request) {
        $request->validate(['first_name'=>'required|string|max:100','last_name'=>'required|string|max:100','phone'=>'nullable|string|max:20','address'=>'nullable|string|max:255','birthdate'=>'nullable|date|before:today','gender'=>'nullable|in:male,female,other']);
        $request->user()->update($request->only('first_name','last_name','phone','address','birthdate','gender'));
        return response()->json(['user'=>$request->user()->fresh(),'message'=>'Profile updated.']);
    }
    public function uploadPhoto(Request $request) {
        $request->validate(['photo'=>'required|image|max:2048']);
        $user=$request->user();
        if($user->photo){Storage::disk('public')->delete($user->photo);}
        $path=$request->file('photo')->store('photos','public');
        $user->photo=$path; $user->save();
        return response()->json(['photo_url'=>asset('storage/'.$path)]);
    }
    public function changePassword(Request $request) {
        $request->validate(['current_password'=>'required|string','password'=>['required','confirmed',Password::min(8)->mixedCase()->numbers()->symbols()]]);
        if(!Hash::check($request->current_password,$request->user()->password)){return response()->json(['message'=>'Current password is incorrect.'],422);}
        $request->user()->update(['password'=>Hash::make($request->password)]);
        return response()->json(['message'=>'Password changed successfully.']);
    }
}
