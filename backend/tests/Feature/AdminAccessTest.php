<?php

use App\Models\User;
use App\Models\Withdrawal;

it('blocks non-admins from the admin API', function () {
    $user = User::factory()->client()->create();

    $this->actingAs($user)->getJson('/api/v1/admin/dashboard')->assertForbidden();
    $this->actingAs($user)->getJson('/api/v1/admin/users')->assertForbidden();
});

it('serves platform KPIs to admins', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->getJson('/api/v1/admin/dashboard')
        ->assertSuccessful()
        ->assertJsonStructure(['users', 'jobs', 'orders', 'finance', 'disputes']);
});

it('lets admins suspend and reactivate users with an audit trail', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->client()->create();

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/suspend", ['reason' => 'Fraud reports'])
        ->assertSuccessful();

    expect($target->fresh()->status)->toBe(User::STATUS_SUSPENDED);

    $this->assertDatabaseHas('admin_audit_logs', [
        'admin_id' => $admin->id,
        'action' => 'user.suspend',
        'entity_id' => $target->id,
    ]);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/users/{$target->id}/activate")
        ->assertSuccessful();

    expect($target->fresh()->status)->toBe(User::STATUS_ACTIVE);
});

it('processes a withdrawal through approve and mark-paid', function () {
    $admin = User::factory()->admin()->create();
    $freelancer = User::factory()->freelancer()->create();
    $freelancer->wallet()->create(['available_balance' => 0, 'total_withdrawn' => 0]);

    $withdrawal = Withdrawal::query()->create([
        'reference' => 'FIT-WDR-TEST000001',
        'user_id' => $freelancer->id,
        'amount' => 25000,
        'method' => 'mtn_momo',
        'account_number' => '237677889900',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/withdrawals/{$withdrawal->id}/approve")
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'approved');

    $this->actingAs($admin)
        ->postJson("/api/v1/admin/withdrawals/{$withdrawal->id}/mark-paid")
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'paid');

    expect((float) $freelancer->wallet->fresh()->total_withdrawn)->toBe(25000.0);
});
