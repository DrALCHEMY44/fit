<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostResource;
use App\Models\ConnectTransaction;
use App\Models\JobPost;
use App\Models\PlatformSetting;
use App\Services\ConnectService;
use App\Services\ContactLeakDetector;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

#[Group('Jobs')]
class JobPostController extends Controller
{
    /**
     * Browse jobs
     *
     * Public feed of open jobs with keyword search, filters and sorting
     * (FIT-SRC-01/02/03). Only `open` and `in_selection` jobs are listed.
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            /** Keyword matched against title and description. @example flutter */
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'budget_type' => ['nullable', Rule::in(['fixed', 'hourly', 'negotiable'])],
            'mode' => ['nullable', Rule::in(['remote', 'onsite', 'hybrid'])],
            'experience_level' => ['nullable', Rule::in(['entry', 'intermediate', 'expert'])],
            'min_budget' => ['nullable', 'numeric', 'min:0'],
            'max_budget' => ['nullable', 'numeric', 'min:0'],
            'skill_id' => ['nullable', 'integer', 'exists:skills,id'],
            'sort' => ['nullable', Rule::in(['newest', 'budget_asc', 'budget_desc', 'proposals'])],
            'per_page' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $jobs = JobPost::query()
            ->with(['category', 'skills', 'city', 'client.clientProfile'])
            ->whereIn('status', [JobPost::STATUS_OPEN, JobPost::STATUS_IN_SELECTION])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(fn ($q) => $q->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%"));
            })
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['city_id'] ?? null, fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->when($filters['budget_type'] ?? null, fn ($query, $budgetType) => $query->where('budget_type', $budgetType))
            ->when($filters['mode'] ?? null, fn ($query, $mode) => $query->where('mode', $mode))
            ->when($filters['experience_level'] ?? null, fn ($query, $level) => $query->where('experience_level', $level))
            ->when($filters['min_budget'] ?? null, fn ($query, $min) => $query->where('budget_max', '>=', $min))
            ->when($filters['max_budget'] ?? null, fn ($query, $max) => $query->where('budget_min', '<=', $max))
            ->when($filters['skill_id'] ?? null, fn ($query, $skillId) => $query->whereHas('skills', fn ($skillQuery) => $skillQuery->where('skills.id', $skillId)))
            ->when($filters['sort'] ?? 'newest', fn ($query, $sort) => match ($sort) {
                'budget_asc' => $query->orderBy('budget_min'),
                'budget_desc' => $query->orderByDesc('budget_max'),
                'proposals' => $query->orderBy('proposals_count'),
                default => $query->orderByDesc('published_at'),
            })
            ->paginate($request->integer('per_page', 15));

        return JobPostResource::collection($jobs);
    }

    /**
     * Job details
     *
     * Full job description with category, skills, attachments and client
     * summary. Increments the view counter.
     *
     * @unauthenticated
     */
    public function show(JobPost $job): JobPostResource
    {
        abort_if($job->status === JobPost::STATUS_DRAFT, 404);

        $job->increment('views_count');

        return new JobPostResource(
            $job->load(['category', 'skills', 'city', 'client.clientProfile', 'attachments']),
        );
    }

    /**
     * Create a job
     *
     * Creates a job as `draft` by default, or publishes it immediately when
     * `publish=true` (FIT-JOB-01 to FIT-JOB-06). Descriptions are screened for
     * external contact details (FIT-JOB-08) — flagged jobs stay pending for
     * moderation review.
     */
    public function store(Request $request, ContactLeakDetector $leakDetector): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'budget_type' => ['required', Rule::in(['fixed', 'hourly', 'negotiable'])],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0', 'gte:budget_min'],
            'currency' => ['nullable', Rule::in(['XAF', 'USD'])],
            'duration' => ['nullable', 'string', 'max:100'],
            'experience_level' => ['nullable', Rule::in(['entry', 'intermediate', 'expert'])],
            'urgency' => ['nullable', Rule::in(['low', 'normal', 'high'])],
            'mode' => ['nullable', Rule::in(['remote', 'onsite', 'hybrid'])],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'skill_ids' => ['nullable', 'array', 'max:15'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
            /** Publish immediately instead of saving as draft. */
            'publish' => ['nullable', 'boolean'],
        ]);

        $contactLeaks = $leakDetector->detect($data['description']);

        $job = JobPost::query()->create([
            ...collect($data)->except(['skill_ids', 'publish'])->all(),
            'client_id' => $request->user()->id,
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(6)),
            'connects_cost' => (int) PlatformSetting::get('default_connects_per_proposal', 6),
            'contact_flagged' => $contactLeaks !== [],
            'status' => $request->boolean('publish') ? JobPost::STATUS_OPEN : JobPost::STATUS_DRAFT,
            'published_at' => $request->boolean('publish') ? now() : null,
        ]);

        $job->skills()->sync($data['skill_ids'] ?? []);

        $request->user()->clientProfile?->increment('jobs_posted_count');

        return response()->json([
            'job' => new JobPostResource($job->load(['category', 'skills', 'city'])),
            'contact_warning' => $contactLeaks !== []
                ? 'Your description appears to contain contact details ('.implode(', ', $contactLeaks).'). For your security, keep discussions and payments on FIT.'
                : null,
        ], 201);
    }

    /**
     * Update a job
     *
     * Only the owning client can edit, and only while the job is `draft` or `open`.
     */
    public function update(Request $request, JobPost $job, ContactLeakDetector $leakDetector): JobPostResource
    {
        $this->authorizeOwner($request, $job);

        abort_unless(
            in_array($job->status, [JobPost::STATUS_DRAFT, JobPost::STATUS_OPEN], true),
            422,
            'Only draft or open jobs can be edited.',
        );

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:10000'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'budget_type' => ['sometimes', Rule::in(['fixed', 'hourly', 'negotiable'])],
            'budget_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'budget_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', Rule::in(['XAF', 'USD'])],
            'duration' => ['sometimes', 'nullable', 'string', 'max:100'],
            'experience_level' => ['sometimes', Rule::in(['entry', 'intermediate', 'expert'])],
            'urgency' => ['sometimes', Rule::in(['low', 'normal', 'high'])],
            'mode' => ['sometimes', Rule::in(['remote', 'onsite', 'hybrid'])],
            'city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
            'deadline' => ['sometimes', 'nullable', 'date', 'after:today'],
            'skill_ids' => ['sometimes', 'array', 'max:15'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        if (isset($data['description'])) {
            $job->contact_flagged = $leakDetector->detect($data['description']) !== [];
        }

        $job->fill(collect($data)->except('skill_ids')->all())->save();

        if (array_key_exists('skill_ids', $data)) {
            $job->skills()->sync($data['skill_ids']);
        }

        return new JobPostResource($job->fresh(['category', 'skills', 'city']));
    }

    /**
     * Publish a job
     *
     * Moves a `draft` job to `open` so freelancers can send proposals (FIT-JOB-07).
     */
    public function publish(Request $request, JobPost $job): JobPostResource
    {
        $this->authorizeOwner($request, $job);
        abort_unless($job->status === JobPost::STATUS_DRAFT, 422, 'Only draft jobs can be published.');

        $job->update(['status' => JobPost::STATUS_OPEN, 'published_at' => now()]);

        return new JobPostResource($job->fresh(['category', 'skills']));
    }

    /**
     * Close a job
     *
     * Stops accepting new proposals without cancelling existing work (FIT-JOB-07).
     */
    public function close(Request $request, JobPost $job): JobPostResource
    {
        $this->authorizeOwner($request, $job);
        abort_unless($job->isOpenForProposals(), 422, 'Only open jobs can be closed.');

        $job->update(['status' => JobPost::STATUS_CLOSED]);

        return new JobPostResource($job->fresh());
    }

    /**
     * Cancel a job
     *
     * Cancels the job and refunds the connects every pending proposal spent
     * (matching the connects refund policy shown in the apps).
     */
    public function cancel(Request $request, JobPost $job): JobPostResource
    {
        $this->authorizeOwner($request, $job);

        abort_if(
            in_array($job->status, [JobPost::STATUS_CONTRACTED, JobPost::STATUS_CANCELLED], true),
            422,
            'Contracted or already cancelled jobs cannot be cancelled.',
        );

        $job->update(['status' => JobPost::STATUS_CANCELLED]);

        $job->proposals()
            ->whereIn('status', ['pending', 'shortlisted'])
            ->with('freelancer')
            ->get()
            ->each(function ($proposal) {
                if ($proposal->connects_spent > 0) {
                    app(ConnectService::class)->credit(
                        $proposal->freelancer,
                        $proposal->connects_spent,
                        ConnectTransaction::TYPE_REFUND,
                        $proposal,
                        'Connects refunded — job cancelled by client',
                    );
                }

                $proposal->update(['status' => 'declined']);
            });

        return new JobPostResource($job->fresh());
    }

    /**
     * My posted jobs
     *
     * The authenticated client's jobs in every status, latest first (FIT-CLI-02).
     */
    public function myJobs(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'open', 'in_selection', 'contracted', 'closed', 'cancelled'])],
        ]);

        return JobPostResource::collection(
            JobPost::query()
                ->where('client_id', $request->user()->id)
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->with(['category', 'skills'])
                ->latest()
                ->paginate(15),
        );
    }

    private function authorizeOwner(Request $request, JobPost $job): void
    {
        abort_unless($job->client_id === $request->user()->id, 403, 'You do not own this job.');
    }
}
