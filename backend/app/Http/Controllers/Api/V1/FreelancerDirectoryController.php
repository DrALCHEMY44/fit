<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FreelancerProfileResource;
use App\Http\Resources\ReviewResource;
use App\Models\FreelancerProfile;
use App\Models\Review;
use App\Models\User;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Talent Search')]
class FreelancerDirectoryController extends Controller
{
    /**
     * Search freelancers
     *
     * Public talent directory with the full filter set (FIT-SRC-01, FIT-SRC-02):
     * keyword, category, skill, city, rate range, minimum rating, availability
     * and badges. Sortable by rating, rate, JSS or recency.
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            /** Keyword matched against name, headline and bio. @example react developer */
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'skill_id' => ['nullable', 'integer', 'exists:skills,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'min_rate' => ['nullable', 'numeric', 'min:0'],
            'max_rate' => ['nullable', 'numeric', 'min:0'],
            'min_rating' => ['nullable', 'numeric', 'between:0,5'],
            'availability' => ['nullable', Rule::in(['available', 'busy', 'unavailable'])],
            'top_rated' => ['nullable', 'boolean'],
            'verified' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['rating', 'rate_asc', 'rate_desc', 'jss', 'newest'])],
            'per_page' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $profiles = FreelancerProfile::query()
            ->with(['user.city', 'skills'])
            ->whereHas('user', fn ($query) => $query->where('status', User::STATUS_ACTIVE))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('bio', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('skills', fn ($skillQuery) => $skillQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($filters['skill_id'] ?? null, fn ($query, $skillId) => $query->whereHas('skills', fn ($skillQuery) => $skillQuery->where('skills.id', $skillId)))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->whereHas('skills', fn ($skillQuery) => $skillQuery->where('skills.category_id', $categoryId)))
            ->when($filters['city_id'] ?? null, fn ($query, $cityId) => $query->whereHas('user', fn ($userQuery) => $userQuery->where('city_id', $cityId)))
            ->when($filters['min_rate'] ?? null, fn ($query, $minRate) => $query->where('hourly_rate', '>=', $minRate))
            ->when($filters['max_rate'] ?? null, fn ($query, $maxRate) => $query->where('hourly_rate', '<=', $maxRate))
            ->when($filters['min_rating'] ?? null, fn ($query, $minRating) => $query->where('rating', '>=', $minRating))
            ->when($filters['availability'] ?? null, fn ($query, $availability) => $query->where('availability', $availability))
            ->when($request->boolean('top_rated'), fn ($query) => $query->where('is_top_rated', true))
            ->when($request->boolean('verified'), fn ($query) => $query->where('is_verified', true))
            ->when($filters['sort'] ?? 'rating', fn ($query, $sort) => match ($sort) {
                'rate_asc' => $query->orderBy('hourly_rate'),
                'rate_desc' => $query->orderByDesc('hourly_rate'),
                'jss' => $query->orderByDesc('job_success_score'),
                'newest' => $query->latest(),
                default => $query->orderByDesc('rating'),
            })
            ->paginate($request->integer('per_page', 15));

        return FreelancerProfileResource::collection($profiles);
    }

    /**
     * Freelancer public profile
     *
     * Full public profile (headline, skills, portfolio, stats). Contact
     * details stay hidden until an order exists — retention rule 5.
     *
     * @unauthenticated
     */
    public function show(User $user): FreelancerProfileResource
    {
        abort_unless($user->freelancerProfile !== null, 404, 'This user is not a freelancer.');

        return new FreelancerProfileResource(
            $user->freelancerProfile->load(['user.city', 'skills', 'portfolioItems']),
        );
    }

    /**
     * Freelancer reviews
     *
     * Published, order-verified reviews received by this freelancer (FIT-REV-03).
     *
     * @unauthenticated
     */
    public function reviews(User $user): AnonymousResourceCollection
    {
        return ReviewResource::collection(
            Review::query()
                ->where('reviewee_id', $user->id)
                ->where('status', Review::STATUS_PUBLISHED)
                ->with(['reviewer'])
                ->latest()
                ->paginate(15),
        );
    }
}
