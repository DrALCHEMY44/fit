<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\JobPost;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Proposal;
use App\Models\Service;
use App\Models\User;
use App\Models\Withdrawal;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;

#[Group('Admin — Dashboard')]
class DashboardController extends Controller
{
    /**
     * Platform KPIs
     *
     * Global statistics for the admin dashboard (FIT-ADM-01): users,
     * freelancers, clients, open jobs, active orders, revenue (commissions),
     * pending withdrawals and open disputes.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'users' => [
                'total' => User::query()->count(),
                'freelancers' => User::query()->where('role', User::ROLE_FREELANCER)->count(),
                'clients' => User::query()->where('role', User::ROLE_CLIENT)->count(),
                'suspended' => User::query()->where('status', User::STATUS_SUSPENDED)->count(),
                'new_this_month' => User::query()->where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'jobs' => [
                'open' => JobPost::query()->whereIn('status', ['open', 'in_selection'])->count(),
                'total' => JobPost::query()->count(),
                'flagged' => JobPost::query()->where('contact_flagged', true)->count(),
            ],
            'services' => [
                'active' => Service::query()->where('status', 'active')->count(),
            ],
            'proposals' => [
                'total' => Proposal::query()->count(),
                'pending' => Proposal::query()->where('status', 'pending')->count(),
            ],
            'orders' => [
                'active' => Order::query()->whereIn('status', ['active', 'submitted', 'revision_requested'])->count(),
                'completed' => Order::query()->where('status', 'completed')->count(),
                'disputed' => Order::query()->where('status', 'disputed')->count(),
                'gross_volume' => (float) Order::query()->whereNotNull('paid_at')->sum('amount'),
            ],
            'finance' => [
                'commission_revenue' => (float) Order::query()->where('status', 'completed')->sum('commission_amount'),
                'payments_successful' => (float) Payment::query()->where('status', 'successful')->sum('amount'),
                'payments_pending' => Payment::query()->where('status', 'pending')->count(),
                'withdrawals_pending' => Withdrawal::query()->where('status', 'pending')->count(),
                'withdrawals_pending_amount' => (float) Withdrawal::query()->where('status', 'pending')->sum('amount'),
            ],
            'disputes' => [
                'open' => Dispute::query()->whereIn('status', ['open', 'under_review'])->count(),
            ],
        ]);
    }
}
