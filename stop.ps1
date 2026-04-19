# ==========================================
# VIVIAS-SHOP - Stop & Cleanup Script
# ==========================================

Write-Host "🛑 Arrêt de VIVIAS-SHOP..." -ForegroundColor Yellow

# Arrêter les conteneurs
Write-Host "Arrêt des services..." -ForegroundColor Cyan
docker-compose down

Write-Host "✅ Application arrêtée!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Conteneurs arrêtés:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "💡 Options de nettoyage:" -ForegroundColor Yellow
Write-Host "   Volumes (BD): docker-compose down -v" -ForegroundColor White
Write-Host "   Images:       docker-compose down --rmi all" -ForegroundColor White
