<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPost extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_OPEN = 'open';

    public const STATUS_IN_SELECTION = 'in_selection';

    public const STATUS_CONTRACTED = 'contracted';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'client_id', 'category_id', 'title', 'slug', 'description', 'budget_type',
        'budget_min', 'budget_max', 'currency', 'duration', 'experience_level',
        'urgency', 'mode', 'city_id', 'deadline', 'status', 'connects_cost',
        'is_featured', 'contact_flagged', 'published_at',
    ];

    protected $casts = [
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'deadline' => 'date',
        'is_featured' => 'boolean',
        'contact_flagged' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_post_skills');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(JobPostAttachment::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isOpenForProposals(): bool
    {
        return in_array($this->status, [self::STATUS_OPEN, self::STATUS_IN_SELECTION], true);
    }
}
