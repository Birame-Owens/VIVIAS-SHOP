# ==========================================
# VIVIAS-SHOP Deployment Script (Windows)
# Démarrer l'app sur 192.168.1.9
# ==========================================

Write-Host "🚀 Déploiement VIVIAS-SHOP..." -ForegroundColor Green
Write-Host "IP: 192.168.1.9" -ForegroundColor Cyan
Write-Host ""

# Vérifier Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Copier .env si n'existe pas
if (-not (Test-Path .env)) {
    Write-Host "📋 Création fichier .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env créé (à adapter si nécessaire)" -ForegroundColor Green
}

# Build et démarrage
Write-Host ""
Write-Host "🐳 Démarrage des conteneurs..." -ForegroundColor Cyan
docker-compose up -d

# Attendre que le DB soit prêt
Write-Host "⏳ Attente du démarrage de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Migrations
Write-Host "🗄️  Exécution des migrations..." -ForegroundColor Cyan
docker-compose exec -T backend php artisan migrate --force

# Afficher les instructions
Write-Host ""
Write-Host "✅ Application démarrée!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Accès:" -ForegroundColor Cyan
Write-Host "   Frontend: http://192.168.1.9:5173" -ForegroundColor White
Write-Host "   Backend:  http://192.168.1.9:8000" -ForegroundColor White
Write-Host "   API:      http://192.168.1.9:8000/api" -ForegroundColor White
Write-Host "   DB:       localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📊 Logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f backend" -ForegroundColor White
Write-Host "   docker-compose logs -f frontend" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Pour arrêter: docker-compose down" -ForegroundColor Yellow
