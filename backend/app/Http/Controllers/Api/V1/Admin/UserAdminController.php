<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

#[Group('Admin — Users')]
class UserAdminController extends Controller
{
    /**
     * List users
     *
     * Search and filter all accounts (FIT-ADM-02): by role, status, city or
     * keyword on name/email/phone.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(['client', 'freelancer', 'admin', 'super_admin'])],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'banned'])],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
        ]);

        return UserResource::collection(
            User::query()
                ->with(['city', 'clientProfile', 'freelancerProfile'])
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                    fn ($q) => $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%"),
                ))
                ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
                ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
                ->when($filters['city_id'] ?? null, fn ($query, $cityId) => $query->where('city_id', $cityId))
                ->latest()
                ->paginate(20),
        );
    }

    /**
     * User details
     */
    public function show(User $user): UserResource
    {
        return new UserResource(
            $user->load(['city', 'clientProfile', 'freelancerProfile.skills', 'verificationRequests']),
        );
    }

    /**
     * Suspend a user
     *
     * Blocks the account from all authenticated endpoints and revokes its
     * tokens. Logged in the admin audit trail (FIT-ADM-09).
     */
    public function suspend(Request $request, User $user, AuditLogger $audit): UserResource
    {
        abort_if($user->isAdmin() && $request->user()->role !== User::ROLE_SUPER_ADMIN, 403, 'Only a super admin can suspend admins.');

        $data = $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $user->update(['status' => User::STATUS_SUSPENDED]);
        $user->tokens()->delete();

        $audit->log($request->user(), 'user.suspend', $user, ['reason' => $data['reason'] ?? null]);

        return new UserResource($user->fresh());
    }

    /**
     * Reactivate a user
     */
    public function activate(Request $request, User $user, AuditLogger $audit): UserResource
    {
        $user->update(['status' => User::STATUS_ACTIVE, 'locked_until' => null, 'failed_login_attempts' => 0]);

        $audit->log($request->user(), 'user.activate', $user);

        return new UserResource($user->fresh());
    }

    /**
     * Change a user's role
     *
     * Grants or removes marketplace/admin roles. Only super admins can grant
     * admin roles.
     */
    public function updateRole(Request $request, User $user, AuditLogger $audit): UserResource
    {
        $data = $request->validate([
            'role' => ['required', Rule::in(['client', 'freelancer', 'admin', 'super_admin'])],
        ]);

        if (in_array($data['role'], ['admin', 'super_admin'], true)) {
            abort_unless($request->user()->role === User::ROLE_SUPER_ADMIN, 403, 'Only a super admin can grant admin roles.');
        }

        $user->update(['role' => $data['role']]);

        $audit->log($request->user(), 'user.role_change', $user, ['role' => $data['role']]);

        return new UserResource($user->fresh());
    }
}
