<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VerificationRequestResource;
use App\Models\VerificationRequest;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Verification')]
class VerificationController extends Controller
{
    /**
     * Submit verification documents
     *
     * Uploads an identity or business document for admin review (FIT-TRU-03).
     * An approved identity request grants the "verified" badge (FIT-TRU-04).
     */
    public function store(Request $request): JsonResponse
    {
        abort_if(
            $request->user()->verificationRequests()->where('status', VerificationRequest::STATUS_PENDING)->exists(),
            422,
            'You already have a verification request pending review.',
        );

        $data = $request->validate([
            'type' => ['required', Rule::in(['identity', 'business', 'skill'])],
            'document_type' => ['nullable', Rule::in(['national_id', 'passport', 'driving_license', 'business_registration', 'other'])],
            'document' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $verification = $request->user()->verificationRequests()->create([
            'type' => $data['type'],
            'document_type' => $data['document_type'] ?? null,
            'document_path' => $request->file('document')->store('verifications', 'local'),
            'note' => $data['note'] ?? null,
        ]);

        return new VerificationRequestResource($verification)->response()->setStatusCode(201);
    }

    /**
     * My verification requests
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return VerificationRequestResource::collection(
            $request->user()->verificationRequests()->latest()->get(),
        );
    }
}
