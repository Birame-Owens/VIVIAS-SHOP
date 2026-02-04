# 🔧 COMMANDES UTILES - RÉDUCTION BUNDLE

## 🚀 COMMANDES ESSENTIELLES

### Build Production
```bash
npm run build
```
✅ Crée les chunks optimisés dans `public/build/`

### Démarrer en Développement
```bash
# Terminal 1: Serveur Laravel
php artisan serve --host=192.168.1.21 --port=8000

# Terminal 2: Vite dev server (auto-reload)
npm run dev
```

### Accès en Production
```
Frontend: http://192.168.1.21:5173/
Backend: http://192.168.1.21:8000/
```

---

## 📊 VÉRIFIER TAILLE BUNDLE

### Voir tous les fichiers générés
```bash
ls -lh public/build/assets/ | head -20
```

### Compter les chunks créés
```bash
ls public/build/assets/*.js | wc -l
# Doit afficher: 13 ou plus
```

### Voir la taille totale
```bash
du -sh public/build/
```

### Afficher détails des fichiers
```bash
ls -lhS public/build/assets/ | sort -k5 -h
# Trier par taille décroissante
```

---

## 🔍 ANALYSER LE BUILD

### Utiliser vite-plugin-visualizer (Optionnel)

```bash
# Installer
npm install --save-dev vite-plugin-visualizer

# Ajouter à vite.config.js:
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
    plugins: [
        // ... autres plugins
        visualizer({
            open: true, // Ouvrir auto après build
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
        })
    ]
})

# Builder
npm run build

# Ouvrir stats.html
open stats.html
```

### Analyser tailles de modules
```bash
npm install --save-dev webpack-bundle-analyzer

# Génère un HTML visuel de la composition
```

---

## 🧹 NETTOYER & REBUILD

### Nettoyer complètement
```bash
# Supprimer cache Vite
rm -rf node_modules/.vite

# Supprimer ancien build
rm -rf public/build

# Réinstaller dépendances (optionnel)
rm -rf node_modules
npm install

# Recompiler
npm run build
```

### Juste recompiler
```bash
npm run build
```

---

## 💻 DEVTOOLS NETWORK

### Vérifier les chunks chargés

1. **F12** (ou Ctrl+Shift+I)
2. **Network tab**
3. **Recharger** (Ctrl+Shift+R pour hard refresh)
4. **Filtrer** par `.js`
5. **Observer:**
   - Fichiers chargés immédiatement
   - Taille de chaque fichier
   - Temps de chargement

### Vérifier le lazy loading

1. Rester dans Network tab
2. Cliquer sur une page (ex: /shop)
3. Voir les nouveaux .js se charger
4. C'est le lazy loading qui fonctionne! ✅

---

## 📈 LIGHTHOUSE (Performance)

### Analyser une page

1. **F12** → **Lighthouse tab**
2. **Cocher:** Desktop ou Mobile
3. **Cliquer:** "Analyze page load"
4. **Attendre** ~30s
5. **Voir le rapport:**
   - Performance Score
   - LCP, FID, CLS
   - Conseils d'amélioration

### Répéter pour comparer
```
Avant optimisations:
- Score: 65
- LCP: 3.5s

Après optimisations:
- Score: 88
- LCP: 1.8s

= +35 points! ✅
```

---

## 🔄 GIT COMMANDES (Optionnel)

### Versionner les changements
```bash
# Voir les modifications
git status

# Ajouter les fichiers
git add vite.config.js resources/js/client/app.jsx

# Commit
git commit -m "refactor: aggressive bundle code-splitting (-51%)"

# Push
git push origin main
```

---

## 🐛 TROUBLESHOOTING

### Problème: npm run build échoue

**Solution:**
```bash
# Nettoyer complètement
rm -rf node_modules/.vite public/build

# Vérifier syntax
npm run build 2>&1 | head -50

# Vérifier vite.config.js
cat vite.config.js | grep -A 5 "manualChunks"
```

