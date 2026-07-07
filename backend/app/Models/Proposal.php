<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Proposal extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_SHORTLISTED = 'shortlisted';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_DECLINED = 'declined';

    public const STATUS_WITHDRAWN = 'withdrawn';

    protected $fillable = [
        'job_post_id', 'freelancer_id', 'amount', 'currency', 'delivery_days',
        'cover_letter', 'status', 'connects_spent', 'is_flagged',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_flagged' => 'boolean',
    ];

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProposalMilestone::class)->orderBy('sort_order');
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class);
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_SHORTLISTED], true);
    }
}
