<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    public const STATUS_PENDING_PAYMENT = 'pending_payment';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_REVISION_REQUESTED = 'revision_requested';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_DISPUTED = 'disputed';

    protected $fillable = [
        'number', 'client_id', 'freelancer_id', 'job_post_id', 'service_id',
        'service_package_id', 'proposal_id', 'title', 'requirements', 'amount',
        'currency', 'commission_rate', 'commission_amount', 'freelancer_amount',
        'delivery_days', 'deadline', 'revisions_allowed', 'revisions_used', 'status',
        'paid_at', 'delivered_at', 'completed_at', 'cancelled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_rate' => 'decimal:4',
        'commission_amount' => 'decimal:2',
        'freelancer_amount' => 'decimal:2',
        'deadline' => 'date',
        'paid_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(OrderMilestone::class)->orderBy('sort_order');
    }

    public function events(): HasMany
    {
        return $this->hasMany(OrderEvent::class)->latest();
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class)->latest();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function dispute(): HasOne
    {
        return $this->hasOne(Dispute::class)->latestOfMany();
    }

    public function isParticipant(User $user): bool
    {
        return $this->client_id === $user->id || $this->freelancer_id === $user->id;
    }

    public function hasMilestones(): bool
    {
        return $this->milestones()->exists();
    }

    public function recordEvent(string $event, ?User $actor = null, ?string $note = null, array $meta = []): OrderEvent
    {
        return $this->events()->create([
            'actor_id' => $actor?->id,
            'event' => $event,
            'note' => $note,
            'meta' => $meta ?: null,
        ]);
    }
}
