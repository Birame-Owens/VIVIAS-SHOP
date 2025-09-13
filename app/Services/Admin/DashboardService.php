<?php

namespace App\Services\Admin;

class DashboardService
{
    /**
     * Obtenir les statistiques du dashboard
     */
    public function getDashboardStats(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        return [
            'overview' => $this->getOverviewStats($today, $thisMonth),
            'sales' => $this->getSalesStats($thisMonth, $lastMonth),
            'orders' => $this->getOrdersStats($today, $thisMonth),
            'products' => $this->getProductsStats(),
            'recent_activities' => $this->getRecentActivities(),
            'charts_data' => $this->getChartsData()
        ];
    }

    /**
     * Statistiques générales
     */
    private function getOverviewStats($today, $thisMonth): array
    {
        return [
            'total_clients' => Client::count(),
            'nouveaux_clients_mois' => Client::where('created_at', '>=', $thisMonth)->count(),
            'commandes_aujourd_hui' => Commande::whereDate('created_at', $today)->count(),
            'chiffre_affaires_mois' => $this->getMonthlyRevenue($thisMonth),
        ];
    }

    /**
     * Statistiques des ventes
     */
    private function getSalesStats($thisMonth, $lastMonth): array
    {
        $currentMonth = $this->getMonthlyRevenue($thisMonth);
        $previousMonth = $this->getMonthlyRevenue($lastMonth, $thisMonth->copy()->subDay());

        $growthPercentage = $previousMonth > 0 
            ? (($currentMonth - $previousMonth) / $previousMonth) * 100 
            : 0;

        return [
            'chiffre_affaires_actuel' => $currentMonth,
            'chiffre_affaires_precedent' => $previousMonth,
            'croissance_pourcentage' => round($growthPercentage, 2),
            'panier_moyen' => $this->getAverageOrderValue($thisMonth),
        ];
    }

    /**
     * Statistiques des commandes
     */
    private function getOrdersStats($today, $thisMonth): array
    {
        return [
            'commandes_en_attente' => Commande::where('statut', 'en_attente')->count(),
            'commandes_confirmees' => Commande::where('statut', 'confirmee')->count(),
            'commandes_en_production' => Commande::where('statut', 'en_production')->count(),
            'commandes_prete' => Commande::where('statut', 'prete')->count(),
            'total_commandes_mois' => Commande::where('created_at', '>=', $thisMonth)->count(),
        ];
    }

    /**
     * Statistiques des produits
     */
    private function getProductsStats(): array
    {
        return [
            'total_produits' => Produit::count(),
            'produits_actifs' => Produit::where('est_visible', true)->count(),
            'produits_stock_bas' => Produit::whereRaw('stock_disponible <= seuil_alerte')->count(),
            'produits_rupture' => Produit::where('stock_disponible', 0)->count(),
        ];
    }

    /**
     * Activités récentes
     */
    private function getRecentActivities(): array
    {
        $recentOrders = Commande::with('client')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($commande) {
                return [
                    'type' => 'commande',
                    'title' => "Nouvelle commande #{$commande->numero_commande}",
                    'description' => "Client: {$commande->client->nom} {$commande->client->prenom}",
                    'amount' => $commande->montant_total,
                    'time' => $commande->created_at->diffForHumans(),
                    'status' => $commande->statut
                ];
            });

        return $recentOrders->toArray();
    }

    /**
     * Données pour les graphiques
     */
    private function getChartsData(): array
    {
        return [
            'sales_chart' => $this->getSalesChartData(),
            'orders_status_chart' => $this->getOrdersStatusChartData(),
            'top_products' => $this->getTopProductsData(),
        ];
    }

    /**
     * Chiffre d'affaires mensuel
     */
    private function getMonthlyRevenue($startDate, $endDate = null): float
    {
        $query = Paiement::where('statut', 'valide')
            ->where('created_at', '>=', $startDate);

        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        return $query->sum('montant') ?? 0;
    }

    /**
     * Panier moyen
     */
    private function getAverageOrderValue($startDate): float
    {
        $total = Commande::where('created_at', '>=', $startDate)->sum('montant_total');
        $count = Commande::where('created_at', '>=', $startDate)->count();

        return $count > 0 ? $total / $count : 0;
    }

    /**
     * Données graphique des ventes (7 derniers jours)
     */
    private function getSalesChartData(): array
    {
        $days = collect();
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Paiement::where('statut', 'valide')
                ->whereDate('created_at', $date)
                ->sum('montant');
                
            $days->push([
                'date' => $date->format('Y-m-d'),
                'label' => $date->format('d/m'),
                'revenue' => $revenue ?? 0,
            ]);
        }

        return $days->toArray();
    }

    /**
     * Répartition des statuts de commandes
     */
    private function getOrdersStatusChartData(): array
    {
        return Commande::select('statut', DB::raw('count(*) as count'))
            ->groupBy('statut')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->statut,
                    'count' => $item->count,
                    'label' => $this->getStatusLabel($item->statut)
                ];
            })
            ->toArray();
    }

    /**
     * Top 5 des produits les plus vendus
     */
    private function getTopProductsData(): array
    {
        return DB::table('articles_commande')
            ->join('produits', 'articles_commande.produit_id', '=', 'produits.id')
            ->select('produits.nom', DB::raw('SUM(articles_commande.quantite) as total_vendu'))
            ->groupBy('produits.id', 'produits.nom')
            ->orderBy('total_vendu', 'desc')
            ->limit(5)
            ->get()
            ->toArray();
    }

    /**
     * Libellé du statut de commande
     */
    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'en_attente' => 'En attente',
            'confirmee' => 'Confirmée',
            'en_production' => 'En production',
            'prete' => 'Prête',
            'livree' => 'Livrée',
            'annulee' => 'Annulée',
            default => ucfirst($status)
        };
    }
}
