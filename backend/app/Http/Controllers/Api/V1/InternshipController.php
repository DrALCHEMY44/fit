<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use App\Models\InternshipApplication;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Internships')]
class InternshipController extends Controller
{
    /**
     * Browse internships
     *
     * Public Internship Hub feed with keyword search and type filter
     * (Remote / On-site / Hybrid), matching the web and mobile screens.
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(['remote', 'onsite', 'hybrid'])],
            'paid_only' => ['nullable', 'boolean'],
        ]);

        return InternshipResource::collection(
            Internship::query()
                ->where('status', 'open')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                    fn ($q) => $q->where('title', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%"),
                ))
                ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
                ->when($request->boolean('paid_only'), fn ($query) => $query->where('is_paid', true))
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * Internship details
     *
     * @unauthenticated
     */
    public function show(Internship $internship): InternshipResource
    {
        return new InternshipResource($internship);
    }

    /**
     * Apply to an internship
     *
     * Submits a cover letter and optional CV (PDF). One application per user
     * per internship.
     */
    public function apply(Request $request, Internship $internship): JsonResponse
    {
        abort_unless($internship->status === 'open', 422, 'This internship is closed.');
        abort_if(
            $internship->applications()->where('user_id', $request->user()->id)->exists(),
            422,
            'You already applied to this internship.',
        );

        $data = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:8192'],
        ]);

        $application = $internship->applications()->create([
            'user_id' => $request->user()->id,
            'cover_letter' => $data['cover_letter'] ?? null,
            'cv_path' => $request->file('cv')?->store('cvs', 'local'),
        ]);

        return response()->json([
            'message' => 'Application submitted.',
            'application_id' => $application->id,
        ], 201);
    }

    /**
     * My internship applications
     */
    public function myApplications(Request $request): JsonResponse
    {
        $applications = InternshipApplication::query()
            ->where('user_id', $request->user()->id)
            ->with('internship')
            ->latest()
            ->get()
            ->map(fn ($application) => [
                'id' => $application->id,
                'status' => $application->status,
                'internship' => new InternshipResource($application->internship),
                'created_at' => $application->created_at,
            ]);

        return response()->json(['data' => $applications]);
    }
}
