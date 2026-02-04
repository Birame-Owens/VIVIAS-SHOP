# 📧 Système de Messages Groupés - Documentation

## Vue d'ensemble

Le système de messages groupés permet à l'administrateur d'envoyer des messages en masse à des segments spécifiques de clients.

## Fonctionnalités

### 1️⃣ Segmentation Automatique

**5 groupes prédéfinis :**

- **Tous les clients** (`all`) : Tous les clients enregistrés
- **Clients avec commandes** (`with_orders`) : Clients ayant effectué au moins un achat
- **Clients sans commande** (`without_orders`) : Clients enregistrés mais jamais achetés
- **Clients VIP** (`vip`) : Clients avec un total d'achats ≥ 100,000 FCFA
- **Clients inactifs** (`inactive`) : Clients sans commande depuis 3+ mois

### 2️⃣ Multi-canal

- **Email** : Via Gmail SMTP (déjà configuré)
- **WhatsApp** : Via Twilio (simulation pour l'instant)
- **Les deux** : Email + WhatsApp simultanément

### 3️⃣ Traitement Asynchrone

- Messages envoyés via le système de queue Laravel
- Pas de timeout sur les gros volumes
- Logging automatique de chaque envoi
- Retry automatique en cas d'échec (3 tentatives)

---

## 📡 API Endpoints

### 1. Récupérer les groupes disponibles

**Endpoint :** `GET /api/admin/messages/groups`

**Headers :**
```
Authorization: Bearer {admin_token}
Accept: application/json
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "all",
        "name": "Tous les clients",
        "count": 150
      },
      {
        "id": "vip",
        "name": "Clients VIP (>100k FCFA)",
        "count": 12
      }
    ],
    "stats": {
      "all": 150,
      "with_orders": 85,
      "without_orders": 65,
      "vip": 12,
      "inactive": 30
    }
  }
}
```

---

### 2. Récupérer les clients d'un groupe

**Endpoint :** `GET /api/admin/messages/clients?group_id={group_id}`

**Paramètres :**
- `group_id` (requis) : ID du groupe (all, with_orders, without_orders, vip, inactive)

**Headers :**
```
Authorization: Bearer {admin_token}
Accept: application/json
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "group": "vip",
    "total": 12,
    "clients": [
      {
        "id": 5,
        "nom": "Diop",
        "prenom": "Birame",
        "email": "birame@example.com",
        "telephone": "+221781234567",
        "created_at": "2024-01-15T10:30:00.000000Z"
      }
    ]
  }
}
```

---

### 3. Envoyer un message groupé

**Endpoint :** `POST /api/admin/messages/send`

**Headers :**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
Accept: application/json
```

**Body :**
```json
{
  "group_id": "vip",
  "channel": "email",
  "subject": "Offre exclusive pour nos clients VIP",
  "message": "Cher(e) client(e),\n\nNous vous offrons 20% de remise sur votre prochaine commande avec le code VIP20.\n\nValable jusqu'au 31 décembre.\n\nCordialement,\nL'équipe VIVIAS SHOP",
  "client_ids": [5, 12, 23]
}
```

**Paramètres :**
- `group_id` (requis) : ID du groupe cible
- `channel` (requis) : email | whatsapp | both
- `subject` (optionnel) : Sujet de l'email (par défaut: "Message de VIVIAS SHOP")
- `message` (requis, max 5000 chars) : Contenu du message
- `client_ids` (optionnel) : Liste d'IDs clients spécifiques (ignore group_id si fourni)

**Réponse :**
```json
{
  "success": true,
  "message": "Message groupé envoyé avec succès",
  "data": {
    "recipients_count": 12,
    "channel": "email",
    "group_id": "vip"
  }
}
```

---

## 🧪 Tests avec Postman

### Étape 1 : Authentification Admin

```
POST http://192.168.1.5:8000/api/admin/login
Content-Type: application/json

{
  "email": "admin@vivias.com",
  "password": "votre_mot_de_passe"
}
```

**Copier le token de la réponse.**

---

### Étape 2 : Lister les groupes

```
GET http://192.168.1.5:8000/api/admin/messages/groups
Authorization: Bearer {votre_token}
Accept: application/json
```

---

### Étape 3 : Voir les clients VIP

```
GET http://192.168.1.5:8000/api/admin/messages/clients?group_id=vip
Authorization: Bearer {votre_token}
Accept: application/json
```

---

### Étape 4 : Envoyer un message test

```
POST http://192.168.1.5:8000/api/admin/messages/send
Authorization: Bearer {votre_token}
Content-Type: application/json

{
  "group_id": "vip",
  "channel": "email",
  "subject": "Message de test",
  "message": "Ceci est un message de test du système de messagerie groupée."
}
```

---

## 📊 Monitoring

### Vérifier les logs

**Fichier :** `storage/logs/laravel.log`

**Chercher :**
```
📧 Message groupé dispatché
✅ Email groupé envoyé
📊 Message groupé envoyé
```

### Vérifier la queue

**Commande :**
```powershell
php artisan queue:work --queue=emails,high,default
```

**Voir les jobs en attente :**
```sql
SELECT * FROM jobs ORDER BY id DESC LIMIT 10;
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Email (déjà configuré)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=diopbirame8@gmail.com
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=noreply@vivias-shop.sn
MAIL_FROM_NAME="VIVIAS SHOP"

# WhatsApp (Twilio - optionnel)
TWILIO_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 🎨 Template Email

**Fichier :** `resources/views/emails/group-message.blade.php`

**Variables disponibles :**
- `$clientName` : Nom complet du client
- `$message` : Contenu du message

**Design :** Minimaliste beige (#FDFBF7) avec header noir, matching les autres emails

---

## 🚀 Utilisation en Production

### 1. Lancer le queue worker en permanence

**Avec Supervisor (Linux) :**
```ini
[program:vivias-queue-worker]
command=php /path/to/vivias-shop/artisan queue:work --queue=emails,high,default --sleep=3 --tries=3
directory=/path/to/vivias-shop
autostart=true
autorestart=true
```

**Avec Task Scheduler (Windows) :**
- Programme : `php.exe`
- Arguments : `artisan queue:work --queue=emails,high,default`
- Démarrage : Au démarrage du système

---

### 2. Bonnes pratiques

✅ **Faire des tests avec de petits groupes d'abord** (5-10 clients)
✅ **Vérifier la livraison des emails** avant d'envoyer en masse
✅ **Éviter d'envoyer trop souvent** (limite Gmail : ~500 emails/jour)
✅ **Personnaliser les messages** selon le segment
✅ **Surveiller les logs** pour détecter les erreurs

❌ **Ne pas envoyer de spam**
❌ **Ne pas envoyer sans consentement**
❌ **Ne pas inclure de liens suspects**

---

## 🐛 Dépannage

### Problème : Messages non envoyés

**Vérifier :**
1. Queue worker est actif : `ps aux | grep queue:work` (Linux) ou Task Manager (Windows)
2. Jobs dans la table : `SELECT COUNT(*) FROM jobs;`
3. Logs d'erreur : `tail -f storage/logs/laravel.log`

### Problème : Emails non reçus

**Vérifier :**
1. Configuration SMTP correcte dans `.env`
2. Logs Gmail pour dépassement de quota
3. Dossier spam du destinataire
4. Logs Laravel pour erreurs SMTP

### Problème : Timeout

**Solution :**
- Les messages sont envoyés via queue (pas de timeout possible)
- Vérifier que le job timeout est suffisant (300s par défaut)
- Augmenter si nécessaire dans `SendGroupMessageJob::$timeout`

---

## 📈 Statistiques et Métriques

### Nombre total de messages envoyés

**SQL :**
```sql
SELECT COUNT(*) FROM failed_jobs WHERE queue = 'emails';  -- Échecs
```

**Logs :**
```bash
grep "Message groupé envoyé" storage/logs/laravel.log | wc -l
```

### Taux de succès

**Formule :**
```
Taux = (Total envoyés - Échecs) / Total envoyés * 100
```

---

## 🎯 Cas d'usage

### 1. Relance des clients inactifs
```json
{
  "group_id": "inactive",
  "channel": "email",
  "subject": "Nous vous avons manqué ! 🎁",
  "message": "Cher(e) client(e),\n\nVoici un code promo de 15% : COMEBACK15\n\nRevenez découvrir nos nouvelles collections !"
}
```

### 2. Offre VIP exclusive
```json
{
  "group_id": "vip",
  "channel": "both",
  "subject": "🌟 Offre réservée à nos meilleurs clients",
  "message": "Merci pour votre fidélité !\n\nBénéficiez de 25% sur toute la boutique avec le code VIP25."
}
```

### 3. Annonce nouveauté
```json
{
  "group_id": "all",
  "channel": "email",
  "subject": "🎉 Nouvelle collection disponible !",
  "message": "Découvrez nos nouveaux modèles exclusifs.\n\nVisitez notre boutique dès maintenant !"
}
```

### 4. Message ciblé
```json
{
  "group_id": "with_orders",
  "channel": "email",
  "subject": "Programme de fidélité",
  "message": "Gagnez des points à chaque achat et bénéficiez d'avantages exclusifs !"
}
```

---

## ✅ Checklist de déploiement

- [x] Controller créé (`MessageGroupeController`)
- [x] Job créé et implémenté (`SendGroupMessageJob`)
- [x] Routes API configurées
- [x] Template email créé
- [x] Validation des endpoints (routes OK)
- [x] Numéro WhatsApp mis à jour (+221 78 466 14 12)
- [ ] Test d'envoi réel avec petit groupe
- [ ] Vérification réception emails
- [ ] Queue worker en production
- [ ] Documentation admin créée
- [ ] Interface admin (optionnel)

---

## 📞 Support

En cas de problème, vérifier :
1. Logs Laravel : `storage/logs/laravel.log`
2. Queue worker actif
3. Configuration email correcte
4. Connexion internet fonctionnelle

---

**Date de création :** 29 Novembre 2024  
**Version :** 1.0  
**Auteur :** Système VIVIAS SHOP
