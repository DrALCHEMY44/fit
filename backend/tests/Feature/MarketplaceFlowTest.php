<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Skill;
use App\Models\User;

beforeEach(function () {
    $this->category = Category::query()->create([
        'name_en' => 'Development & IT',
        'name_fr' => 'Développement & IT',
        'slug' => 'development-it',
    ]);

    $this->skill = Skill::query()->create([
        'name' => 'React',
        'slug' => 'react',
        'category_id' => $this->category->id,
    ]);

    $this->client = User::factory()->client()->create();
    $this->freelancer = User::factory()->freelancer()->create(['connects_balance' => 20]);
});

it('runs the full job → proposal → order → escrow → delivery → review lifecycle', function () {
    // 1. Client publishes a job.
    $jobResponse = $this->actingAs($this->client)->postJson('/api/v1/jobs', [
        'title' => 'Build a dashboard',
        'description' => 'We need a clean analytics dashboard for our platform.',
        'category_id' => $this->category->id,
        'budget_type' => 'fixed',
        'budget_min' => 100000,
        'budget_max' => 100000,
        'skill_ids' => [$this->skill->id],
        'publish' => true,
    ]);

    $jobResponse->assertCreated()->assertJsonPath('job.status', 'open');
    $jobId = $jobResponse->json('job.id');

    // 2. Freelancer submits a proposal, spending connects.
    $proposalResponse = $this->actingAs($this->freelancer)->postJson("/api/v1/jobs/{$jobId}/proposals", [
        'amount' => 100000,
        'delivery_days' => 10,
        'cover_letter' => 'I have shipped three similar dashboards; happy to share them.',
    ]);

    $proposalResponse->assertCreated()->assertJsonPath('connects_balance', 14);
    $proposalId = $proposalResponse->json('proposal.id');

    // 3. Client accepts the proposal — an order is created.
    $acceptResponse = $this->actingAs($this->client)->postJson("/api/v1/proposals/{$proposalId}/accept");
    $acceptResponse->assertCreated()->assertJsonPath('order.status', 'pending_payment');
    $orderId = $acceptResponse->json('order.id');

    expect(Order::query()->find($orderId)->jobPost->status)->toBe('contracted');

    // 4. Client pays; sandbox confirmation activates the order and escrows funds.
    $payResponse = $this->actingAs($this->client)->postJson("/api/v1/orders/{$orderId}/pay", [
        'provider' => 'mtn_momo',
        'phone_number' => '237677001122',
    ]);
    $payResponse->assertCreated();
    $reference = $payResponse->json('payment.reference');

    $this->actingAs($this->client)
        ->postJson("/api/v1/payments/{$reference}/confirm-sandbox")
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'successful');

    expect(Order::query()->find($orderId)->status)->toBe('active');

    $this->actingAs($this->freelancer)->getJson('/api/v1/wallet')
        ->assertSuccessful()
        ->assertJsonPath('data.pending_balance', 100000)
        ->assertJsonPath('data.available_balance', 0);

    // 5. Freelancer delivers.
    $deliveryResponse = $this->actingAs($this->freelancer)->postJson("/api/v1/orders/{$orderId}/deliveries", [
        'message' => 'Dashboard delivered — staging link attached.',
        'link_url' => 'https://staging.example.com',
    ]);
    $deliveryResponse->assertCreated();
    $deliveryId = $deliveryResponse->json('data.id');

    expect(Order::query()->find($orderId)->status)->toBe('submitted');

    // 6. Client approves — order completes, escrow released minus 10% commission.
    $this->actingAs($this->client)
        ->postJson("/api/v1/deliveries/{$deliveryId}/approve")
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'completed');

    $this->actingAs($this->freelancer)->getJson('/api/v1/wallet')
        ->assertSuccessful()
        ->assertJsonPath('data.pending_balance', 0)
        ->assertJsonPath('data.available_balance', 90000);

    // 7. Both sides leave verified reviews.
    $this->actingAs($this->client)->postJson("/api/v1/orders/{$orderId}/reviews", [
        'rating' => 5,
        'comment' => 'Excellent work, delivered on time.',
    ])->assertCreated();

    $this->actingAs($this->freelancer)->postJson("/api/v1/orders/{$orderId}/reviews", [
        'rating' => 5,
        'comment' => 'Great client, clear brief.',
    ])->assertCreated();

    expect((float) $this->freelancer->freelancerProfile->fresh()->rating)->toBe(5.0);

    // 8. Freelancer withdraws earnings.
    $withdrawalResponse = $this->actingAs($this->freelancer)->postJson('/api/v1/withdrawals', [
        'amount' => 50000,
        'method' => 'mtn_momo',
        'account_number' => '237677445566',
    ]);
    $withdrawalResponse->assertCreated()->assertJsonPath('data.status', 'pending');

    $this->actingAs($this->freelancer)->getJson('/api/v1/wallet')
        ->assertJsonPath('data.available_balance', 40000);
});

it('rejects proposals when the freelancer lacks connects', function () {
    $this->freelancer->forceFill(['connects_balance' => 2])->save();

    $job = $this->actingAs($this->client)->postJson('/api/v1/jobs', [
        'title' => 'Small job',
        'description' => 'A very small task for testing purposes.',
        'category_id' => $this->category->id,
        'budget_type' => 'fixed',
        'publish' => true,
    ])->json('job.id');

    $this->actingAs($this->freelancer)->postJson("/api/v1/jobs/{$job}/proposals", [
        'amount' => 5000,
        'delivery_days' => 2,
        'cover_letter' => 'I can do this quickly.',
    ])->assertUnprocessable()->assertJsonValidationErrors(['connects']);
});

it('prevents non-participants from viewing an order', function () {
    $order = Order::query()->create([
        'number' => 'FIT-ORD-2026-000099',
        'client_id' => $this->client->id,
        'freelancer_id' => $this->freelancer->id,
        'title' => 'Private order',
        'amount' => 10000,
        'commission_amount' => 1000,
        'freelancer_amount' => 9000,
        'status' => 'active',
    ]);

    $intruder = User::factory()->client()->create();

    $this->actingAs($intruder)->getJson("/api/v1/orders/{$order->id}")->assertForbidden();
});
