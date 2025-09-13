<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Obtenir les données du dashboard
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $stats = $this->dashboardService->getDashboardStats();

            return response()->json([
                'success' => true,
                'message' => 'Statistiques dashboard récupérées avec succès.',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération dashboard', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques.',
                'error_code' => 'DASHBOARD_ERROR'
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques rapides
     */
    public function quickStats(Request $request): JsonResponse
    {
        try {
            // Stats rapides pour widgets
            $stats = [
                'total_commandes_mois' => \App\Models\Commande::whereMonth('created_at', now()->month)->count(),
                'chiffre_affaires_mois' => \App\Models\Paiement::where('statut', 'valide')
                    ->whereMonth('created_at', now()->month)
                    ->sum('montant'),
                'nouveaux_clients_semaine' => \App\Models\Client::where('created_at', '>=', now()->subWeek())->count(),
                'commandes_en_attente' => \App\Models\Commande::where('statut', 'en_attente')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération stats rapides', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques rapides.',
                'error_code' => 'QUICK_STATS_ERROR'
            ], 500);
        }
    }
}