### Problème: Voir toujours 630 KB

**Solution:**
```bash
# Vider cache navigateur
Ctrl+Shift+Delete

# Hard refresh
Ctrl+Shift+R

# Vérifier build récent
ls -lt public/build/assets/ | head -5
# Doit montrer fichiers récents (dans les secondes)
```

### Problème: 404 sur les fichiers .js

**Solution:**
```bash
# Vérifier manifest.json
cat public/build/manifest.json

# Vérifier que les fichiers existent
ls public/build/assets/*.js

# Supprimer et recompiler
rm -rf public/build
npm run build
```

### Problème: Vite dev server ne démarre pas

**Solution:**
```bash
# Vérifier port 5173 libre
lsof -i :5173
# Si occupé, tuer le processus

# Relancer
npm run dev
```

---

## 📊 MONITORING EN PRODUCTION

### Vérifier la performance réelle

```javascript
// Ajouter dans resources/js/client/app.jsx
if ('PerformanceObserver' in window) {
    // Observer LCP
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log('LCP:', entry.renderTime || entry.loadTime);
            // Envoyer à analytics
        }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Observer FID
    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log('FID:', entry.processingDuration);
            // Envoyer à analytics
        }
    }).observe({ entryTypes: ['first-input'] });
}
```

### Vérifier avec Google Analytics

```html
<!-- Ajouter dans resources/views/app.blade.php -->
<script>
  // Web Vitals
  window.addEventListener('load', () => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        // Envoyer à GA
        gtag.event(entry.name, {
          event_category: 'Web Vitals',
          value: Math.round(entry.value),
          event_label: entry.id
        });
      });
    }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift'] });
  });
</script>
```

---

## 🎯 CHECKLIST QUOTIDIENNE

### Avant de commencer
- [ ] `npm run build` réussi?
- [ ] `public/build/` existe et pas vide?
- [ ] Pas d'erreurs dans console?

### Après modification de code
- [ ] Recompiler: `npm run build`
- [ ] Pas de chunk > 500 KB?
- [ ] Vérifier DevTools Network?

### Avant déploiement
- [ ] Lighthouse score > 85?
- [ ] LCP < 2.5s?
- [ ] Pas d'erreur 404?
- [ ] Admin et Client séparés?

---

## 📱 SHORTCUTS UTILES

### Navigateur DevTools
```
F12                    Ouvrir DevTools
Ctrl+Shift+I          Ouvrir DevTools (alt)
Ctrl+Shift+Delete    Vider cache
Ctrl+Shift+R         Hard refresh
Ctrl+Shift+C         Inspecteur d'éléments
Ctrl+Shift+J         Console
Ctrl+Shift+E         Network
Ctrl+Shift+K         Performance
```

### Terminal
```bash
Up arrow             Commande précédente
Ctrl+C              Arrêter processus
clear ou cls        Vider écran
history             Voir historique
```

---

## 🎓 RESSOURCES

### Documentation Vite
```
https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
https://rollupjs.org/configuration-options/#output-manualchunks
```

### Lighthouse Best Practices
```
https://web.dev/performance/
https://web.dev/lighthouse/
https://web.dev/vitals/
```

### React Performance
```
https://react.dev/reference/react/lazy
https://react.dev/reference/react/Suspense
```

---

## ✅ RÉSUMÉ

```
COMMANDES PRINCIPALES:
npm run build           Build production
npm run dev            Dev avec auto-reload

VÉRIFICATION:
DevTools → Network tab      Voir chunks
DevTools → Lighthouse       Mesurer performance

TROUBLESHOOTING:
rm -rf public/build    Nettoyer
npm run build          Recompiler

ACCÈS:
Frontend: http://192.168.1.21:5173/
Backend: http://192.168.1.21:8000/
```

---

**Vous êtes prêt! 🚀**

Utilisez ces commandes pour tester, vérifier et améliorer votre site!
