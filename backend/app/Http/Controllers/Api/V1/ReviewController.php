<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Services\NotificationService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

#[Group('Reviews')]
class ReviewController extends Controller
{
    /**
     * Review an order
     *
     * Leaves a verified review after completion (FIT-REV-01/02/03): the client
     * rates the freelancer, or the freelancer rates the client. Only completed
     * orders can be reviewed, once per side. Criteria sub-ratings (quality,
     * communication, deadline, professionalism — FIT-REV-04) are optional.
     * The reviewee's average rating and reviews count update automatically.
     */
    public function store(Request $request, Order $order, NotificationService $notifications): JsonResponse
    {
        abort_unless($order->isParticipant($request->user()), 403, 'You are not a participant of this order.');
        abort_unless($order->status === Order::STATUS_COMPLETED, 422, 'Only completed orders can be reviewed.');
        abort_if(
            $order->reviews()->where('reviewer_id', $request->user()->id)->exists(),
            422,
            'You already reviewed this order.',
        );

        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'rating_quality' => ['nullable', 'integer', 'between:1,5'],
            'rating_communication' => ['nullable', 'integer', 'between:1,5'],
            'rating_deadline' => ['nullable', 'integer', 'between:1,5'],
            'rating_professionalism' => ['nullable', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:3000'],
        ]);

        $reviewee = $request->user()->id === $order->client_id ? $order->freelancer : $order->client;

        $review = DB::transaction(function () use ($request, $order, $data, $reviewee) {
            $review = Review::query()->create([
                ...$data,
                'order_id' => $order->id,
                'reviewer_id' => $request->user()->id,
                'reviewee_id' => $reviewee->id,
            ]);

            $this->refreshRating($reviewee->id);

            return $review;
        });

        $notifications->notify(
            $reviewee,
            'review',
            'New review received',
            "{$request->user()->name} rated your collaboration on {$order->number} {$data['rating']}/5.",
            ['order_id' => $order->id, 'review_id' => $review->id],
        );

        return new ReviewResource($review->load(['reviewer', 'reviewee']))->response()->setStatusCode(201);
    }

    /**
     * Reviews for an order
     *
     * Both sides' reviews on the order, visible to its participants.
     */
    public function forOrder(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->isParticipant($request->user()), 403, 'You are not a participant of this order.');

        return response()->json(
            ReviewResource::collection($order->reviews()->with(['reviewer', 'reviewee'])->get()),
        );
    }

    private function refreshRating(int $userId): void
    {
        $stats = Review::query()
            ->where('reviewee_id', $userId)
            ->where('status', Review::STATUS_PUBLISHED)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        $user = User::query()->find($userId);

        $user?->freelancerProfile?->update([
            'rating' => round((float) $stats->avg_rating, 2),
            'reviews_count' => (int) $stats->total,
        ]);

        $user?->clientProfile?->update([
            'rating' => round((float) $stats->avg_rating, 2),
            'reviews_count' => (int) $stats->total,
        ]);
    }
}
