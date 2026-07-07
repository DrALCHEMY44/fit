<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REVISION_REQUESTED = 'revision_requested';

    protected $fillable = [
        'order_id', 'order_milestone_id', 'message', 'files', 'link_url',
        'status', 'client_feedback', 'reviewed_at',
    ];

    protected $casts = [
        'files' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(OrderMilestone::class, 'order_milestone_id');
    }
}
