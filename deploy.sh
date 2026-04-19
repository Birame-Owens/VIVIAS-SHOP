#!/bin/bash
# ==========================================
# VIVIAS-SHOP Deployment Script
# Démarrer l'app sur 192.168.1.9
# ==========================================

echo "🚀 Déploiement VIVIAS-SHOP..."
echo "IP: 192.168.1.9"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Copier .env si n'existe pas
if [ ! -f .env ]; then
    echo "📋 Création fichier .env..."
    cp .env.example .env
    echo "✅ .env créé (à adapter si nécessaire)"
fi

# Build et démarrage
echo ""
echo "🐳 Démarrage des conteneurs..."
docker-compose up -d

# Attendre que le DB soit prêt
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 5

# Migrations
echo "🗄️  Exécution des migrations..."
docker-compose exec -T backend php artisan migrate --force

# Seed (optionnel)
echo ""
echo "✅ Application démarrée!"
echo ""
echo "📱 Accès:"
echo "   Frontend: http://192.168.1.9:5173"
echo "   Backend:  http://192.168.1.9:8000"
echo "   API:      http://192.168.1.9:8000/api"
echo "   DB:       localhost:5432"
echo ""
echo "📊 Logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🛑 Pour arrêter: docker-compose down"
