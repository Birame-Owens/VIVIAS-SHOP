<?php

namespace App\Jobs;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmationEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;

    protected $commande;

    /**
     * Create a new job instance.
     */
    public function __construct(Commande $commande)
    {
        $this->commande = $commande;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $commande = $this->commande->load(['client', 'articles.produit', 'paiements']);

            Mail::send('emails.order-confirmation', [
                'commande' => $commande,
                'client' => $commande->client,
            ], function ($message) use ($commande) {
                $message->to($commande->client->email, $commande->client->prenom . ' ' . $commande->client->nom)
                    ->subject("✅ Commande confirmée N°{$commande->numero_commande} - VIVIAS SHOP");
            });

            Log::info('Email confirmation commande envoyé', [
                'commande_id' => $commande->id,
                'email' => $commande->client->email,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi email confirmation commande', [
                'commande_id' => $this->commande->id,
                'error' => $e->getMessage(),
            ]);

            if ($this->attempts() < $this->tries) {
                $this->release(30);
            }
        }
    }
}
