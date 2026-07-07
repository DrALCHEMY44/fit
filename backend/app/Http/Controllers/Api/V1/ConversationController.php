<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\User;
use App\Services\ContactLeakDetector;
use App\Services\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

#[Group('Messaging')]
class ConversationController extends Controller
{
    /**
     * My conversations
     *
     * Conversation threads the authenticated user participates in, most
     * recent first, with the last message and unread count (FIT-CHAT-01).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        return ConversationResource::collection(
            Conversation::query()
                ->where(fn ($query) => $query->where('client_id', $user->id)->orWhere('freelancer_id', $user->id))
                ->with(['client', 'freelancer', 'lastMessage'])
                ->orderByDesc('last_message_at')
                ->paginate(20),
        );
    }

    /**
     * Start a conversation
     *
     * Opens (or returns the existing) thread with another user, optionally
     * linked to a job or an order (FIT-CHAT-03). The client/freelancer sides
     * are derived from who owns which role in the exchange.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'job_post_id' => ['nullable', 'integer', 'exists:job_posts,id'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
        ]);

        $me = $request->user();
        $recipient = User::query()->findOrFail($data['recipient_id']);

        abort_if($recipient->id === $me->id, 422, 'You cannot start a conversation with yourself.');

        // The freelancer side is whoever has the freelancer role in the pair.
        [$clientId, $freelancerId] = $me->isFreelancer() && ! $recipient->isFreelancer()
            ? [$recipient->id, $me->id]
            : [$me->id, $recipient->id];

        $conversation = Conversation::query()->firstOrCreate([
            'client_id' => $clientId,
            'freelancer_id' => $freelancerId,
            'job_post_id' => $data['job_post_id'] ?? null,
            'order_id' => $data['order_id'] ?? null,
        ]);

        return response()->json(
            new ConversationResource($conversation->load(['client', 'freelancer', 'lastMessage'])),
            $conversation->wasRecentlyCreated ? 201 : 200,
        );
    }

    /**
     * Messages in a conversation
     *
     * Paginated message history, newest page first (reverse for display).
     */
    public function messages(Request $request, Conversation $conversation): AnonymousResourceCollection
    {
        abort_unless($conversation->isParticipant($request->user()), 403, 'You are not part of this conversation.');

        return MessageResource::collection(
            $conversation->messages()->with('sender')->latest()->paginate(30),
        );
    }

    /**
     * Send a message
     *
     * Sends text and/or a file attachment (FIT-CHAT-02). Messages containing
     * phone numbers, emails or WhatsApp/Telegram links are delivered but
     * flagged, and the sender receives an anti-bypass warning (FIT-CHAT-04,
     * retention rule 5).
     */
    public function sendMessage(
        Request $request,
        Conversation $conversation,
        ContactLeakDetector $leakDetector,
        NotificationService $notifications,
    ): JsonResponse {
        abort_unless($conversation->isParticipant($request->user()), 403, 'You are not part of this conversation.');

        $data = $request->validate([
            'body' => ['nullable', 'required_without:attachment', 'string', 'max:5000'],
            'attachment' => ['nullable', 'required_without:body', 'file', 'mimes:jpg,jpeg,png,webp,pdf,zip,doc,docx', 'max:10240'],
        ]);

        $contactLeaks = $leakDetector->detect($data['body'] ?? null);

        $attachment = $request->file('attachment');

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['body'] ?? null,
            'attachment_path' => $attachment?->store('chat', 'public'),
            'attachment_name' => $attachment?->getClientOriginalName(),
            'attachment_mime' => $attachment?->getMimeType(),
            'is_flagged' => $contactLeaks !== [],
        ]);

        $conversation->update(['last_message_at' => now()]);

        $recipient = $conversation->otherParticipant($request->user());
        $notifications->notify(
            $recipient,
            'message',
            'New message from '.$request->user()->name,
            str($data['body'] ?? 'Sent an attachment')->limit(80)->toString(),
            ['conversation_id' => $conversation->id, 'message_id' => $message->id],
        );

        return response()->json([
            'message' => new MessageResource($message),
            'contact_warning' => $contactLeaks !== []
                ? 'For your security, keep your discussions, payments and deliveries on FIT. Transactions outside the platform are not protected.'
                : null,
        ], 201);
    }

    /**
     * Mark conversation as read
     *
     * Marks every message from the other participant as read.
     */
    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->isParticipant($request->user()), 403, 'You are not part of this conversation.');

        $updated = $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        return response()->json(['marked_read' => $updated]);
    }
}
