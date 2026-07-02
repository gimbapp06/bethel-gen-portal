<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description',
        'required_documents', 'basic_info_fields', 'is_active',
    ];

    protected $casts = [
        'required_documents' => 'array',
        'basic_info_fields'  => 'array',
        'is_active'          => 'boolean',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
