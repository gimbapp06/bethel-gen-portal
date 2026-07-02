<?php
// Document.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'application_id', 'user_id', 'document_type',
        'original_filename', 'stored_filename', 'file_path',
        'mime_type', 'file_size', 'status',
        'ai_validation_result', 'admin_feedback',
        'ai_reviewed_at', 'admin_reviewed_at',
    ];

    protected $casts = [
        'ai_validation_result' => 'array',
        'ai_reviewed_at'       => 'datetime',
        'admin_reviewed_at'    => 'datetime',
    ];

    public function application() { return $this->belongsTo(Application::class); }
    public function user()        { return $this->belongsTo(User::class); }
}
