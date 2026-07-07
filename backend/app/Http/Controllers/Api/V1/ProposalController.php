<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProposalResource;
use App\Models\JobPost;
use App\Models\Proposal;
use App\Services\ConnectService;
use App\Services\NotificationService;
use App\Services\OrderService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

#[Group('Proposals')]
class ProposalController extends Controller
{
    /**
     * Submit a proposal
     *
     * A freelancer applies to an open job with a bid, delivery time, cover
     * letter and optional milestone breakdown (FIT-PRO-01). Submitting spends
     * the job's connects cost (FIT-PRO-05) — connects are refunded if the
     * client later cancels the job. One proposal per freelancer per job.
     */
    public function store(Request $request, JobPost $job, ConnectService $connectService, NotificationService $notifications): JsonResponse
    {
        abort_unless($job->isOpenForProposals(), 422, 'This job is not accepting proposals.');
        abort_if($job->client_id === $request->user()->id, 422, 'You cannot apply to your own job.');
        abort_if(
            $job->proposals()->where('freelancer_id', $request->user()->id)->exists(),
            422,
            'You already sent a proposal for this job.',
        );

        $data = $request->validate([
            /** Total bid amount in the job currency. @example 250000 */
            'amount' => ['required', 'numeric', 'min:1'],
            'delivery_days' => ['required', 'integer', 'between:1,365'],
            'cover_letter' => ['required', 'string', 'max:5000'],
            'milestones' => ['nullable', 'array', 'max:10'],
            'milestones.*.title' => ['required_with:milestones', 'string', 'max:255'],
            'milestones.*.amount' => ['required_with:milestones', 'numeric', 'min:1'],
            'milestones.*.due_label' => ['nullable', 'string', 'max:100'],
        ]);

        $proposal = DB::transaction(function () use ($request, $job, $data, $connectService) {
            $proposal = Proposal::query()->create([
                'job_post_id' => $job->id,
                'freelancer_id' => $request->user()->id,
                'amount' => $data['amount'],
                'currency' => $job->currency,
                'delivery_days' => $data['delivery_days'],
                'cover_letter' => $data['cover_letter'],
                'connects_spent' => $job->connects_cost,
                'status' => Proposal::STATUS_PENDING,
            ]);

            foreach ($data['milestones'] ?? [] as $index => $milestone) {
                $proposal->milestones()->create([...$milestone, 'sort_order' => $index]);
            }

            $connectService->spend(
                $request->user(),
                $job->connects_cost,
                $proposal,
                "Proposal for \"{$job->title}\"",
            );

            $job->increment('proposals_count');

            return $proposal;
        });

        $notifications->notify(
            $job->client,
            'proposal',
            'New proposal received',
            "{$request->user()->name} sent a proposal for \"{$job->title}\".",
            ['job_id' => $job->id, 'proposal_id' => $proposal->id],
        );

        return response()->json([
            'proposal' => new ProposalResource($proposal->load('milestones')),
            'connects_spent' => $job->connects_cost,
            'connects_balance' => $request->user()->fresh()->connects_balance,
        ], 201);
    }

    /**
     * Proposals on my job
     *
     * The owning client compares all proposals received on a job (FIT-PRO-02).
     */
    public function forJob(Request $request, JobPost $job): AnonymousResourceCollection
    {
        abort_unless($job->client_id === $request->user()->id, 403, 'You do not own this job.');

        return ProposalResource::collection(
            $job->proposals()
                ->whereNot('status', Proposal::STATUS_WITHDRAWN)
                ->with(['freelancer.freelancerProfile.skills', 'milestones'])
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * My sent proposals
     *
     * The authenticated freelancer's proposals, filterable by status.
     */
    public function mine(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'shortlisted', 'accepted', 'declined', 'withdrawn'])],
        ]);

        return ProposalResource::collection(
            Proposal::query()
                ->where('freelancer_id', $request->user()->id)
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->with(['jobPost.category', 'milestones'])
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * Edit my proposal
     *
     * A freelancer can revise bid, delivery time and cover letter while the
     * proposal is still pending or shortlisted (FIT-PRO-04).
     */
    public function update(Request $request, Proposal $proposal): ProposalResource
    {
        abort_unless($proposal->freelancer_id === $request->user()->id, 403, 'This proposal is not yours.');
        abort_unless($proposal->isEditable(), 422, 'Accepted, declined or withdrawn proposals cannot be edited.');

        $data = $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:1'],
            'delivery_days' => ['sometimes', 'integer', 'between:1,365'],
            'cover_letter' => ['sometimes', 'string', 'max:5000'],
        ]);

        $proposal->update($data);

        return new ProposalResource($proposal->fresh(['milestones']));
    }

    /**
     * Withdraw my proposal
     */
    public function withdraw(Request $request, Proposal $proposal): ProposalResource
    {
        abort_unless($proposal->freelancer_id === $request->user()->id, 403, 'This proposal is not yours.');
        abort_unless($proposal->isEditable(), 422, 'This proposal can no longer be withdrawn.');

        $proposal->update(['status' => Proposal::STATUS_WITHDRAWN]);

        return new ProposalResource($proposal);
    }

    /**
     * Shortlist a proposal
     *
     * The client marks a proposal as shortlisted while comparing candidates
     * (FIT-PRO-03). Also moves the job to `in_selection`.
     */
    public function shortlist(Request $request, Proposal $proposal): ProposalResource
    {
        $this->authorizeJobOwner($request, $proposal);
        abort_unless($proposal->status === Proposal::STATUS_PENDING, 422, 'Only pending proposals can be shortlisted.');

        $proposal->update(['status' => Proposal::STATUS_SHORTLISTED]);
        $proposal->jobPost->update(['status' => JobPost::STATUS_IN_SELECTION]);

        return new ProposalResource($proposal->fresh());
    }

    /**
     * Decline a proposal
     */
    public function decline(Request $request, Proposal $proposal, NotificationService $notifications): ProposalResource
    {
        $this->authorizeJobOwner($request, $proposal);
        abort_unless($proposal->isEditable(), 422, 'This proposal was already processed.');

        $proposal->update(['status' => Proposal::STATUS_DECLINED]);

        $notifications->notify(
            $proposal->freelancer,
            'proposal',
            'Proposal declined',
            "Your proposal for \"{$proposal->jobPost->title}\" was declined.",
            ['proposal_id' => $proposal->id],
        );

        return new ProposalResource($proposal->fresh());
    }

    /**
     * Accept a proposal
     *
     * Accepting creates the order contract automatically (FIT-ORD-01): the job
     * flips to `contracted`, other pending proposals are declined, and the
     * order starts in `pending_payment` with any proposed milestones copied
     * over. The client then pays via `POST /orders/{order}/pay`.
     */
    public function accept(Request $request, Proposal $proposal, OrderService $orderService): JsonResponse
    {
        $this->authorizeJobOwner($request, $proposal);
        abort_unless($proposal->isEditable(), 422, 'This proposal was already processed.');

        $order = $orderService->createFromProposal($proposal);

        return response()->json([
            'order' => new OrderResource($order->load(['milestones', 'client', 'freelancer'])),
        ], 201);
    }

    private function authorizeJobOwner(Request $request, Proposal $proposal): void
    {
        abort_unless($proposal->jobPost->client_id === $request->user()->id, 403, 'You do not own the job this proposal belongs to.');
    }
}
