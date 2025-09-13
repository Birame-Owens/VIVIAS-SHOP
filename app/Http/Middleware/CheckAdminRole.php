<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est connecté
        if (!Auth::check()) {
            return $this->unauthorized($request, 'Vous devez être connecté pour accéder à cette ressource.');
        }

        $user = Auth::user();

        // Vérifier si l'utilisateur est actif
        if ($user->statut !== 'actif') {
            Auth::logout();
            return $this->unauthorized($request, 'Votre compte a été suspendu. Contactez l\'administrateur.');
        }

        // Vérifier si l'utilisateur a le rôle admin
        if ($user->role !== 'admin') {
            return $this->forbidden($request, 'Accès refusé. Vous n\'avez pas les permissions administrateur.');
        }

        return $next($request);
    }

    /**
     * Réponse pour utilisateur non authentifié
     */
    private function unauthorized(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'error_code' => 'UNAUTHORIZED'
            ], 401);
        }

        return redirect()
            ->route('admin.app')
            ->with('error', $message);
    }

    /**
     * Réponse pour utilisateur sans permissions
     */
    private function forbidden(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'error_code' => 'FORBIDDEN'
            ], 403);
        }

        return redirect()
            ->route('admin.app')
            ->with('error', $message);
    }
}