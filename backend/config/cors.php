<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Set FRONTEND_URL (comma-separated for several deployed browser origins)
    | per environment. Local loopback origins are allowed by the narrow pattern
    | below for browser-based development. Native mobile apps are unaffected.
    |
    */

    'paths' => ['api/*', 'docs/api*', 'up'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_map('trim', explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000'))),

    'allowed_origins_patterns' => [
        '#^http://(?:localhost|127\.0\.0\.1)(?::\d+)?\z#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    // Token-based auth (Authorization header); no cookies are exchanged.
    'supports_credentials' => false,

];
