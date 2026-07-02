<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'full_name', 'email', 'phone', 'product_id',
        'property_details', 'estimated_premium', 'status',
    ];

    protected $casts = [
        'property_details'  => 'array',
        'estimated_premium' => 'float',
    ];

    public function product() { return $this->belongsTo(Product::class); }
}
