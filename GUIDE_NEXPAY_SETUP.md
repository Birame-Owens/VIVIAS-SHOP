# 🚀 Guide d'Installation et Test NexPay - Wave & Orange Money

## 📋 Vue d'Ensemble

NexPay est votre passerelle de paiement locale pour **Wave** et **Orange Money**, tournant sur Docker Desktop. Elle permet aux clients sénégalais de payer avec leurs moyens de paiement préférés.

## ✅ Ce Qui Est Déjà Configuré

### Backend Laravel ✅
- ✅ `NexPayController.php` - Routes API
- ✅ `NexPayService.php` - Logique métier
- ✅ `CheckoutService.php` - Intégration confirmation paiement
- ✅ Routes dans `routes/api.php` :
  ```php
  POST /api/client/nexpay/initiate
  GET  /api/client/nexpay/status/{sessionId}
  GET  /api/client/nexpay/callback
  POST /api/webhook/nexpay
  ```

### Frontend React ✅
- ✅ Logos Wave et Orange Money sur page checkout
- ✅ Sélection de méthode de paiement
- ✅ Intégration dans le flux de commande

### Configuration .env ✅
```env
NEXPAY_API_URL=http://localhost:9000
NEXPAY_WRITE_KEY=write
NEXPAY_READ_KEY=read
NEXPAY_WEBHOOK_SECRET=nexpay_webhook_secret_123456789
NEXPAY_PROJECT_ID=cmihhnx3p0003qw2tvnh9ymeo
```

## 🐳 Démarrage de NexPay avec Docker

### Étape 1 : Démarrer Docker Desktop
1. Ouvrir **Docker Desktop**
2. Attendre qu'il soit complètement démarré (icône Docker verte dans la barre des tâches)

### Étape 2 : Vérifier que le Container NexPay Existe
```powershell
docker ps -a | Select-String -Pattern "nexpay"
```

Si le container existe :
```powershell
# Démarrer le container
docker start <nom_ou_id_container_nexpay>
```

Si le container n'existe pas, créer et démarrer :
```powershell
# Exemple avec l'image officielle NexPay
docker run -d `
  --name nexpay-server `
  -p 9000:9000 `
  -e WRITE_KEY=write `
  -e READ_KEY=read `
  -e PROJECT_ID=cmihhnx3p0003qw2tvnh9ymeo `
  nexpay/server:latest
```

### Étape 3 : Vérifier que NexPay Est Accessible
```powershell
# Tester l'API health check
Invoke-WebRequest -Uri 'http://localhost:9000/api/health' -UseBasicParsing

# Ou avec curl si disponible
curl http://localhost:9000/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## 🧪 Test Complet du Flux de Paiement

### Test 1 : Paiement Wave

1. **Va sur la page Checkout** : http://192.168.1.5:5173/checkout
2. **Remplis le formulaire** avec tes informations
3. **Sélectionne Wave** comme méthode de paiement
4. **Clique sur "Passer Commande"**

**Ce qui se passe** :
```
1. Commande créée dans Laravel → statut: "en_attente"
2. Requête POST → /api/client/checkout/payment/{numero_commande}
   └─ provider: "wave"
   └─ phone: "765923402"

3. Laravel → NexPayService->createPaymentSession()
   └─ POST http://localhost:9000/api/v1/payment/initiate
   └─ Données envoyées :
      {
        "amount": 17500,
        "phone": "765923402",
        "email": "birameowens@gmail.com",
        "provider": "wave",
        "client_reference": "CMD-20251201-ABC123",
        "successUrl": "http://192.168.1.5:5173/checkout/success?order=CMD-...",
        "cancelUrl": "http://192.168.1.5:5173/checkout/cancel?order=CMD-..."
      }

4. NexPay retourne :
   {
     "success": true,
     "sessionId": "sess_xyz123",
     "payment_url": "https://pay.wave.com/checkout/sess_xyz123"
   }

5. Laravel redirige → payment_url
6. L'utilisateur voit l'interface Wave pour payer
7. Après paiement → Webhook NexPay appelle /api/webhook/nexpay
8. Laravel confirme la commande → email envoyé
9. Redirection → /checkout/success
```

### Test 2 : Paiement Orange Money

Même flux que Wave, mais :
- Sélectionner **Orange Money**
- `provider: "orange_money"` → NexPay utilise `"om"`
- Interface de paiement Orange Money s'ouvre

## 📊 Monitoring et Debugging

### Logs Laravel
```powershell
# Suivre les logs en temps réel
Get-Content .\storage\logs\laravel.log -Wait -Tail 50

