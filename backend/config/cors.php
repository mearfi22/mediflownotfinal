<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file controls the settings used by the CORS middleware. The
    | frontend for this project runs on `http://localhost:3000` during
    | local development and the backend on `http://localhost:8000`.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // DO NOT use '*' here if you are using credentials (cookies/auth).
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Set to true to allow cookies / Authorization header with requests.
    'supports_credentials' => true,
];
