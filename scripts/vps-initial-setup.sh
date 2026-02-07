#!/bin/bash

# Script de déploiement initial pour le VPS
# À exécuter UNE SEULE FOIS sur le VPS pour la première installation

set -e

# Variables (à adapter si nécessaire)
PROJECT_DIR="$HOME/ha-dashboard"
REPO_URL="https://github.com/EmilieCLARY/ha-dashboard.git"

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Installation initiale de HA Dashboard${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Vérification des prérequis
echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"

# Vérifier si on est sous Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}❌ Ce script est conçu pour Linux${NC}"
    exit 1
fi

# Mise à jour du système
echo -e "${BLUE}📦 Mise à jour du système...${NC}"
sudo apt-get update

# Installation de Docker
echo -e "${BLUE}🐳 Installation de Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installation de Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installé${NC}"
    echo -e "${YELLOW}⚠️  Vous devrez vous déconnecter/reconnecter pour que les permissions Docker prennent effet${NC}"
else
    echo -e "${GREEN}✅ Docker déjà installé ($(docker --version))${NC}"
fi

# Installation de Docker Compose
echo -e "${BLUE}🐳 Installation de Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installation de Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installé${NC}"
else
    echo -e "${GREEN}✅ Docker Compose déjà installé ($(docker-compose --version))${NC}"
fi

# Installation de Git
echo -e "${BLUE}📦 Vérification de Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    echo -e "${GREEN}✅ Git installé${NC}"
else
    echo -e "${GREEN}✅ Git déjà installé ($(git --version))${NC}"
fi

# Clone du repository
echo -e "${BLUE}📥 Clone du repository...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Le dossier existe déjà, mise à jour...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    echo -e "${GREEN}✅ Repository cloné${NC}"
fi

# Création des dossiers nécessaires
echo -e "${BLUE}📁 Création des dossiers...${NC}"
mkdir -p "$PROJECT_DIR/backups"
mkdir -p "$PROJECT_DIR/logs"
echo -e "${GREEN}✅ Dossiers créés${NC}"

# Configuration de l'environnement
echo -e "${BLUE}⚙️  Configuration de l'environnement...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cp .env.example .env
    
    # Générer des JWT secrets sécurisés
    echo -e "${BLUE}🔐 Génération des JWT secrets...${NC}"
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -hex 32)
        JWT_REFRESH_SECRET=$(openssl rand -hex 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
        sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}/" .env
        echo -e "${GREEN}✅ JWT secrets générés automatiquement${NC}"
    else
        echo -e "${YELLOW}⚠️  openssl non disponible, veuillez générer les JWT secrets manuellement${NC}"
    fi
    
    # Générer des mots de passe aléatoires pour PostgreSQL et Redis
    echo -e "${BLUE}🔐 Génération des mots de passe...${NC}"
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/" .env
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${REDIS_PASSWORD}/" .env
    echo -e "${GREEN}✅ Mots de passe générés${NC}"
    
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}⚠️  CONFIGURATION REQUISE${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Vous devez maintenant éditer le fichier .env et configurer:${NC}"
    echo -e "${YELLOW}  1. HA_URL (URL de votre Home Assistant)${NC}"
    echo -e "${YELLOW}  2. HA_TOKEN (Token d'accès longue durée)${NC}"
    echo ""
    echo -e "${BLUE}Commande: nano $PROJECT_DIR/.env${NC}"
    echo ""
    read -p "Appuyez sur Entrée quand vous aurez configuré le .env..."
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# Configuration du firewall
echo -e "${BLUE}🔥 Configuration du firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Frontend
    sudo ufw allow 4000/tcp  # Backend API
    sudo ufw --force enable
    echo -e "${GREEN}✅ Firewall configuré${NC}"
else
    echo -e "${YELLOW}⚠️  UFW non disponible, firewall non configuré${NC}"
fi

# Démarrage de l'application
echo -e "${BLUE}🚀 Démarrage de l'application...${NC}"
echo -e "${YELLOW}Pulling Docker images...${NC}"
docker-compose --profile production pull

echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose --profile production up -d --build

# Attendre que les services démarrent
echo -e "${BLUE}⏳ Attente du démarrage des services (30s)...${NC}"
sleep 30

# Exécuter les migrations de la base de données
echo -e "${BLUE}📊 Exécution des migrations de la base de données...${NC}"
docker-compose exec -T backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migrations échouées, à relancer manuellement${NC}"

# Vérification de l'état des conteneurs
echo -e "${BLUE}📋 État des conteneurs:${NC}"
docker-compose ps

# Test de santé
echo -e "${BLUE}🏥 Test de santé de l'API...${NC}"
sleep 5
if curl -f http://localhost:4000/health 2>/dev/null; then
    echo -e "${GREEN}✅ API répond correctement !${NC}"
else
    echo -e "${YELLOW}⚠️  API ne répond pas encore, cela peut prendre quelques minutes${NC}"
fi

# Configuration Git pour les déploiements futurs
echo -e "${BLUE}⚙️  Configuration Git...${NC}"
cd "$PROJECT_DIR"
git config pull.rebase false
echo -e "${GREEN}✅ Git configuré${NC}"

# Créer un script de backup automatique
echo -e "${BLUE}💾 Configuration des backups automatiques...${NC}"
cat > "$PROJECT_DIR/backup-db.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/ha-dashboard/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cd "$HOME/ha-dashboard"
docker-compose exec -T postgres pg_dump -U ha_dashboard ha_dashboard > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
# Garder seulement les 7 derniers backups
ls -t "$BACKUP_DIR"/db_backup_*.sql | tail -n +8 | xargs -r rm
echo "✅ Backup créé: db_backup_$TIMESTAMP.sql"
EOF
chmod +x "$PROJECT_DIR/backup-db.sh"
echo -e "${GREEN}✅ Script de backup créé${NC}"

# Configurer une tâche cron pour les backups quotidiens
echo -e "${BLUE}⏰ Configuration des backups automatiques quotidiens...${NC}"
CRON_JOB="0 2 * * * $PROJECT_DIR/backup-db.sh >> $PROJECT_DIR/logs/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup-db.sh"; echo "$CRON_JOB") | crontab -
echo -e "${GREEN}✅ Backup automatique configuré (tous les jours à 2h du matin)${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Informations d'accès:${NC}"
echo -e "  ${YELLOW}Frontend:${NC} http://$(hostname -I | awk '{print $1}'):3000"
echo -e "  ${YELLOW}Backend API:${NC} http://$(hostname -I | awk '{print $1}'):4000"
echo -e "  ${YELLOW}Health Check:${NC} http://$(hostname -I | awk '{print $1}'):4000/health"
echo ""
echo -e "${BLUE}📁 Chemins importants:${NC}"
echo -e "  ${YELLOW}Projet:${NC} $PROJECT_DIR"
echo -e "  ${YELLOW}Config:${NC} $PROJECT_DIR/.env"
echo -e "  ${YELLOW}Backups:${NC} $PROJECT_DIR/backups"
echo -e "  ${YELLOW}Logs:${NC} $PROJECT_DIR/logs"
echo ""
echo -e "${BLUE}🛠️  Commandes utiles:${NC}"
echo -e "  ${YELLOW}cd $PROJECT_DIR${NC}"
echo -e "  ${YELLOW}docker-compose ps${NC}                    - État des conteneurs"
echo -e "  ${YELLOW}docker-compose logs -f${NC}               - Voir les logs en temps réel"
echo -e "  ${YELLOW}docker-compose logs -f backend${NC}       - Logs du backend"
echo -e "  ${YELLOW}docker-compose logs -f frontend${NC}      - Logs du frontend"
echo -e "  ${YELLOW}docker-compose restart${NC}               - Redémarrer tous les services"
echo -e "  ${YELLOW}docker-compose down${NC}                  - Arrêter tous les services"
echo -e "  ${YELLOW}docker-compose up -d${NC}                 - Démarrer tous les services"
echo -e "  ${YELLOW}./backup-db.sh${NC}                       - Backup manuel de la DB"
echo -e "  ${YELLOW}./scripts/deploy.sh production status${NC} - Voir le statut"
echo ""
echo -e "${BLUE}🔧 Pour mettre à jour l'application:${NC}"
echo -e "  ${YELLOW}git pull origin main${NC}"
echo -e "  ${YELLOW}docker-compose --profile production up -d --build${NC}"
echo -e "  ${YELLOW}docker-compose exec backend npx prisma migrate deploy${NC}"
echo ""
echo -e "${GREEN}🎉 L'application devrait maintenant être accessible !${NC}"
echo ""
echo -e "${YELLOW}⚠️  Si vous venez d'installer Docker, déconnectez-vous et reconnectez-vous${NC}"
echo -e "${YELLOW}   pour que les permissions prennent effet.${NC}"
echo ""
