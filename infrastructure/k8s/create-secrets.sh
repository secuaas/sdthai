#!/bin/bash
#
# Script de création des secrets Kubernetes pour SD Thai Food
# Usage: ./create-secrets.sh [dev|prod]
#

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
usage() {
    echo "Usage: $0 <environment>"
    echo ""
    echo "Environments:"
    echo "  dev   - Crée les secrets pour l'environnement de développement"
    echo "  prod  - Crée les secrets pour l'environnement de production"
    echo ""
    echo "Ce script génère automatiquement des secrets sécurisés ou vous permet de les fournir."
    echo ""
    echo "Exemples:"
    echo "  $0 dev     # Crée les secrets dev"
    echo "  $0 prod    # Crée les secrets prod"
    exit 1
}

# Fonction pour générer un secret aléatoire
generate_secret() {
    openssl rand -base64 32
}

# Vérification des arguments
if [ $# -ne 1 ]; then
    usage
fi

ENV=$1

# Vérification de l'environnement
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}Erreur: Environnement invalide. Utilisez 'dev' ou 'prod'${NC}"
    usage
fi

# Configuration selon l'environnement
if [ "$ENV" == "dev" ]; then
    NAMESPACE="sdthai-dev"
else
    NAMESPACE="sdthai-prod"
fi

echo -e "${GREEN}=== Création des secrets pour SD Thai Food ===${NC}"
echo -e "Environnement: ${YELLOW}$ENV${NC}"
echo -e "Namespace: ${YELLOW}$NAMESPACE${NC}"
echo ""

# Vérifier si le namespace existe
if ! kubectl get namespace $NAMESPACE &>/dev/null; then
    echo -e "${YELLOW}Le namespace $NAMESPACE n'existe pas encore. Il sera créé lors du déploiement.${NC}"
    echo -e "${YELLOW}Création du namespace maintenant...${NC}"
    kubectl create namespace $NAMESPACE
    echo -e "${GREEN}✓ Namespace créé${NC}"
    echo ""
fi

# Vérifier si les secrets existent déjà
if kubectl get secret sdthai-api-secrets -n $NAMESPACE &>/dev/null; then
    echo -e "${YELLOW}ATTENTION: Les secrets existent déjà dans le namespace $NAMESPACE${NC}"
    read -p "Voulez-vous les remplacer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Annulé"
        exit 0
    fi
    kubectl delete secret sdthai-api-secrets -n $NAMESPACE
fi

echo -e "${YELLOW}Génération des secrets...${NC}"
echo ""

# Option 1: Générer automatiquement
# Option 2: Fournir manuellement
echo "Choisissez le mode de création des secrets:"
echo "1) Générer automatiquement (recommandé pour dev)"
echo "2) Fournir manuellement (recommandé pour prod)"
read -p "Votre choix (1/2): " -r
echo

if [[ $REPLY =~ ^1$ ]]; then
    # Génération automatique
    JWT_SECRET=$(generate_secret)
    JWT_REFRESH_SECRET=$(generate_secret)

    echo -e "${GREEN}Secrets générés automatiquement${NC}"
else
    # Saisie manuelle
    echo -e "${YELLOW}Veuillez fournir les secrets (ou laissez vide pour génération auto):${NC}"
    echo ""

    read -p "JWT_SECRET: " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(generate_secret)
        echo -e "${YELLOW}Généré automatiquement${NC}"
    fi

    read -p "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET
    if [ -z "$JWT_REFRESH_SECRET" ]; then
        JWT_REFRESH_SECRET=$(generate_secret)
        echo -e "${YELLOW}Généré automatiquement${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Création du secret Kubernetes...${NC}"

# Créer le secret
kubectl create secret generic sdthai-api-secrets \
    --from-literal=JWT_SECRET="$JWT_SECRET" \
    --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
    -n $NAMESPACE

echo ""
echo -e "${GREEN}✓ Secret créé avec succès${NC}"

# Afficher les informations (sans les valeurs)
echo ""
echo -e "${GREEN}Informations du secret:${NC}"
kubectl describe secret sdthai-api-secrets -n $NAMESPACE

echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo -e "${RED}Sauvegardez ces secrets de manière sécurisée!${NC}"
echo ""
echo -e "Pour récupérer les valeurs ultérieurement:"
echo -e "kubectl get secret sdthai-api-secrets -n $NAMESPACE -o jsonpath='{.data.JWT_SECRET}' | base64 -d"
echo -e "kubectl get secret sdthai-api-secrets -n $NAMESPACE -o jsonpath='{.data.JWT_REFRESH_SECRET}' | base64 -d"
echo ""

# Sauvegarder dans un fichier local (optionnel et sécurisé)
read -p "Voulez-vous sauvegarder les secrets dans un fichier local? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SECRET_FILE="secrets-$ENV-$(date +%Y%m%d-%H%M%S).txt"
    cat > "$SECRET_FILE" << EOF
# Secrets SD Thai Food - $ENV
# Créés le: $(date)
# Namespace: $NAMESPACE

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Pour créer manuellement le secret:
kubectl create secret generic sdthai-api-secrets \\
    --from-literal=JWT_SECRET="$JWT_SECRET" \\
    --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \\
    -n $NAMESPACE
EOF

    chmod 600 "$SECRET_FILE"
    echo -e "${GREEN}✓ Secrets sauvegardés dans: $SECRET_FILE${NC}"
    echo -e "${RED}ATTENTION: Gardez ce fichier en sécurité et ne le versionnez JAMAIS dans Git!${NC}"
fi

echo ""
echo -e "${GREEN}=== Terminé ===${NC}"
