<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtpCode extends Model
{
    public const PURPOSE_VERIFICATION = 'verification';

    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    protected $fillable = [
        'user_id', 'identifier', 'channel', 'purpose', 'code_hash',
        'expires_at', 'consumed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(): bool
    {
        return $this->consumed_at === null && $this->expires_at->isFuture();
    }
}
