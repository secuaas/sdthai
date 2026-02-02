# 🚀 DÉMARRAGE - SD Thai Food Web

> Application Next.js 14 complète - Prête à l'emploi

## ⚡ Démarrage Express (3 minutes)

```bash
# 1. Se placer dans le dossier
cd /home/ubuntu/projects/sdthai/apps/web

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

**Accès:** http://localhost:3001

---

## 📋 Que faire ensuite?

### Option 1: Développement Local
1. L'application est accessible sur http://localhost:3001
2. Parcourir les pages publiques
3. Tester la page de login (en attendant le backend)
4. Explorer le code dans les dossiers `app/`, `components/`, etc.

### Option 2: Lire la Documentation
- **QUICKSTART.md** - Guide de démarrage détaillé
- **ARCHITECTURE.md** - Architecture complète de l'application
- **VALIDATION.md** - Checklist de validation et tests

### Option 3: Build de Production
```bash
npm run build
npm start
```

---

## ⚠️ Prérequis Important

Le backend NestJS doit être lancé sur **http://localhost:3000** pour que l'API fonctionne.

Si le backend n'est pas encore prêt:
- Les pages publiques fonctionneront
- La page de login s'affichera
- Les appels API échoueront (normal)

---

## 📁 Fichiers Créés

**48 fichiers** au total:
- 16 pages (routes Next.js)
- 10 composants (UI + Layout)
- 2 librairies (API client + Utils)
- 12 fichiers de configuration
- 2 manifests Kubernetes
- 6 fichiers de documentation

Voir **FILES_CREATED.md** pour la liste complète.

---

## 🎯 Fonctionnalités Principales

### Routes Publiques
- `/` - Homepage
- `/produits` - Catalogue
- `/login` - Connexion

### Espace Partenaire (après login)
- `/partner/dashboard` - Dashboard
- `/partner/commandes` - Liste des commandes
- `/partner/commandes/nouvelle` - Créer une commande

### Espace Admin (après login)
- `/admin/dashboard` - Dashboard admin
- `/admin/partenaires` - Gestion partenaires
- `/admin/produits` - Gestion produits
- `/admin/commandes` - Gestion commandes

---

## 🔧 Configuration

Le fichier `.env.local` est déjà créé avec:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SD Thai Food"
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Modifier si besoin (autre port API, etc.)

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| **START_HERE.md** | Ce fichier (point de départ) |
| **QUICKSTART.md** | Guide de démarrage détaillé |
| **ARCHITECTURE.md** | Architecture technique |
| **README.md** | Documentation générale |
| **FILES_CREATED.md** | Liste des fichiers créés |
| **VALIDATION.md** | Checklist de validation |
| **SUMMARY.txt** | Résumé visuel |

---

## ✅ Checklist Rapide

- [ ] Dépendances installées (`npm install`)
- [ ] Backend lancé sur port 3000 (ou configuré dans .env.local)
- [ ] Application lancée (`npm run dev`)
- [ ] Accès à http://localhost:3001 OK
- [ ] Pages publiques accessibles
- [ ] Page de login s'affiche

---

## 🆘 Problèmes?

### Port 3001 déjà utilisé?
Modifier dans `package.json`:
```json
"dev": "next dev -p 3002"
```

### L'API ne répond pas?
Vérifier que le backend est lancé:
```bash
curl http://localhost:3000/api/health
```

### Erreur de compilation?
```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

## 🚀 Prêt!

L'application est **complète et fonctionnelle**.

**Prochaine étape:** Lancer `npm run dev` et explorer l'application!

Pour aller plus loin: consulter **QUICKSTART.md**

Bon développement! 🎉
