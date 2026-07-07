<?php

use App\Models\Conversation;
use App\Models\User;

beforeEach(function () {
    $this->client = User::factory()->client()->create();
    $this->freelancer = User::factory()->freelancer()->create();

    $this->conversation = Conversation::query()->create([
        'client_id' => $this->client->id,
        'freelancer_id' => $this->freelancer->id,
    ]);
});

it('flags messages containing phone numbers and warns the sender', function () {
    $response = $this->actingAs($this->client)->postJson(
        "/api/v1/conversations/{$this->conversation->id}/messages",
        ['body' => 'Call me on +237 677 00 11 22 so we can finish this outside.'],
    );

    $response->assertCreated();
    expect($response->json('message.is_flagged'))->toBeTrue()
        ->and($response->json('contact_warning'))->not->toBeNull();
});

it('flags WhatsApp links', function () {
    $response = $this->actingAs($this->freelancer)->postJson(
        "/api/v1/conversations/{$this->conversation->id}/messages",
        ['body' => 'Reach me at wa.me/237677001122'],
    );

    expect($response->json('message.is_flagged'))->toBeTrue();
});

it('does not flag clean messages', function () {
    $response = $this->actingAs($this->client)->postJson(
        "/api/v1/conversations/{$this->conversation->id}/messages",
        ['body' => 'The first draft looks great, can you adjust the header colors?'],
    );

    $response->assertCreated();
    expect($response->json('message.is_flagged'))->toBeFalse()
        ->and($response->json('contact_warning'))->toBeNull();
});

it('keeps outsiders out of conversations', function () {
    $intruder = User::factory()->client()->create();

    $this->actingAs($intruder)
        ->getJson("/api/v1/conversations/{$this->conversation->id}/messages")
        ->assertForbidden();
});
