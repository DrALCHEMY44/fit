<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_PAUSED = 'paused';

    public const STATUS_REMOVED = 'removed';

    protected $fillable = [
        'user_id', 'category_id', 'title', 'slug', 'description', 'price', 'currency',
        'delivery_days', 'revisions_included', 'images', 'status', 'is_featured',
        'orders_count', 'rating',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'is_featured' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
