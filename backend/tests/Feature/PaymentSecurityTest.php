<?php

use App\Models\Category;
use App\Models\ClientProfile;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    config()->set('services.payments.webhook_secret', 'test-secret');
});

function pendingPayment(): Payment
{
    $client = User::factory()->create(['role' => User::ROLE_CLIENT]);
    ClientProfile::query()->create(['user_id' => $client->id]);
    $freelancer = User::factory()->create(['role' => User::ROLE_FREELANCER]);
    $category = Category::query()->create(['name_en' => 'Dev', 'name_fr' => 'Dev', 'slug' => uniqid('dev')]);

    $order = Order::query()->create([
        'number' => 'FIT-ORD-TEST-'.uniqid(),
        'client_id' => $client->id,
        'freelancer_id' => $freelancer->id,
        'title' => 'Test order',
        'amount' => 100000,
        'commission_rate' => 0.10,
        'commission_amount' => 10000,
        'freelancer_amount' => 90000,
    ]);

    return Payment::query()->create([
        'reference' => 'FIT-PAY-TEST'.strtoupper(uniqid()),
        'payer_id' => $client->id,
        'order_id' => $order->id,
        'purpose' => Payment::PURPOSE_ORDER,
        'amount' => 100000,
        'provider' => 'mtn_momo',
    ]);
}

it('rejects webhook calls without a valid signature', function () {
    $payment = pendingPayment();

    $payload = ['reference' => $payment->reference, 'status' => 'successful'];

    $this->postJson('/api/v1/webhooks/payments', $payload)
        ->assertStatus(401);

    $this->postJson('/api/v1/webhooks/payments', $payload, [
        'X-Webhook-Signature' => 'forged-signature',
    ])->assertStatus(401);

    expect($payment->fresh()->status)->toBe(Payment::STATUS_PENDING);
});

it('settles a payment through a correctly signed webhook', function () {
    $payment = pendingPayment();

    $body = json_encode(['reference' => $payment->reference, 'status' => 'successful']);
    $signature = hash_hmac('sha256', $body, 'test-secret');

    $this->call(
        'POST',
        '/api/v1/webhooks/payments',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
        ],
        $body,
    )->assertOk();

    expect($payment->fresh()->status)->toBe(Payment::STATUS_SUCCESSFUL)
        ->and($payment->fresh()->order->status)->toBe(Order::STATUS_ACTIVE);
});

it('hides the sandbox confirm endpoint in production', function () {
    $payment = pendingPayment();

    app()->detectEnvironment(fn () => 'production');

    $this->actingAs($payment->payer)
        ->postJson("/api/v1/payments/{$payment->reference}/confirm-sandbox")
        ->assertNotFound();

    app()->detectEnvironment(fn () => 'testing');
});
