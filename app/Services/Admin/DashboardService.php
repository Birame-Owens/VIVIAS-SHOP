<?php

namespace App\Services\Admin;

use App\Models\Client;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Paiement;
use App\Models\Stock;
use App\Models\ArticlesCommande;
use App\Models\AvisClient;
use App\Models\Categorie;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    /**
     * Obtenir les statistiques du dashboard (version PostgreSQL compatible)
     */
    public function getDashboardStats(): array
    {
        try {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $lastMonth = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            return [
                'overview' => $this->getOverviewStats($today, $thisMonth),
                'sales' => $this->getSalesStats($thisMonth, $lastMonth, $lastMonthEnd),
                'orders' => $this->getOrdersStatsSimple($today, $thisMonth),
                'products' => $this->getProductsStatsSimple(),
                'low_stock_products' => $this->getLowStockProductsSimple(),
                'popular_products' => $this->getPopularProductsSimple(),
                'recent_activities' => $this->getRecentActivitiesSimple()
            ];

        } catch (\Exception $e) {
            Log::error('Erreur getDashboardStats', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Statistiques générales d'aperçu
     */
    private function getOverviewStats(Carbon $today, Carbon $thisMonth): array
    {
        return [
            'total_clients' => Client::count(),
            'nouveaux_clients_mois' => Client::where('created_at', '>=', $thisMonth)->count(),
            'nouveaux_clients_aujourd_hui' => Client::whereDate('created_at', $today)->count(),
            'commandes_aujourd_hui' => Commande::whereDate('created_at', $today)->count(),
            'chiffre_affaires_mois' => $this->getMonthlyRevenue($thisMonth),
            'chiffre_affaires_aujourd_hui' => $this->getTodayRevenue()
        ];
    }

    /**
     * Statistiques des ventes avec comparaisons
     */
    private function getSalesStats(Carbon $thisMonth, Carbon $lastMonth, Carbon $lastMonthEnd): array
    {
        $currentMonthRevenue = $this->getMonthlyRevenue($thisMonth);
        $previousMonthRevenue = $this->getMonthlyRevenue($lastMonth, $lastMonthEnd);

        $growthPercentage = $previousMonthRevenue > 0 
            ? (($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100 
            : 0;

        return [
            'current_month' => round($currentMonthRevenue, 0),
            'previous_month' => round($previousMonthRevenue, 0),
            'growth_percentage' => round($growthPercentage, 2),
            'is_positive_growth' => $growthPercentage >= 0
        ];
    }

    /**
     * Statistiques des commandes (version PostgreSQL compatible)
     */
    private function getOrdersStatsSimple(Carbon $today, Carbon $thisMonth): array
    {
        $totalMonth = Commande::where('created_at', '>=', $thisMonth)->count();
        $pending = Commande::where('statut', 'en_attente')->count();
        $confirmed = Commande::where('statut', 'confirmee')->count();
        $inProduction = Commande::where('statut', 'en_production')->count();
        $completed = Commande::where('statut', 'livree')
            ->where('created_at', '>=', $thisMonth)->count();
        $cancelled = Commande::where('statut', 'annulee')
            ->where('created_at', '>=', $thisMonth)->count();

        return [
            'total_month' => $totalMonth,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'in_production' => $inProduction,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'completion_rate' => $totalMonth > 0 ? round(($completed / $totalMonth) * 100, 1) : 0,
            'cancellation_rate' => $totalMonth > 0 ? round(($cancelled / $totalMonth) * 100, 1) : 0,
            'orders_today' => Commande::whereDate('created_at', $today)->count(),
            'average_processing_days' => $this->getAverageProcessingTimePostgreSQL()
        ];
    }

    /**
     * Temps moyen de traitement (compatible PostgreSQL)
     */
    private function getAverageProcessingTimePostgreSQL(): float
    {
        try {
            $result = DB::table('commandes')
                ->whereNotNull('date_debut_production')
                ->whereNotNull('date_fin_production')
                ->where('created_at', '>=', Carbon::now()->subMonths(3))
                ->select(DB::raw('AVG(EXTRACT(EPOCH FROM (date_fin_production - date_debut_production))/86400) as avg_days'))
                ->first();

            return round((float) ($result->avg_days ?? 0), 1);
            
        } catch (\Exception $e) {
            Log::warning('Erreur calcul temps production', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }

    /**
     * Statistiques des produits (version PostgreSQL compatible)
     */
    private function getProductsStatsSimple(): array
    {
        $totalProduits = Produit::count();
        $lowStockCount = 0;
        $outOfStockCount = 0;
        $totalStock = 0;

        try {
            // Calcul du stock pour PostgreSQL
            $stockQuery = DB::select("
                SELECT 
                    COUNT(DISTINCT p.id) as total_produits,
                    COALESCE(SUM(s.quantite_apres), 0) as stock_total,
                    COUNT(CASE WHEN COALESCE(s.quantite_apres, 0) <= p.stock_minimum AND p.stock_minimum > 0 THEN 1 END) as stock_faible,
                    COUNT(CASE WHEN COALESCE(s.quantite_apres, 0) = 0 THEN 1 END) as rupture_stock
                FROM produits p
                LEFT JOIN stocks s ON p.id = s.produit_id 
                    AND s.id = (SELECT MAX(id) FROM stocks WHERE produit_id = p.id)
                WHERE p.statut = ?
            ", ['actif']);

            if (!empty($stockQuery)) {
                $stock = $stockQuery[0];
                $totalStock = $stock->stock_total;
                $lowStockCount = $stock->stock_faible;
                $outOfStockCount = $stock->rupture_stock;
            }
            
        } catch (\Exception $e) {
            Log::warning('Erreur calcul stock PostgreSQL', ['error' => $e->getMessage()]);
        }

        return [
            'total_produits' => $totalProduits,
            'total_stock' => (int) $totalStock,
            'low_stock' => (int) $lowStockCount,
            'out_of_stock' => (int) $outOfStockCount,
            'stock_value' => $this->getTotalStockValuePostgreSQL()
        ];
    }

    /**
     * Valeur du stock (compatible PostgreSQL)
     */
    private function getTotalStockValuePostgreSQL(): float
    {
        try {
            $result = DB::select("
                SELECT COALESCE(SUM(COALESCE(s.quantite_apres, 0) * p.prix_achat), 0) as valeur_totale
                FROM produits p
                LEFT JOIN stocks s ON p.id = s.produit_id 
                    AND s.id = (SELECT MAX(id) FROM stocks WHERE produit_id = p.id)
                WHERE p.statut = ?
            ", ['actif']);

            return (float) ($result[0]->valeur_totale ?? 0);
            
        } catch (\Exception $e) {
            Log::warning('Erreur calcul valeur stock', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }

    /**
     * Produits avec stock faible (compatible PostgreSQL)
     */
    private function getLowStockProductsSimple(int $limit = 10): array
    {
        try {
            $result = DB::select("
                SELECT 
                    p.id,
                    p.nom,
                    p.prix_vente,
                    c.nom as category,
                    COALESCE(s.quantite_apres, 0) as stock_actuel,
                    p.stock_minimum
                FROM produits p
                LEFT JOIN stocks s ON p.id = s.produit_id 
                    AND s.id = (SELECT MAX(id) FROM stocks WHERE produit_id = p.id)
                LEFT JOIN categories c ON p.categorie_id = c.id
                WHERE p.statut = ? 
                    AND COALESCE(s.quantite_apres, 0) <= p.stock_minimum
                    AND p.stock_minimum > 0
                ORDER BY stock_actuel ASC, p.stock_minimum DESC
                LIMIT ?
            ", ['actif', $limit]);

            return array_map(function($item) {
                return [
                    'id' => $item->id,
                    'nom' => $item->nom,
                    'category' => $item->category ?? 'Sans catégorie',
                    'prix_vente' => (float) $item->prix_vente,
                    'stock_actuel' => (int) $item->stock_actuel,
                    'stock_minimum' => (int) $item->stock_minimum
                ];
            }, $result);
                
        } catch (\Exception $e) {
            Log::warning('Erreur getLowStockProducts PostgreSQL', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Produits les plus vendus (compatible PostgreSQL)
     */
    private function getPopularProductsSimple(int $limit = 10): array
    {
        try {
            $thirtyDaysAgo = Carbon::now()->subDays(30)->toDateTimeString();

            $result = DB::select("
                SELECT 
                    p.id,
                    p.nom,
                    p.prix_vente as prix,
                    cat.nom as category,
                    SUM(ac.quantite) as total_ventes,
                    SUM(ac.prix_total_article) as chiffre_affaires
                FROM articles_commande ac
                JOIN produits p ON ac.produit_id = p.id
                JOIN commandes c ON ac.commande_id = c.id
                LEFT JOIN categories cat ON p.categorie_id = cat.id
                WHERE c.created_at >= ?
                    AND c.statut IN ('confirmee', 'en_production', 'livree')
                    AND p.statut = 'actif'
                GROUP BY p.id, p.nom, p.prix_vente, cat.nom
                ORDER BY total_ventes DESC
                LIMIT ?
            ", [$thirtyDaysAgo, $limit]);

            return array_map(function($item) {
                return [
                    'id' => $item->id,
                    'nom' => $item->nom,
                    'prix' => (float) $item->prix,
                    'category' => $item->category ?? 'Sans catégorie',
                    'ventes' => (int) $item->total_ventes,
                    'chiffre_affaires' => (float) $item->chiffre_affaires
                ];
            }, $result);

        } catch (\Exception $e) {
            Log::warning('Erreur getPopularProducts PostgreSQL', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Activités récentes (version simplifiée PostgreSQL)
     */
    private function getRecentActivitiesSimple(int $limit = 10): array
    {
        try {
            $sevenDaysAgo = Carbon::now()->subDays(7);
            $activities = collect();

            // Nouvelles commandes
            $recentOrders = Commande::with('client')
                ->where('created_at', '>=', $sevenDaysAgo)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($order) {
                    return [
                        'type' => 'commande',
                        'title' => "Nouvelle commande #{$order->numero_commande}",
                        'description' => "Commande de " . ($order->client->nom ?? 'Client'),
                        'date' => $order->created_at,
                        'amount' => $order->montant_total
                    ];
                });

            // Nouveaux clients
            $recentClients = Client::where('created_at', '>=', $sevenDaysAgo)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($client) {
                    return [
                        'type' => 'client',
                        'title' => "Nouveau client",
                        'description' => ($client->nom ?? 'Client') . " s'est inscrit",
                        'date' => $client->created_at
                    ];
                });

            return $activities
                ->merge($recentOrders)
                ->merge($recentClients)
                ->sortByDesc('date')
                ->take($limit)
                ->values()
                ->toArray();

        } catch (\Exception $e) {
            Log::warning('Erreur getRecentActivities PostgreSQL', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Stats rapides pour mise à jour temps réel
     */
    public function getQuickStats(): array
    {
        return [
            'commandes_en_attente' => Commande::where('statut', 'en_attente')->count(),
            'commandes_aujourd_hui' => Commande::whereDate('created_at', Carbon::today())->count(),
            'chiffre_affaires_aujourd_hui' => $this->getTodayRevenue(),
            'nouveaux_clients_semaine' => Client::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'timestamp' => now()->toISOString()
        ];
    }

    /**
     * Chiffre d'affaires mensuel
     */
    private function getMonthlyRevenue(Carbon $startDate, Carbon $endDate = null): float
    {
        try {
            $query = DB::table('paiements')
                ->where('statut', 'valide')
                ->where('created_at', '>=', $startDate);

            if ($endDate) {
                $query->where('created_at', '<=', $endDate);
            }

            return (float) $query->sum('montant');
            
        } catch (\Exception $e) {
            Log::warning('Erreur calcul revenue', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }

    /**
     * Chiffre d'affaires du jour
     */
    private function getTodayRevenue(): float
    {
        try {
            return (float) DB::table('paiements')
                ->where('statut', 'valide')
                ->whereDate('created_at', Carbon::today())
                ->sum('montant');
                
        } catch (\Exception $e) {
            Log::warning('Erreur calcul today revenue', ['error' => $e->getMessage()]);
            return 0.0;
        }
    }
}