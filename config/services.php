<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // =================== FRONTEND URL ===================
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

    // =================== STRIPE ===================
    'stripe' => [
        'key' => env('STRIPE_PUBLIC_KEY'),
        'secret' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    // =================== TWILIO (WhatsApp) ===================
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_AUTH_TOKEN'),
        'whatsapp_from' => env('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886'),
    ],

    // =================== SHIPPING ===================
    'shipping' => [
        'free_threshold' => env('SHIPPING_FREE_THRESHOLD', 50000), // Livraison gratuite si > 50000 FCFA
        'default_cost' => env('SHIPPING_DEFAULT_COST', 2500), // Coût par défaut
    ],

    // =================== PAYTECH (Wave & Orange Money) ===================
    'paytech' => [
        'api_key' => env('PAYTECH_API_KEY'),
        'api_secret' => env('PAYTECH_API_SECRET'),
        'env' => env('PAYTECH_ENV', 'test'), // test ou prod
        'ipn_url' => env('PAYTECH_IPN_URL'),
        'success_url' => env('PAYTECH_SUCCESS_URL'),
        'cancel_url' => env('PAYTECH_CANCEL_URL'),
    ],

];
