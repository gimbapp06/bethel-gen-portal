<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = ['question', 'answer', 'product_id', 'order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function product() { return $this->belongsTo(Product::class); }
}
