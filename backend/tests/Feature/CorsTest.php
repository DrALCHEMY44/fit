<?php

beforeEach(function () {
    config()->set('cors.allowed_origins', ['https://fit.fobs.dev']);
});

it('allows Flutter Web requests from local development ports', function (string $origin) {
    $this->withHeaders([
        'Origin' => $origin,
        'Access-Control-Request-Method' => 'POST',
        'Access-Control-Request-Headers' => 'content-type, authorization',
    ])->options('/api/v1/auth/login')
        ->assertNoContent()
        ->assertHeader('Access-Control-Allow-Origin', $origin);
})->with([
    'production web app' => 'https://fit.fobs.dev',
    'Flutter Chrome localhost' => 'http://localhost:54321',
    'fixed localhost port' => 'http://localhost:3000',
    'IPv4 loopback' => 'http://127.0.0.1:8080',
]);

it('does not allow unrelated or localhost lookalike origins', function (string $origin) {
    $this->withHeaders([
        'Origin' => $origin,
        'Access-Control-Request-Method' => 'POST',
        'Access-Control-Request-Headers' => 'content-type, authorization',
    ])->options('/api/v1/auth/login')
        ->assertNoContent()
        ->assertHeaderMissing('Access-Control-Allow-Origin');
})->with([
    'unrelated site' => 'https://evil.example',
    'localhost lookalike' => 'http://localhost.evil.example:54321',
    'HTTPS localhost' => 'https://localhost:54321',
]);

it('adds CORS headers to login validation responses', function () {
    $origin = 'http://localhost:54321';

    $this->withHeader('Origin', $origin)
        ->postJson('/api/v1/auth/login', [])
        ->assertUnprocessable()
        ->assertHeader('Access-Control-Allow-Origin', $origin);
});
