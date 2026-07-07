<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientProfile extends Model
{
    protected $fillable = [
        'user_id', 'type', 'company_name', 'logo_path', 'sector', 'address',
        'website', 'about', 'payment_verified', 'rating', 'reviews_count',
        'total_spent', 'jobs_posted_count', 'hires_count',
    ];

    protected $casts = [
        'payment_verified' => 'boolean',
        'rating' => 'decimal:2',
        'total_spent' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
