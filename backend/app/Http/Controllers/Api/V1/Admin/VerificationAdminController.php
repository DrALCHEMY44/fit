<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\VerificationRequestResource;
use App\Models\VerificationRequest;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Verification')]
class VerificationAdminController extends Controller
{
    /**
     * Verification queue
     *
     * Identity/business documents awaiting review (FIT-TRU-03).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        return VerificationRequestResource::collection(
            VerificationRequest::query()
                ->with('user')
                ->when(
                    $request->string('status')->toString(),
                    fn ($query, $status) => $query->where('status', $status),
                    fn ($query) => $query->where('status', VerificationRequest::STATUS_PENDING),
                )
                ->oldest()
                ->paginate(20),
        );
    }

    /**
     * Approve verification
     *
     * Grants the verified badge on the freelancer profile (FIT-TRU-04).
     */
    public function approve(Request $request, VerificationRequest $verificationRequest, AuditLogger $audit, NotificationService $notifications): VerificationRequestResource
    {
        abort_unless($verificationRequest->status === VerificationRequest::STATUS_PENDING, 422, 'Already reviewed.');

        $verificationRequest->update([
            'status' => VerificationRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($verificationRequest->type === 'identity') {
            $verificationRequest->user->freelancerProfile?->update(['is_verified' => true]);
        }

        $audit->log($request->user(), 'verification.approve', $verificationRequest);

        $notifications->notify(
            $verificationRequest->user,
            'system',
            'Verification approved ✅',
            'Your documents were approved. Your profile now shows the verified badge.',
        );

        return new VerificationRequestResource($verificationRequest->fresh('user'));
    }

    /**
     * Reject verification
     */
    public function reject(Request $request, VerificationRequest $verificationRequest, AuditLogger $audit, NotificationService $notifications): VerificationRequestResource
    {
        abort_unless($verificationRequest->status === VerificationRequest::STATUS_PENDING, 422, 'Already reviewed.');

        $data = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        $verificationRequest->update([
            'status' => VerificationRequest::STATUS_REJECTED,
            'rejection_reason' => $data['reason'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $audit->log($request->user(), 'verification.reject', $verificationRequest, ['reason' => $data['reason']]);

        $notifications->notify(
            $verificationRequest->user,
            'system',
            'Verification rejected',
            $data['reason'],
        );

        return new VerificationRequestResource($verificationRequest->fresh('user'));
    }
}
