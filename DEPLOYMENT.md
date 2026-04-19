# 🚀 Guide de Déploiement Rapide - VIVIAS-SHOP

## Configuration IP: 192.168.1.9

### ⚡ Démarrage rapide (Docker)

#### Windows
```powershell
# 1. Cloner le repo
git clone https://github.com/Birame-Owens/VIVIAS-SHOP.git
cd VIVIAS-SHOP

# 2. Déployer
.\deploy.ps1
```

#### Linux/Mac
```bash
# 1. Cloner le repo
git clone https://github.com/Birame-Owens/VIVIAS-SHOP.git
cd VIVIAS-SHOP

# 2. Déployer
chmod +x deploy.sh
./deploy.sh
```

### 📱 Accès après déploiement

| Service | URL |
|---------|-----|
| Frontend (App) | http://192.168.1.9:5173 |
| Backend (API) | http://192.168.1.9:8000 |
| API REST | http://192.168.1.9:8000/api |
| Database | localhost:5432 |

### 🔧 Commandes utiles

```bash
# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter l'app
docker-compose down

# Redémarrer
docker-compose restart

# Entrer en terminal backend
docker-compose exec backend php artisan tinker

# Créer admin
docker-compose exec backend php artisan tinker
# Dans tinker:
# > \App\Models\User::factory()->admin()->create(['email' => 'admin@vivias.com', 'password' => Hash::make('password')])

# Voir les conteneurs
docker-compose ps

# Afficher les services
docker-compose logs --tail=100
```

### 🗄️ Base de données

**PostgreSQL - Credentials**
```
Host: 127.0.0.1
Port: 5432
Database: VIVIAS
User: postgres
Password: password
```

### ⚙️ Configuration personnalisée

1. Éditer `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```

2. Variables importantes:
   - `APP_URL=http://192.168.1.9:8000`
   - `DB_PASSWORD=password` (à changer en production!)
   - `STRIPE_SECRET_KEY=...` (si paiements)

### 🐛 Troubleshooting

**Port déjà utilisé?**
```bash
# Changer le port dans docker-compose.yml
# backend: 8000:8000 → 8001:8000
# frontend: 5173:5173 → 5174:5173
```

**Erreur de base de données?**
```bash
# Supprimer les volumes et recommencer
docker-compose down -v
docker-compose up -d
```

**Les images ne s'affichent pas?**
- Par défaut, utilise stockage local (`/storage/app/public`)
- Configurer AWS S3 dans `.env` si besoin

### 📊 Architecture Docker

```
┌─────────────────────────────────────┐
│     Docker Compose Network          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │ Frontend (React + Vite)      │   │
│  │ :5173                        │   │
│  │ VITE_API_URL → :8000/api     │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ Backend (Laravel + PHP-FPM)  │   │
│  │ :8000                        │   │
│  │ Queue Worker (database)      │   │
│  └──────────────────────────────┘   │
│           ↓                          │
│  ┌──────────────────────────────┐   │
│  │ PostgreSQL DB                │   │
│  │ :5432                        │   │
│  └──────────────────────────────┘   │
│           ↓                          │
│  ┌──────────────────────────────┐   │
│  │ Redis Cache                  │   │
│  │ :6379                        │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 🔐 Sécurité

**⚠️ AVANT LA PRODUCTION:**
1. Changer `APP_ENV=production` (déjà fait)
2. Changer `APP_DEBUG=false` (déjà fait)
3. Générer nouvelle `APP_KEY`: `php artisan key:generate`
4. Changer `DB_PASSWORD`
5. Mettre `APP_URL` en domaine HTTPS
6. Ajouter certificat SSL

### 📈 Performances

```bash
# Optimiser cache
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache

# Vérifier statut
docker-compose stats
```

### 🆘 Support

- Erreur Docker? → `docker system prune`
- Port occupé? → `netstat -ano | findstr :8000` (Windows)
- Conteneur crash? → `docker-compose logs backend`

---

**Besoin d'aide?** Vérifiez les logs avec `docker-compose logs -f`
