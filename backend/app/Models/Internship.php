<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Internship extends Model
{
    protected $fillable = [
        'title', 'company_name', 'location', 'duration', 'stipend', 'is_paid',
        'type', 'skills', 'description', 'status', 'posted_by',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'skills' => 'array',
    ];

    public function poster(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class);
    }
}
