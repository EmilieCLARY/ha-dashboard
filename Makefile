.PHONY: help install dev build start stop restart logs clean test deploy

# Variables
COMPOSE := docker-compose
COMPOSE_PROD := docker-compose --profile production

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Installer toutes les dépendances
	@echo "📦 Installation des dépendances..."
	@echo "⚠️  Installation en mode WSL (sans workspace)"
	npm install --no-workspaces || npm install
	@echo "📦 Installation frontend..."
	cd frontend && npm install
	@echo "📦 Installation backend..."
	cd backend && npm install
	@echo "✅ Installation terminée"

setup: ## Configuration initiale du projet
	@echo "🔧 Configuration du projet..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "⚠️  Fichier .env créé, pensez à le configurer"; fi
	@echo "✅ Configuration terminée"

dev: ## Démarrer en mode développement (frontend + backend)
	@echo "🚀 Démarrage en mode développement..."
	npm run dev

dev-docker: ## Démarrer avec Docker en mode développement
	@echo "🐳 Démarrage Docker (dev)..."
	$(COMPOSE) up -d postgres redis
	@echo "⏳ Attente de PostgreSQL..."
	@sleep 5
	npm run dev

build: ## Build les images Docker
	@echo "🔨 Build des images Docker..."
	$(COMPOSE) build

start: ## Démarrer tous les services Docker
	@echo "🚀 Démarrage des services..."
	$(COMPOSE) up -d
	@echo "✅ Services démarrés"
	@$(MAKE) status

start-prod: ## Démarrer en mode production
	@echo "🚀 Démarrage en mode production..."
	$(COMPOSE_PROD) up -d --build
	@echo "✅ Services démarrés en production"
	@$(MAKE) status

stop: ## Arrêter tous les services
	@echo "🛑 Arrêt des services..."
	$(COMPOSE) down
	@echo "✅ Services arrêtés"

restart: ## Redémarrer tous les services
	@echo "♻️  Redémarrage des services..."
	$(COMPOSE) restart
	@echo "✅ Services redémarrés"

restart-backend: ## Redémarrer le backend uniquement
	@echo "♻️  Redémarrage du backend..."
	$(COMPOSE) restart backend

restart-frontend: ## Redémarrer le frontend uniquement
	@echo "♻️  Redémarrage du frontend..."
	$(COMPOSE) restart frontend

status: ## Voir le statut des services
	@echo "📊 Statut des services:"
	@$(COMPOSE) ps

logs: ## Voir les logs de tous les services
	$(COMPOSE) logs -f

logs-backend: ## Voir les logs du backend
	$(COMPOSE) logs -f backend

logs-frontend: ## Voir les logs du frontend
	$(COMPOSE) logs -f frontend

logs-db: ## Voir les logs de PostgreSQL
	$(COMPOSE) logs -f postgres

shell-backend: ## Accéder au shell du backend
	$(COMPOSE) exec backend sh

shell-frontend: ## Accéder au shell du frontend
	$(COMPOSE) exec frontend sh

shell-db: ## Accéder à PostgreSQL
	$(COMPOSE) exec postgres psql -U ha_dashboard

shell-redis: ## Accéder à Redis CLI
	$(COMPOSE) exec redis redis-cli

db-migrate: ## Créer et appliquer une migration Prisma
	@echo "🗄️  Migration de la base de données..."
	cd backend && npx prisma migrate dev

db-generate: ## Générer le client Prisma
	@echo "🔄 Génération du client Prisma..."
	cd backend && npx prisma generate

db-studio: ## Ouvrir Prisma Studio
	@echo "🎨 Ouverture de Prisma Studio..."
	cd backend && npx prisma studio

db-backup: ## Backup de la base de données
	@echo "💾 Backup de la base de données..."
	@mkdir -p backups
	$(COMPOSE) exec -T postgres pg_dump -U ha_dashboard ha_dashboard > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup créé dans backups/"

db-restore: ## Restaurer la base de données (usage: make db-restore FILE=backup.sql)
	@echo "📥 Restauration de la base de données..."
	@if [ -z "$(FILE)" ]; then echo "❌ Usage: make db-restore FILE=backup.sql"; exit 1; fi
	$(COMPOSE) exec -T postgres psql -U ha_dashboard ha_dashboard < $(FILE)
	@echo "✅ Base de données restaurée"

clean: ## Nettoyer les containers et volumes
	@echo "🧹 Nettoyage..."
	$(COMPOSE) down -v
	@echo "✅ Nettoyage terminé"

clean-docker: ## Nettoyer complètement Docker
	@echo "🧹 Nettoyage complet de Docker..."
	docker system prune -a --volumes -f
	@echo "✅ Nettoyage terminé"

test-frontend: ## Tester le frontend
	@echo "🧪 Tests frontend..."
	cd frontend && npm test

test-backend: ## Tester le backend
	@echo "🧪 Tests backend..."
	cd backend && npm test

lint: ## Linter le code
	@echo "🔍 Linting..."
	cd frontend && npm run lint
	cd backend && npm run lint
	@echo "✅ Linting terminé"

format: ## Formatter le code
	@echo "✨ Formatage du code..."
	cd frontend && npm run format
	cd backend && npm run format
	@echo "✅ Formatage terminé"

health: ## Vérifier la santé des services
	@echo "🏥 Vérification de la santé des services..."
	@curl -s http://localhost:4000/health || echo "❌ Backend inaccessible"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend inaccessible"

deploy: ## Déployer sur le VPS (production)
	@echo "🚀 Déploiement en production..."
	git pull origin main
	$(COMPOSE_PROD) build
	$(COMPOSE_PROD) down
	$(COMPOSE_PROD) up -d
	@echo "✅ Déploiement terminé"

update: ## Mettre à jour les dépendances
	@echo "📦 Mise à jour des dépendances..."
	npm update
	cd frontend && npm update
	cd backend && npm update
	@echo "✅ Dépendances mises à jour"

cert-generate: ## Générer des certificats SSL auto-signés (dev)
	@echo "🔐 Génération de certificats SSL..."
	@mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/privkey.pem \
		-out nginx/ssl/fullchain.pem \
		-subj "/C=FR/ST=France/L=Paris/O=Dev/CN=localhost"
	@echo "✅ Certificats générés dans nginx/ssl/"

stats: ## Statistiques Docker
	@echo "📊 Statistiques Docker:"
	@docker stats --no-stream

volumes: ## Lister les volumes Docker
	@echo "💾 Volumes Docker:"
	@docker volume ls

info: ## Informations sur le projet
	@echo "ℹ️  Informations du projet:"
	@echo "  Nom: Home Assistant Dashboard"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:4000"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"
	@echo ""
	@echo "📚 Documentation:"
	@echo "  - README.md: Vue d'ensemble"
	@echo "  - ARCHITECTURE.md: Architecture détaillée"
	@echo "  - QUICKSTART.md: Guide de démarrage"
	@echo "  - DEPLOYMENT.md: Guide de déploiement"
