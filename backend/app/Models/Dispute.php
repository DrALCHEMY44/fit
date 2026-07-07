<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    public const STATUS_OPEN = 'open';

    public const STATUS_UNDER_REVIEW = 'under_review';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_CANCELLED = 'cancelled';

    public const RESOLUTION_REFUND_CLIENT = 'refund_client';

    public const RESOLUTION_RELEASE_FREELANCER = 'release_freelancer';

    public const RESOLUTION_PARTIAL_SPLIT = 'partial_split';

    public const RESOLUTION_CANCEL_ORDER = 'cancel_order';

    protected $fillable = [
        'order_id', 'opened_by', 'reason', 'description', 'evidence', 'status',
        'resolution', 'refund_amount', 'release_amount', 'resolution_note',
        'resolved_by', 'resolved_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'refund_amount' => 'decimal:2',
        'release_amount' => 'decimal:2',
        'resolved_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
