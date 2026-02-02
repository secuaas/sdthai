# Makefile pour SD Thai Food Web

# Variables
APP_NAME=sdthai-web
REGISTRY=registry.secuaas.com
IMAGE=$(REGISTRY)/sdthai/web
TAG?=latest
PORT=3001

.PHONY: help install dev build start clean docker-build docker-push docker-run k8s-deploy k8s-delete k8s-logs

help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installer les dépendances
	npm install

dev: ## Lancer le serveur de développement
	npm run dev

build: ## Build de production
	npm run build

start: ## Lancer en mode production
	npm start

type-check: ## Vérifier les types TypeScript
	npm run type-check

lint: ## Linter le code
	npm run lint

clean: ## Nettoyer les fichiers de build
	rm -rf .next out node_modules

# Docker
docker-build: ## Build l'image Docker
	docker build -t $(IMAGE):$(TAG) \
		--build-arg NEXT_PUBLIC_API_URL=http://sdthai-api:3000 \
		.

docker-push: ## Push l'image Docker
	docker push $(IMAGE):$(TAG)

docker-run: ## Lancer le conteneur Docker localement
	docker run -p $(PORT):3000 \
		-e NEXT_PUBLIC_API_URL=http://localhost:3000 \
		$(IMAGE):$(TAG)

docker-all: docker-build docker-push ## Build et push l'image

# Kubernetes
k8s-deploy: ## Déployer sur Kubernetes
	kubectl apply -f k8s/

k8s-delete: ## Supprimer de Kubernetes
	kubectl delete -f k8s/

k8s-logs: ## Voir les logs
	kubectl logs -n sdthai -l app=$(APP_NAME) --tail=100 -f

k8s-status: ## Voir le status du déploiement
	kubectl get pods,svc,ingress -n sdthai -l app=$(APP_NAME)

k8s-restart: ## Redémarrer le déploiement
	kubectl rollout restart deployment/$(APP_NAME) -n sdthai

k8s-shell: ## Accéder au shell d'un pod
	kubectl exec -it -n sdthai $$(kubectl get pod -n sdthai -l app=$(APP_NAME) -o jsonpath='{.items[0].metadata.name}') -- sh
