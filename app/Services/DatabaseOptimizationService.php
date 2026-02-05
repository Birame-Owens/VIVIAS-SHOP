<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Service d'optimisation des requêtes database
 * 
 * Prévient le problème N+1 et optimise les performances
 */
class DatabaseOptimizationService
{
    /**
     * Eager loading automatique pour les relations
     */
    public static function eagerLoadRelations(Builder $query, array $relations): Builder
    {
        return $query->with($relations);
    }

    /**
     * Paginé avec eager loading
     */
    public static function paginateWithRelations(Builder $query, array $relations, $perPage = 15)
    {
        return $query
            ->with($relations)
            ->paginate($perPage);
    }

    /**
     * Compter les requêtes DB (debug)
     */
    public static function debugQueries(callable $callback)
    {
        DB::enableQueryLog();
        
        $callback();
        
        $queries = DB::getQueryLog();
        return [
            'count' => count($queries),
            'queries' => $queries,
        ];
    }

    /**
     * Optimiser les requêtes Product
     */
    public static function optimizeProductQueries($query)
    {
        return $query
            ->with(['category', 'images', 'promotions'])
            ->select([
                'id', 'name', 'slug', 'description', 'price', 
                'discount_price', 'stock', 'category_id', 'created_at'
            ]);
    }

    /**
     * Optimiser les requêtes Command
     */
    public static function optimizeCommandQueries($query)
    {
        return $query
            ->with(['client', 'items.product', 'payment'])
            ->select([
                'id', 'client_id', 'total', 'status', 'created_at'
            ]);
    }

    /**
     * Optimiser les requêtes Client
     */
    public static function optimizeClientQueries($query)
    {
        return $query
            ->with(['addresses', 'wishlist'])
            ->select([
                'id', 'name', 'email', 'phone', 'created_at'
            ]);
    }

    /**
     * Chunk processing pour grandes listes (évite mémoire)
     */
    public static function chunkProcess($model, $callback, $chunkSize = 1000)
    {
        $model::chunk($chunkSize, function ($items) use ($callback) {
            foreach ($items as $item) {
                $callback($item);
            }
        });
    }

    /**
     * Cache les résultats de requête
     */
    public static function withCache(callable $query, $key, $minutes = 60)
    {
        return \Cache::remember($key, $minutes * 60, $query);
    }

    /**
     * Invalider le cache
     */
    public static function invalidateCache($pattern)
    {
        // À implémenter selon votre stratégie de cache
        \Cache::forget($pattern);
    }

    /**
     * Analyser les slowqueries
     */
    public static function analyzeSlowQueries()
    {
        return DB::table('mysql.slow_log')
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();
    }
}
