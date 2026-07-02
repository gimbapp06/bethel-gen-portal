<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarTask extends Model
{
    protected $fillable = [
        'admin_id', 'application_id', 'client_id', 'title', 'description',
        'priority', 'status', 'task_type', 'due_date', 'due_time', 'is_checked',
    ];

    protected $casts = [
        'due_date'   => 'string',
        'is_checked' => 'boolean',
    ];

    public function admin()       { return $this->belongsTo(User::class, 'admin_id'); }
    public function application() { return $this->belongsTo(Application::class); }
    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
}
