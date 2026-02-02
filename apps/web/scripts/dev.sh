#!/bin/bash
# Script de développement pour SD Thai Food Web

set -e

echo "🚀 SD Thai Food - Web Development Setup"
echo "========================================"

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚙️  Création du fichier .env.local..."
    cp .env.example .env.local
    echo "✅ Fichier .env.local créé"
    echo "⚠️  Pensez à vérifier les variables d'environnement dans .env.local"
fi

echo ""
echo "✨ Lancement du serveur de développement..."
echo "📍 URL: http://localhost:3001"
echo "🔗 API Backend: ${NEXT_PUBLIC_API_URL:-http://localhost:3000}"
echo ""

npm run dev
