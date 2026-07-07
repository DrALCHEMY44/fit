<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FreelancerProfile extends Model
{
    public const AVAILABLE = 'available';

    public const BUSY = 'busy';

    public const UNAVAILABLE = 'unavailable';

    protected $fillable = [
        'user_id', 'title', 'bio', 'experience_level', 'hourly_rate', 'min_price',
        'currency', 'availability', 'rating', 'reviews_count', 'job_success_score',
        'completed_orders_count', 'total_earned', 'is_verified', 'is_top_rated',
        'profile_completion',
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'min_price' => 'decimal:2',
        'rating' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_top_rated' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'freelancer_skills');
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class);
    }

    public function recalculateCompletion(): void
    {
        $score = 20; // account exists
        $score += filled($this->title) ? 15 : 0;
        $score += filled($this->bio) ? 15 : 0;
        $score += $this->hourly_rate !== null || $this->min_price !== null ? 15 : 0;
        $score += $this->skills()->exists() ? 20 : 0;
        $score += $this->portfolioItems()->exists() ? 15 : 0;

        $this->forceFill(['profile_completion' => min($score, 100)])->save();
    }
}
