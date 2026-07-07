<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\ServiceResource;
use App\Models\JobPost;
use App\Models\Review;
use App\Models\Service;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Moderation')]
class ModerationAdminController extends Controller
{
    /**
     * List jobs (moderation)
     *
     * All jobs including drafts and contact-flagged ones (FIT-JOB-08 review
     * queue). Filter with `flagged=true` to see anti-bypass hits.
     */
    public function jobs(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['draft', 'open', 'in_selection', 'contracted', 'closed', 'cancelled'])],
            'flagged' => ['nullable', 'boolean'],
        ]);

        return JobPostResource::collection(
            JobPost::query()
                ->with(['client', 'category'])
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->when($request->boolean('flagged'), fn ($query) => $query->where('contact_flagged', true))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Moderate a job
     *
     * Feature, unflag, close or cancel a job (admin "Jobs et services" module).
     */
    public function updateJob(Request $request, JobPost $job, AuditLogger $audit): JobPostResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['open', 'closed', 'cancelled'])],
            'is_featured' => ['sometimes', 'boolean'],
            'contact_flagged' => ['sometimes', 'boolean'],
        ]);

        $job->update($data);
        $audit->log($request->user(), 'job.moderate', $job, $data);

        return new JobPostResource($job->fresh(['client', 'category']));
    }

    /**
     * List services (moderation)
     */
    public function services(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['active', 'paused', 'removed'])],
        ]);

        return ServiceResource::collection(
            Service::query()
                ->with(['freelancer', 'category'])
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Moderate a service
     *
     * Remove, restore or feature a service.
     */
    public function updateService(Request $request, Service $service, AuditLogger $audit): ServiceResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['active', 'paused', 'removed'])],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $service->update($data);
        $audit->log($request->user(), 'service.moderate', $service, $data);

        return new ServiceResource($service->fresh(['freelancer', 'category']));
    }

    /**
     * List reviews (moderation)
     *
     * Review moderation queue (FIT-REV-05).
     */
    public function reviews(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['published', 'hidden', 'flagged'])],
        ]);

        return ReviewResource::collection(
            Review::query()
                ->with(['reviewer', 'reviewee'])
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Moderate a review
     *
     * Hide abusive reviews or restore them.
     */
    public function updateReview(Request $request, Review $review, AuditLogger $audit): ReviewResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['published', 'hidden', 'flagged'])],
        ]);

        $review->update($data);
        $audit->log($request->user(), 'review.moderate', $review, $data);

        return new ReviewResource($review->fresh(['reviewer', 'reviewee']));
    }
}
