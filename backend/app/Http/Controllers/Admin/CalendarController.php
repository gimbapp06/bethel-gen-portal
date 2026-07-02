<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CalendarTask;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $query = CalendarTask::with(['application', 'client'])
            ->where('admin_id', $request->user()->id);

        if ($request->date) { $query->where('due_date', $request->date); }
        if ($request->month) {
            $query->whereYear('due_date', substr($request->month, 0, 4))
                  ->whereMonth('due_date', substr($request->month, 5, 2));
        }

        $tasks = $query->orderBy('due_date')->orderByRaw("FIELD(priority,'high','medium','low')")->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'          => 'required|string|max:200',
            'description'    => 'nullable|string|max:1000',
            'priority'       => 'required|in:high,medium,low',
            'task_type'      => 'required|in:document_review,policy_issuance,claim_processing,message_reply,other',
            'due_date'       => 'required|date',
            'due_time'       => 'nullable|date_format:H:i',
            'application_id' => 'nullable|exists:applications,id',
            'client_id'      => 'nullable|exists:users,id',
        ]);

        $task = CalendarTask::create(array_merge(
            $request->only('title','description','priority','task_type','due_date','due_time','application_id','client_id'),
            ['admin_id' => $request->user()->id, 'status' => 'pending']
        ));

        return response()->json(['task' => $task->load('application', 'client')], 201);
    }

    public function update(Request $request, int $id)
    {
        $task = CalendarTask::where('admin_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string|max:1000',
            'priority'    => 'sometimes|in:high,medium,low',
            'status'      => 'sometimes|in:pending,in_progress,done',
            'due_date'    => 'sometimes|date',
            'due_time'    => 'nullable|date_format:H:i',
        ]);

        $task->update($request->only('title','description','priority','status','due_date','due_time'));

        return response()->json(['task' => $task]);
    }

    public function destroy(Request $request, int $id)
    {
        CalendarTask::where('admin_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    public function toggle(Request $request, int $id)
    {
        $task = CalendarTask::where('admin_id', $request->user()->id)->findOrFail($id);
        $task->is_checked = !$task->is_checked;
        $task->status     = $task->is_checked ? 'done' : 'pending';
        $task->save();

        return response()->json(['task' => $task]);
    }
}
