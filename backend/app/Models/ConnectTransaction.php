<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ConnectTransaction extends Model
{
    public const TYPE_PURCHASE = 'purchase';

    public const TYPE_SPEND = 'spend';

    public const TYPE_REFUND = 'refund';

    public const TYPE_BONUS = 'bonus';

    protected $fillable = [
        'user_id', 'type', 'amount', 'balance_after',
        'source_type', 'source_id', 'description',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
