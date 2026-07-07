<?php

use App\Models\User;

it('registers a freelancer with a welcome connects bonus', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Test Freelancer',
        'email' => 'freelancer@example.com',
        'password' => 'secret-password',
        'role' => 'freelancer',
        'language' => 'fr',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'role']])
        ->assertJsonPath('user.role', 'freelancer');

    $user = User::query()->where('email', 'freelancer@example.com')->first();
    expect($user->connects_balance)->toBe(10)
        ->and($user->freelancerProfile)->not->toBeNull()
        ->and($user->wallet)->not->toBeNull();
});

it('registers a client with a client profile', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Test Client',
        'phone' => '237677112233',
        'password' => 'secret-password',
        'role' => 'client',
    ])->assertCreated();

    expect(User::query()->where('phone', '237677112233')->first()->clientProfile)->not->toBeNull();
});

it('logs in with email or phone and issues a token', function () {
    $user = User::factory()->client()->create(['email' => 'login@example.com']);

    $this->postJson('/api/v1/auth/login', [
        'identifier' => 'login@example.com',
        'password' => 'password',
    ])->assertSuccessful()->assertJsonStructure(['token', 'user']);

    $this->postJson('/api/v1/auth/login', [
        'identifier' => $user->phone,
        'password' => 'password',
    ])->assertSuccessful();
});

it('locks the account after five failed login attempts', function () {
    $user = User::factory()->client()->create();

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/auth/login', [
            'identifier' => $user->email,
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', [
        'identifier' => $user->email,
        'password' => 'password',
    ])->assertUnprocessable()->assertJsonValidationErrors(['identifier']);

    expect($user->fresh()->locked_until)->not->toBeNull();
});

it('returns the authenticated user on /auth/me', function () {
    $user = User::factory()->freelancer()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/auth/me')
        ->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

it('blocks suspended accounts from authenticated endpoints', function () {
    $user = User::factory()->client()->create(['status' => User::STATUS_SUSPENDED]);

    $this->actingAs($user)->getJson('/api/v1/auth/me')->assertForbidden();
});
