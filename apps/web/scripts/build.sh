#!/bin/bash
# Script de build pour SD Thai Food Web

set -e

echo "🔨 SD Thai Food - Build Production"
echo "===================================="

# Type check
echo "🔍 Vérification des types TypeScript..."
npm run type-check

# Lint
echo "🧹 Linting du code..."
npm run lint || true

# Build
echo "📦 Build de production..."
npm run build

echo ""
echo "✅ Build terminé avec succès!"
echo "📁 Fichiers dans .next/"
echo "🚀 Prêt pour le déploiement"
