<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipResource;
use App\Http\Resources\SupportTicketMessageResource;
use App\Http\Resources\SupportTicketResource;
use App\Models\Internship;
use App\Models\SupportTicket;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Support & Content')]
class SupportAdminController extends Controller
{
    /**
     * List support tickets
     */
    public function tickets(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['open', 'pending', 'resolved', 'closed'])],
        ]);

        return SupportTicketResource::collection(
            SupportTicket::query()
                ->with('user')
                ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Ticket details (admin)
     */
    public function ticket(SupportTicket $ticket): SupportTicketResource
    {
        return new SupportTicketResource($ticket->load(['user', 'messages.sender']));
    }

    /**
     * Reply to a ticket (staff)
     */
    public function reply(Request $request, SupportTicket $ticket, NotificationService $notifications): JsonResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:5000']]);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['message'],
            'is_staff' => true,
        ]);

        $ticket->update(['status' => SupportTicket::STATUS_PENDING]);

        $notifications->notify(
            $ticket->user,
            'system',
            'Support replied to your ticket',
            str($data['message'])->limit(80)->toString(),
            ['ticket_id' => $ticket->id],
        );

        return new SupportTicketMessageResource($message)->response()->setStatusCode(201);
    }

    /**
     * Update ticket status
     */
    public function updateTicketStatus(Request $request, SupportTicket $ticket, AuditLogger $audit): SupportTicketResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['open', 'pending', 'resolved', 'closed'])],
        ]);

        $ticket->update($data);
        $audit->log($request->user(), 'ticket.status', $ticket, $data);

        return new SupportTicketResource($ticket->fresh());
    }

    /**
     * Create internship posting
     *
     * Publishes an offer in the Internship Hub.
     */
    public function storeInternship(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'max:100'],
            'stipend' => ['nullable', 'string', 'max:100'],
            'is_paid' => ['nullable', 'boolean'],
            'type' => ['required', Rule::in(['remote', 'onsite', 'hybrid'])],
            'skills' => ['nullable', 'array', 'max:15'],
            'skills.*' => ['string', 'max:50'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $internship = Internship::query()->create([...$data, 'posted_by' => $request->user()->id]);
        $audit->log($request->user(), 'internship.create', $internship);

        return new InternshipResource($internship)->response()->setStatusCode(201);
    }

    /**
     * Update internship posting
     */
    public function updateInternship(Request $request, Internship $internship, AuditLogger $audit): InternshipResource
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'company_name' => ['sometimes', 'string', 'max:255'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'duration' => ['sometimes', 'nullable', 'string', 'max:100'],
            'stipend' => ['sometimes', 'nullable', 'string', 'max:100'],
            'is_paid' => ['sometimes', 'boolean'],
            'type' => ['sometimes', Rule::in(['remote', 'onsite', 'hybrid'])],
            'skills' => ['sometimes', 'nullable', 'array', 'max:15'],
            'skills.*' => ['string', 'max:50'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status' => ['sometimes', Rule::in(['open', 'closed'])],
        ]);

        $internship->update($data);
        $audit->log($request->user(), 'internship.update', $internship, $data);

        return new InternshipResource($internship->fresh());
    }
}
