<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMilestone extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_FUNDED = 'funded';

    public const STATUS_IN_REVIEW = 'in_review';

    public const STATUS_APPROVED = 'approved';

    protected $fillable = [
        'order_id', 'title', 'amount', 'due_date', 'status', 'sort_order',
        'funded_at', 'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'funded_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
