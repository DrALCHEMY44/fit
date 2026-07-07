<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WalletTransaction extends Model
{
    public const TYPE_ESCROW_HOLD = 'escrow_hold';

    public const TYPE_ESCROW_RELEASE = 'escrow_release';

    public const TYPE_COMMISSION_FEE = 'commission_fee';

    public const TYPE_REFUND = 'refund';

    public const TYPE_WITHDRAWAL = 'withdrawal';

    public const TYPE_WITHDRAWAL_FEE = 'withdrawal_fee';

    public const TYPE_ADJUSTMENT = 'adjustment';

    protected $fillable = [
        'user_id', 'type', 'bucket', 'amount', 'currency', 'reference',
        'source_type', 'source_id', 'description',
    ];

    protected $casts = ['amount' => 'decimal:2'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
