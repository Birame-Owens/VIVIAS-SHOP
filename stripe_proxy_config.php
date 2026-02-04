<?php
/**
 * Configuration proxy pour Stripe si connexion bloquée
 * Ajouter ce code dans CheckoutService.php avant l'appel Stripe
 */

// Dans CheckoutService::initiateStripePayment(), ligne 350

// AVANT:
// \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

// APRÈS:
\Stripe\Stripe::setApiKey(config('services.stripe.secret'));

// Configurer proxy si défini dans .env
$proxyUrl = env('HTTP_PROXY');
if ($proxyUrl) {
    \Stripe\ApiRequestor::setHttpClient(
        new \Stripe\HttpClient\CurlClient([
            CURLOPT_PROXY => $proxyUrl,
            CURLOPT_PROXYTYPE => CURLPROXY_HTTP,
            // Si proxy authentifié:
            // CURLOPT_PROXYUSERPWD => env('PROXY_AUTH'),
        ])
    );
}
