<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

#[Group('Notifications')]
class NotificationController extends Controller
{
    /**
     * My notifications
     *
     * The in-app notification center (FIT-NOT-04), newest first. Pass
     * `unread=true` to only fetch unread items.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['unread' => ['nullable', 'boolean']]);

        return NotificationResource::collection(
            $request->user()->appNotifications()
                ->when($request->boolean('unread'), fn ($query) => $query->whereNull('read_at'))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * Mark one notification read
     */
    public function markRead(Request $request, Notification $notification): NotificationResource
    {
        abort_unless($notification->user_id === $request->user()->id, 403, 'This notification is not yours.');

        $notification->update(['read_at' => $notification->read_at ?? now()]);

        return new NotificationResource($notification);
    }

    /**
     * Mark all notifications read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $request->user()->appNotifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['marked_read' => $updated]);
    }
}
