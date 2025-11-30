<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ImageOptimizationService;

class OptimizeImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'images:optimize
                            {--id= : Optimiser une image spécifique par ID}
                            {--force : Forcer la re-génération même si les versions existent}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimiser toutes les images existantes (créer versions medium et thumbnail)';

    /**
     * Execute the console command.
     */
    public function handle(ImageOptimizationService $service)
    {
        $this->info('🚀 Démarrage de l\'optimisation des images...');
        $this->newLine();

        // ✅ Optimiser une image spécifique
        if ($this->option('id')) {
            return $this->optimizeSingleImage($service, $this->option('id'));
        }

        // ✅ Optimiser toutes les images
        $this->info('📊 Analyse des images existantes...');

        $bar = $this->output->createProgressBar(
            \App\Models\ImagesProduit::count()
        );
        $bar->start();

        $result = $service->optimizeExistingImages();

        $bar->finish();
        $this->newLine(2);

        // ✅ Afficher les résultats
        $this->info('✅ Optimisation terminée!');
        $this->newLine();

        $this->table(
            ['Métrique', 'Valeur'],
            [
                ['Total images', $result['total']],
                ['✅ Succès', $result['success']],
                ['❌ Erreurs', $result['errors']],
                ['% Réussite', round(($result['success'] / max($result['total'], 1)) * 100, 1) . '%']
            ]
        );

        if ($result['errors'] > 0) {
            $this->warn("⚠️  {$result['errors']} erreurs détectées. Vérifiez les logs.");
        }

        return Command::SUCCESS;
    }

    /**
     * Optimiser une seule image
     */
    private function optimizeSingleImage($service, $imageId)
    {
        $this->info("🔄 Optimisation de l'image ID: {$imageId}");

        try {
            $image = $service->optimizeImageById($imageId);

            $this->newLine();
            $this->info('✅ Image optimisée avec succès!');
            $this->newLine();

            $this->table(
                ['Propriété', 'Valeur'],
                [
                    ['ID', $image->id],
                    ['Original', $image->chemin_original],
                    ['Medium', $image->chemin_moyen ?: '❌ Non créé'],
                    ['Thumbnail', $image->chemin_miniature ?: '❌ Non créé'],
                ]
            );

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Erreur: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
