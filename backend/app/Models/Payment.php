<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_SUCCESSFUL = 'successful';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REFUNDED = 'refunded';

    public const PURPOSE_ORDER = 'order';

    public const PURPOSE_MILESTONE = 'milestone';

    public const PURPOSE_CONNECTS = 'connects';

    public const PURPOSE_SUBSCRIPTION = 'subscription';

    protected $fillable = [
        'reference', 'payer_id', 'order_id', 'order_milestone_id', 'purpose',
        'amount', 'currency', 'provider', 'phone_number', 'provider_ref',
        'status', 'meta', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
        'paid_at' => 'datetime',
    ];

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(OrderMilestone::class, 'order_milestone_id');
    }
}
