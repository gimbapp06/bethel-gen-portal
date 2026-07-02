<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'reference_number', 'type',
        'status', 'property_details', 'estimated_premium',
        'admin_notes', 'rejection_reason', 'submitted_at', 'approved_at',
    ];

    protected $casts = [
        'property_details' => 'array',
        'estimated_premium' => 'float',
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function calendarTasks(): HasMany
    {
        return $this->hasMany(CalendarTask::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Application $app) {
            $app->reference_number = 'BGI-' . strtoupper(substr($app->type, 0, 1)) . '-' . date('Y') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        });
    }
}