# Filtrer les logs NexPay
Get-Content .\storage\logs\laravel.log | Select-String -Pattern "NexPay"
```

### Logs Attendus

**Initiation Paiement** :
```log
[INFO] NexPay payment initiated
{
  "commande": "CMD-20251201-ABC123",
  "provider": "wave",
  "response": {"sessionId": "sess_xyz123", "payment_url": "..."}
}
```

**Webhook Reçu** :
```log
[INFO] NexPay webhook received
{
  "type": "payment.success",
  "data": {"sessionId": "sess_xyz123", "status": "completed"}
}
```

**Paiement Confirmé** :
```log
[INFO] NexPay payment confirmed
{
  "commande_id": 100,
  "numero_commande": "CMD-20251201-ABC123",
  "montant": 17500
}
```

### Vérifier l'État du Container Docker
```powershell
# Status du container
docker ps | Select-String -Pattern "nexpay"

# Logs du container NexPay
docker logs nexpay-server -f --tail 50
```

## 🔧 Troubleshooting

### Problème 1 : "Connection refused" sur localhost:9000

**Cause** : Docker Desktop n'est pas démarré ou container NexPay arrêté

**Solution** :
```powershell
# 1. Vérifier Docker Desktop est ouvert
# 2. Lister les containers
docker ps -a

# 3. Démarrer le container
docker start nexpay-server

# 4. Vérifier les logs
docker logs nexpay-server
```

### Problème 2 : "NexPay credentials not configured"

**Cause** : Variables d'environnement manquantes

**Solution** :
```powershell
# Vérifier .env
cat .env | Select-String -Pattern "NEXPAY"

# Clear cache config Laravel
php artisan config:clear
php artisan config:cache
```

### Problème 3 : Paiement initié mais pas de redirection

**Cause** : NexPay ne retourne pas `payment_url`

**Solution** :
```powershell
# Tester l'API NexPay directement
$body = @{
    amount = 1000
    phone = "765923402"
    email = "test@test.com"
    provider = "wave"
    client_reference = "TEST-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:9000/api/v1/payment/initiate' `
  -Method POST `
  -Headers @{'x-api-key'='write'; 'Content-Type'='application/json'} `
  -Body $body
```

### Problème 4 : Webhook non reçu

**Cause** : NexPay ne peut pas atteindre l'URL du webhook

**Solution** :
```powershell
# Si test local, utiliser ngrok
ngrok http 8000

# Mettre à jour APP_URL dans .env
APP_URL=https://abc123.ngrok.io

# Redémarrer Laravel
```

## 🧪 Test en Mode Simulation (Sans NexPay)

Si Docker ne démarre pas, tu peux tester avec **Stripe uniquement** :

1. Sélectionner **Carte Bancaire** sur checkout
2. Utiliser les cartes de test Stripe :
   - **Succès** : `4242 4242 4242 4242`
   - **Échec** : `4000 0000 0000 0002`
   - CVV : n'importe quel 3 chiffres
   - Date : n'importe quelle date future

## 📞 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Laravel API** | http://192.168.1.5:8000 | Backend |
| **Frontend** | http://192.168.1.5:5173 | React |
| **NexPay** | http://localhost:9000 | Passerelle paiement |
| **NexPay Health** | http://localhost:9000/api/health | Test connexion |
| **Checkout** | http://192.168.1.5:5173/checkout | Page paiement |

## 📝 Commandes Utiles

```powershell
# Démarrer tout le projet
# Terminal 1
php artisan serve --host=192.168.1.5 --port=8000

# Terminal 2
npm run dev

# Terminal 3
php artisan queue:work --queue=emails,default,notifications

# Terminal 4 (Docker Desktop doit être démarré)
docker start nexpay-server

# Vérifier que tout tourne
# Laravel
Invoke-WebRequest -Uri 'http://192.168.1.5:8000/api/client/config' -UseBasicParsing

# Vite
Invoke-WebRequest -Uri 'http://192.168.1.5:5173' -UseBasicParsing

# NexPay
Invoke-WebRequest -Uri 'http://localhost:9000/api/health' -UseBasicParsing
```

## ✅ Checklist de Test

- [ ] Docker Desktop démarré
- [ ] Container NexPay en cours d'exécution
- [ ] Laravel server actif (192.168.1.5:8000)
- [ ] Vite dev server actif (192.168.1.5:5173)
- [ ] Queue worker actif
- [ ] Logos visibles sur page checkout
- [ ] Test paiement Wave → redirection OK
- [ ] Test paiement Orange Money → redirection OK
- [ ] Webhook reçu → commande confirmée
- [ ] Email de confirmation envoyé

## 🎉 Résultat Final

Une fois NexPay configuré, tes clients pourront :

1. **Choisir Wave** → Ouvrir l'app Wave → Scanner QR → Payer
2. **Choisir Orange Money** → Recevoir prompt USSD → Confirmer avec code PIN
3. **Recevoir confirmation** → Email + SMS
4. **Suivre leur commande** → Page "Mes Commandes"

---

**Créé par** : Birame Owens Diop (birameowens29@gmail.com)  
**Date** : 1er Décembre 2025  
**Version** : 1.0.0
