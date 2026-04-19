# VIVIAS-SHOP Deployment Script (Windows)

Write-Host "Deploiement VIVIAS-SHOP..." -ForegroundColor Green
Write-Host "IP: 192.168.1.9" -ForegroundColor Cyan
Write-Host ""

# Check Docker
$dockerExists = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $dockerExists) {
    Write-Host "ERREUR: Docker n'est pas installe" -ForegroundColor Red
    exit 1
}

# Check docker-compose
$dockerComposeExists = Get-Command docker-compose -ErrorAction SilentlyContinue
if ($null -eq $dockerComposeExists) {
    Write-Host "ERREUR: Docker Compose n'est pas installe" -ForegroundColor Red
    exit 1
}

# Check if Docker daemon is running
Write-Host "Verification: Docker en cours d'execution..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
} catch {
    Write-Host "ERREUR: Docker Desktop n'est pas en cours d'execution" -ForegroundColor Red
    Write-Host "Action: Demarrez Docker Desktop et relancez le script" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Docker est actif" -ForegroundColor Green
Write-Host ""

# Copy .env if doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Copie du fichier .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "OK: .env cree" -ForegroundColor Green
}

# Start containers
Write-Host ""
Write-Host "Demarrage des conteneurs..." -ForegroundColor Cyan
docker-compose up -d

# Wait for DB
Write-Host "Attente du demarrage de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations
Write-Host "Execution des migrations..." -ForegroundColor Cyan
docker-compose exec -T backend php artisan migrate --force

# Display access info
Write-Host ""
Write-Host "OK: Application demarree!" -ForegroundColor Green
Write-Host ""
Write-Host "Acces:" -ForegroundColor Cyan
Write-Host "   Frontend: http://192.168.1.9:5173" -ForegroundColor White
Write-Host "   Backend:  http://192.168.1.9:8000" -ForegroundColor White
Write-Host "   API:      http://192.168.1.9:8000/api" -ForegroundColor White
Write-Host "   DB:       localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f backend" -ForegroundColor White
Write-Host "   docker-compose logs -f frontend" -ForegroundColor White
Write-Host ""
Write-Host "Pour arreter: docker-compose down" -ForegroundColor Yellow
