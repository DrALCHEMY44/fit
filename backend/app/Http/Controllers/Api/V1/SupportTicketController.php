<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupportTicketMessageResource;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Support')]
class SupportTicketController extends Controller
{
    /**
     * My support tickets
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return SupportTicketResource::collection(
            SupportTicket::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * Open a support ticket
     *
     * Non-dispute assistance requests (FIT-DIS-05).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high'])],
        ]);

        $ticket = SupportTicket::query()->create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'],
            'priority' => $data['priority'] ?? 'normal',
        ]);

        $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['message'],
        ]);

        return new SupportTicketResource($ticket->load('messages'))->response()->setStatusCode(201);
    }

    /**
     * Ticket details
     */
    public function show(Request $request, SupportTicket $ticket): SupportTicketResource
    {
        abort_unless($ticket->user_id === $request->user()->id, 403, 'This ticket is not yours.');

        return new SupportTicketResource($ticket->load('messages.sender'));
    }

    /**
     * Reply to a ticket
     */
    public function reply(Request $request, SupportTicket $ticket): JsonResponse
    {
        abort_unless($ticket->user_id === $request->user()->id, 403, 'This ticket is not yours.');
        abort_if($ticket->status === SupportTicket::STATUS_CLOSED, 422, 'This ticket is closed.');

        $data = $request->validate(['message' => ['required', 'string', 'max:5000']]);

        $message = $ticket->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['message'],
        ]);

        $ticket->update(['status' => SupportTicket::STATUS_OPEN]);

        return new SupportTicketMessageResource($message)->response()->setStatusCode(201);
    }
}
