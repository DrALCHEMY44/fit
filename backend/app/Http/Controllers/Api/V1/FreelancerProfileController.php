<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FreelancerProfileResource;
use App\Http\Resources\PortfolioItemResource;
use App\Models\FreelancerProfile;
use App\Models\PortfolioItem;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('My Account')]
class FreelancerProfileController extends Controller
{
    /**
     * My freelancer profile
     *
     * The authenticated user's freelancer profile with skills and portfolio.
     */
    public function show(Request $request): FreelancerProfileResource
    {
        return new FreelancerProfileResource(
            $this->profileFor($request)->load(['skills', 'portfolioItems']),
        );
    }

    /**
     * Update my freelancer profile
     *
     * Professional headline, bio, rates and availability (FIT-FRL-01 to
     * FIT-FRL-05). The profile completion indicator is recalculated after
     * each update (FIT-ONB-05).
     */
    public function update(Request $request): FreelancerProfileResource
    {
        $profile = $this->profileFor($request);

        $data = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'experience_level' => ['sometimes', Rule::in(['entry', 'intermediate', 'expert'])],
            'hourly_rate' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'min_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'availability' => ['sometimes', Rule::in(['available', 'busy', 'unavailable'])],
        ]);

        $profile->update($data);
        $profile->recalculateCompletion();

        return new FreelancerProfileResource($profile->fresh(['skills', 'portfolioItems']));
    }

    /**
     * Set my skills
     *
     * Replaces the freelancer's skill list (FIT-FRL-02). Pass the full set of
     * skill IDs; anything omitted is removed.
     */
    public function syncSkills(Request $request): FreelancerProfileResource
    {
        $data = $request->validate([
            'skill_ids' => ['required', 'array', 'min:1', 'max:30'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        $profile = $this->profileFor($request);
        $profile->skills()->sync($data['skill_ids']);
        $profile->recalculateCompletion();

        return new FreelancerProfileResource($profile->fresh(['skills', 'portfolioItems']));
    }

    /**
     * List my portfolio
     */
    public function portfolio(Request $request): AnonymousResourceCollection
    {
        return PortfolioItemResource::collection(
            $this->profileFor($request)->portfolioItems()->latest()->get(),
        );
    }

    /**
     * Add portfolio item
     *
     * Accepts an image/PDF upload or an external link (FIT-FRL-03).
     */
    public function storePortfolioItem(Request $request): PortfolioItemResource
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file' => ['nullable', 'required_without:link_url', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
            'link_url' => ['nullable', 'required_without:file', 'url', 'max:255'],
        ]);

        $profile = $this->profileFor($request);

        $filePath = $request->hasFile('file')
            ? $request->file('file')->store('portfolio', 'public')
            : null;

        $item = $profile->portfolioItems()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $filePath,
            'link_url' => $data['link_url'] ?? null,
            'type' => $filePath === null ? 'link' : ($request->file('file')->getMimeType() === 'application/pdf' ? 'pdf' : 'image'),
        ]);

        $profile->recalculateCompletion();

        return new PortfolioItemResource($item);
    }

    /**
     * Delete portfolio item
     */
    public function destroyPortfolioItem(Request $request, PortfolioItem $portfolioItem): JsonResponse
    {
        abort_unless(
            $portfolioItem->freelancer_profile_id === $this->profileFor($request)->id,
            403,
            'This portfolio item does not belong to you.',
        );

        $portfolioItem->delete();

        return response()->json(['message' => 'Portfolio item removed.']);
    }

    private function profileFor(Request $request): FreelancerProfile
    {
        return FreelancerProfile::query()->firstOrCreate(['user_id' => $request->user()->id]);
    }
}
