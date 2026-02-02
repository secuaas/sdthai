#!/bin/bash
#
# Script de déploiement SD Thai Food sur Kubernetes
# Usage: ./deploy.sh [dev|prod] [apply|delete|status]
#

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
usage() {
    echo "Usage: $0 <environment> <action>"
    echo ""
    echo "Environments:"
    echo "  dev   - Déploiement en développement (sdthai-dev.secuaas.dev)"
    echo "  prod  - Déploiement en production (sdthai.ch)"
    echo ""
    echo "Actions:"
    echo "  apply   - Applique la configuration Kubernetes"
    echo "  delete  - Supprime les ressources Kubernetes"
    echo "  status  - Affiche l'état du déploiement"
    echo "  preview - Prévisualise les manifestes sans les appliquer"
    echo ""
    echo "Exemples:"
    echo "  $0 dev apply     # Déploie en dev"
    echo "  $0 prod status   # Affiche le status prod"
    echo "  $0 dev preview   # Prévisualise les manifestes dev"
    exit 1
}

# Vérification des arguments
if [ $# -lt 2 ]; then
    usage
fi

ENV=$1
ACTION=$2

# Vérification de l'environnement
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo -e "${RED}Erreur: Environnement invalide. Utilisez 'dev' ou 'prod'${NC}"
    usage
fi

# Vérification de l'action
if [ "$ACTION" != "apply" ] && [ "$ACTION" != "delete" ] && [ "$ACTION" != "status" ] && [ "$ACTION" != "preview" ]; then
    echo -e "${RED}Erreur: Action invalide${NC}"
    usage
fi

# Configuration selon l'environnement
if [ "$ENV" == "dev" ]; then
    NAMESPACE="sdthai-dev"
    OVERLAY_PATH="overlays/dev"
    DOMAIN="sdthai-dev.secuaas.dev"
    API_DOMAIN="api-sdthai-dev.secuaas.dev"
else
    NAMESPACE="sdthai-prod"
    OVERLAY_PATH="overlays/prod"
    DOMAIN="sdthai.ch"
    API_DOMAIN="api.sdthai.ch"
fi

echo -e "${GREEN}=== SD Thai Food - Déploiement Kubernetes ===${NC}"
echo -e "Environnement: ${YELLOW}$ENV${NC}"
echo -e "Namespace: ${YELLOW}$NAMESPACE${NC}"
echo -e "Domain: ${YELLOW}$DOMAIN${NC}"
echo ""

# Fonction pour afficher le status
show_status() {
    echo -e "${GREEN}Status des ressources:${NC}"
    echo ""

    echo -e "${YELLOW}Deployments:${NC}"
    kubectl get deployments -n $NAMESPACE 2>/dev/null || echo "Aucun deployment trouvé"
    echo ""

    echo -e "${YELLOW}Pods:${NC}"
    kubectl get pods -n $NAMESPACE 2>/dev/null || echo "Aucun pod trouvé"
    echo ""

    echo -e "${YELLOW}Services:${NC}"
    kubectl get services -n $NAMESPACE 2>/dev/null || echo "Aucun service trouvé"
    echo ""

    echo -e "${YELLOW}Ingress:${NC}"
    kubectl get ingress -n $NAMESPACE 2>/dev/null || echo "Aucun ingress trouvé"
    echo ""

    if [ "$ENV" == "prod" ]; then
        echo -e "${YELLOW}HPA (Horizontal Pod Autoscaler):${NC}"
        kubectl get hpa -n $NAMESPACE 2>/dev/null || echo "Aucun HPA trouvé"
        echo ""
    fi

    echo -e "${YELLOW}ConfigMaps:${NC}"
    kubectl get configmaps -n $NAMESPACE 2>/dev/null || echo "Aucun configmap trouvé"
    echo ""

    echo -e "${YELLOW}Secrets:${NC}"
    kubectl get secrets -n $NAMESPACE 2>/dev/null || echo "Aucun secret trouvé"
}

# Fonction pour prévisualiser
preview_manifests() {
    echo -e "${GREEN}Prévisualisation des manifestes:${NC}"
    echo ""
    kubectl kustomize $OVERLAY_PATH
}

# Fonction pour vérifier les secrets
check_secrets() {
    echo -e "${YELLOW}Vérification des secrets requis...${NC}"

    if ! kubectl get secret sdthai-api-secrets -n $NAMESPACE &>/dev/null; then
        echo -e "${RED}ATTENTION: Le secret 'sdthai-api-secrets' n'existe pas dans le namespace $NAMESPACE${NC}"
        echo -e "${YELLOW}Créez-le avec:${NC}"
        echo "kubectl create secret generic sdthai-api-secrets \\"
        echo "  --from-literal=JWT_SECRET=your-jwt-secret \\"
        echo "  --from-literal=JWT_REFRESH_SECRET=your-refresh-secret \\"
        echo "  -n $NAMESPACE"
        echo ""
        read -p "Voulez-vous continuer quand même? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Secret 'sdthai-api-secrets' trouvé${NC}"
    fi
}

# Exécution de l'action
case $ACTION in
    preview)
        preview_manifests
        ;;

    apply)
        echo -e "${YELLOW}Déploiement en cours...${NC}"
        check_secrets

        echo -e "${YELLOW}Application des manifestes Kustomize...${NC}"
        kubectl apply -k $OVERLAY_PATH

        echo ""
        echo -e "${GREEN}✓ Déploiement terminé${NC}"
        echo ""

        echo -e "${YELLOW}Suivi du déploiement...${NC}"
        kubectl rollout status deployment/$(kubectl get deployments -n $NAMESPACE -o name | head -1 | cut -d'/' -f2) -n $NAMESPACE 2>/dev/null || true

        echo ""
        show_status

        echo ""
        echo -e "${GREEN}Accès à l'application:${NC}"
        echo -e "Frontend: https://$DOMAIN"
        echo -e "API: https://$API_DOMAIN"
        ;;

    delete)
        echo -e "${RED}ATTENTION: Vous allez supprimer toutes les ressources de $ENV${NC}"
        read -p "Êtes-vous sûr? (yes/N) " -r
        echo
        if [[ ! $REPLY =~ ^yes$ ]]; then
            echo "Annulé"
            exit 0
        fi

        echo -e "${YELLOW}Suppression des ressources...${NC}"
        kubectl delete -k $OVERLAY_PATH

        echo ""
        echo -e "${GREEN}✓ Ressources supprimées${NC}"
        ;;

    status)
        show_status

        echo ""
        echo -e "${GREEN}Logs récents (API):${NC}"
        kubectl logs -n $NAMESPACE -l app=sdthai-api --tail=10 2>/dev/null || echo "Aucun log disponible"
        ;;
esac

echo ""
echo -e "${GREEN}=== Terminé ===${NC}"
