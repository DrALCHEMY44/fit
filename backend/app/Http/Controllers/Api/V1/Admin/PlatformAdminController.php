<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Broadcast;
use App\Models\Notification;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

#[Group('Admin — Platform')]
class PlatformAdminController extends Controller
{
    /**
     * Platform settings
     *
     * Every configurable value: commission rate, connects pricing, exchange
     * rate, withdrawal minimums (FIT-ADM-07).
     */
    public function settings(): JsonResponse
    {
        return response()->json(
            PlatformSetting::query()->pluck('value', 'key'),
        );
    }

    /**
     * Update platform settings
     *
     * Upserts the given key/value pairs. Every change is audit-logged.
     */
    public function updateSettings(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'commission_rate' => ['sometimes', 'numeric', 'between:0,0.5'],
            'default_connects_per_proposal' => ['sometimes', 'integer', 'between:1,50'],
            'free_connects_on_signup' => ['sometimes', 'integer', 'between:0,100'],
            'referral_bonus_connects' => ['sometimes', 'integer', 'between:0,100'],
            'xaf_per_usd' => ['sometimes', 'numeric', 'min:1'],
            'min_withdrawal_amount' => ['sometimes', 'numeric', 'min:0'],
        ]);

        foreach ($data as $key => $value) {
            PlatformSetting::set($key, $value);
        }

        $audit->log($request->user(), 'settings.update', null, $data);

        return response()->json(PlatformSetting::query()->pluck('value', 'key'));
    }

    /**
     * Send a broadcast
     *
     * Creates an in-app notification for every user in the selected audience
     * (admin "System Broadcasts" module).
     */
    public function broadcast(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'audience' => ['required', Rule::in(['all', 'freelancers', 'clients'])],
        ]);

        $recipients = User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->when($data['audience'] === 'freelancers', fn ($query) => $query->where('role', User::ROLE_FREELANCER))
            ->when($data['audience'] === 'clients', fn ($query) => $query->where('role', User::ROLE_CLIENT))
            ->pluck('id');

        $broadcast = Broadcast::query()->create([
            ...$data,
            'sent_by' => $request->user()->id,
            'recipients_count' => $recipients->count(),
            'sent_at' => now(),
        ]);

        $now = now();
        Notification::query()->insert(
            $recipients->map(fn (int $userId) => [
                'user_id' => $userId,
                'type' => 'broadcast',
                'title' => $data['title'],
                'body' => $data['body'],
                'data' => json_encode(['broadcast_id' => $broadcast->id]),
                'created_at' => $now,
                'updated_at' => $now,
            ])->all(),
        );

        $audit->log($request->user(), 'broadcast.send', $broadcast, ['audience' => $data['audience']]);

        return response()->json([
            'message' => 'Broadcast sent.',
            'recipients' => $recipients->count(),
        ], 201);
    }

    /**
     * List broadcasts
     */
    public function broadcasts(): JsonResponse
    {
        return response()->json(
            Broadcast::query()->with('sender:id,name')->latest()->paginate(20),
        );
    }

    /**
     * Admin audit log
     *
     * Trace of every sensitive admin action (FIT-ADM-09): who, what, when,
     * from which IP.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $request->validate([
            'admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'action' => ['nullable', 'string', 'max:60'],
        ]);

        return response()->json(
            AdminAuditLog::query()
                ->with('admin:id,name,email')
                ->when($request->integer('admin_id'), fn ($query, $adminId) => $query->where('admin_id', $adminId))
                ->when($request->string('action')->toString(), fn ($query, $action) => $query->where('action', 'like', "%{$action}%"))
                ->latest()
                ->paginate(30),
        );
    }

    /**
     * Revenue report
     *
     * Monthly gross volume, commission revenue and completed order counts for
     * the last 12 months (FIT-ADM-08 / admin "Rapports" module).
     */
    public function revenueReport(): JsonResponse
    {
        $rows = Order::query()
            ->selectRaw("DATE_FORMAT(completed_at, '%Y-%m') as month")
            ->selectRaw('COUNT(*) as completed_orders')
            ->selectRaw('SUM(amount) as gross_volume')
            ->selectRaw('SUM(commission_amount) as commission_revenue')
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subMonths(12)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json(['months' => $rows]);
    }
}
