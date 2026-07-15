<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The web dashboard and any browser client must be listed here. Set
    | FRONTEND_URL (comma-separated for several origins) per environment.
    | Mobile apps are unaffected by CORS.
    |
    */

    'paths' => ['api/*', 'docs/api*', 'up'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_map('trim', explode(',', (string) env('FRONTEND_URL', 'http://localhost:3000'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 3600,

    // Token-based auth (Authorization header); no cookies are exchanged.
    'supports_credentials' => false,

];
