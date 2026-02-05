# SD Thai Food - Mobile App

Application mobile React Native (Expo) pour la gestion des retours produits.

## Fonctionnalités

- **Gestion des Retours**
  - Liste des retours créés
  - Création de nouveaux retours
  - Upload de photos (caméra ou galerie)
  - Sélection de la raison du retour
  - Suivi du statut (Pending, Approved, Rejected)

## Technologies

- **React Native** avec Expo
- **TypeScript**
- **React Navigation** - Navigation entre écrans
- **Expo Camera** - Prise de photos
- **Expo Image Picker** - Sélection depuis la galerie
- **AsyncStorage** - Stockage local
- **Axios** - Appels API

## Installation

```bash
npm install
```

## Développement

```bash
# Démarrer le serveur de développement
npm start

# Sur Android
npm run android

# Sur iOS (macOS uniquement)
npm run ios

# Version web
npm run web
```

## Structure du Projet

```
src/
├── api/           # Clients API et services
│   ├── client.ts  # Client HTTP avec authentification
│   └── returns.ts # API retours
├── screens/       # Écrans de l'application
│   ├── ReturnsListScreen.tsx
│   └── CreateReturnScreen.tsx
├── components/    # Composants réutilisables
├── types/         # Types TypeScript
└── utils/         # Utilitaires
```

## Configuration

Créer un fichier `.env` à la racine du projet mobile:

```env
EXPO_PUBLIC_API_URL=https://sdthai.secuaas.dev/api
```

## Fonctionnalités à venir

- [ ] Authentification partenaire
- [ ] POS mobile (optionnel)
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Synchronisation des données

## Build Production

```bash
# Build Android APK
eas build --platform android

# Build iOS
eas build --platform ios
```

## Version

**Actuelle:** 0.1.0 (Phase 4 - Initial Release)
