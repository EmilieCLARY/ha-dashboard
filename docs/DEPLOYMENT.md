# Guide de Déploiement sur VPS

Ce guide vous accompagne pour déployer le dashboard Home Assistant sur votre VPS.

## 📋 Prérequis VPS

- Ubuntu 20.04+ ou Debian 11+
- 2GB RAM minimum (4GB recommandé)
- 20GB stockage minimum
- Docker & Docker Compose installés
- Nom de domaine pointant vers votre VPS (optionnel mais recommandé)
- Accès SSH root ou sudo

## 🚀 Installation sur le VPS

### 1. Préparer le VPS

```bash
# Se connecter au VPS
ssh user@votre-vps.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y git curl wget nano ufw
```

### 2. Installer Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

### 3. Configurer le Firewall

```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow OpenSSH

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier le statut
sudo ufw status
```

### 4. Cloner le projet

```bash
# Créer le dossier des applications
mkdir -p ~/apps
cd ~/apps

# Cloner le repository
git clone <votre-repo-url> ha-dashboard
cd ha-dashboard
```

### 5. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables
nano .env
```

**Configuration production dans `.env`:**

```bash
# Environment
NODE_ENV=production

# Database
POSTGRES_USER=ha_dashboard
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=ha_dashboard

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT (générer des secrets forts)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Home Assistant
HA_URL=https://test-yuniemos.duckdns.org:8123
HA_TOKEN=votre_token_long_lived

# CORS (remplacer par votre domaine)
CORS_ORIGIN=https://votre-domaine.com

# URLs Frontend (remplacer par votre domaine)
VITE_API_URL=https://votre-domaine.com/api
VITE_WS_URL=wss://votre-domaine.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6. Configurer SSL/TLS

#### Option A: Let's Encrypt (Recommandé)

```bash
# Installer Certbot
sudo apt install -y certbot

# Arrêter temporairement les services qui utilisent le port 80
sudo systemctl stop nginx 2>/dev/null || true

# Obtenir le certificat
sudo certbot certonly --standalone -d votre-domaine.com

# Copier les certificats dans le projet
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ./nginx/ssl/
sudo chown $USER:$USER ./nginx/ssl/*.pem
chmod 600 ./nginx/ssl/*.pem
```

#### Option B: Certificats auto-signés (Développement uniquement)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out ./nginx/ssl/fullchain.pem \
  -subj "/C=FR/ST=France/L=Paris/O=MyOrg/CN=votre-domaine.com"
```

### 7. Configurer Nginx

```bash
# Éditer la configuration Nginx
nano nginx/nginx.conf

# Remplacer 'your-domain.com' par votre domaine réel
# Ligne à modifier: server_name your-domain.com;
```

### 8. Lancer l'application

```bash
# Build et démarrer avec le profil production
docker-compose --profile production up -d --build

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### 9. Vérifier le déploiement

```bash
# Tester l'API
curl https://votre-domaine.com/api/health

# Tester depuis un navigateur
# Ouvrir: https://votre-domaine.com
```

## 🔄 Mises à jour

### Déploiement de nouvelles versions

```bash
cd ~/apps/ha-dashboard

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose --profile production down
docker-compose --profile production up -d --build

# Nettoyer les images inutilisées
docker system prune -a -f
```

### Script de déploiement automatique

Créez `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement du dashboard Home Assistant..."

# Aller dans le dossier
cd ~/apps/ha-dashboard

# Sauvegarder la base de données
echo "💾 Backup de la base de données..."
docker-compose exec -T postgres pg_dump -U ha_dashboard ha_dashboard > backup_$(date +%Y%m%d_%H%M%S).sql

# Récupérer les modifications
echo "📥 Récupération des modifications..."
git pull origin main

# Rebuild
echo "🔨 Reconstruction des images..."
docker-compose --profile production build

# Redémarrer
echo "♻️  Redémarrage des services..."
docker-compose --profile production down
docker-compose --profile production up -d

# Vérifier
echo "✅ Vérification..."
sleep 5
docker-compose ps

echo "✨ Déploiement terminé !"
echo "🌐 Accès: https://votre-domaine.com"
```

Rendre le script exécutable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📊 Monitoring

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Monitoring des ressources

```bash
# Utilisation CPU/RAM par container
docker stats

# Espace disque
df -h

# Espace Docker
docker system df
```

### Health checks

```bash
# Script de monitoring
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "=== HA Dashboard Health Check ==="
echo ""

# API Health
echo "API Status:"
curl -s https://votre-domaine.com/api/health | jq '.'

# Containers status
echo -e "\nContainers:"
docker-compose ps

# Disk usage
echo -e "\nDisk Usage:"
df -h | grep -E '(Filesystem|/dev/)'

# Memory
echo -e "\nMemory:"
free -h
EOF

chmod +x monitor.sh
```

## 🔐 Sécurité

### 1. Modifier les ports SSH

```bash
sudo nano /etc/ssh/sshd_config
# Changer: Port 22 -> Port 2222
sudo systemctl restart sshd

# Mettre à jour le firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### 2. Configurer fail2ban

```bash
# Installer fail2ban
sudo apt install -y fail2ban

# Créer la config
sudo nano /etc/fail2ban/jail.local

# Ajouter:
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600

# Redémarrer
sudo systemctl restart fail2ban
```

### 3. Sauvegardes automatiques

```bash
# Créer un script de backup
cat > ~/backup-dashboard.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/ha-dashboard
mkdir -p $BACKUP_DIR

DATE=$(date +%Y%m%d_%H%M%S)

# Backup base de données
docker-compose -f ~/apps/ha-dashboard/docker-compose.yml exec -T postgres \
  pg_dump -U ha_dashboard ha_dashboard | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup fichiers de config
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
  ~/apps/ha-dashboard/.env \
  ~/apps/ha-dashboard/nginx/

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup terminé: $BACKUP_DIR"
EOF

chmod +x ~/backup-dashboard.sh

# Ajouter au crontab (tous les jours à 3h du matin)
crontab -e
# Ajouter: 0 3 * * * ~/backup-dashboard.sh >> ~/backup.log 2>&1
```

### 4. Rotation des logs

```bash
sudo nano /etc/logrotate.d/ha-dashboard

# Ajouter:
/home/user/apps/ha-dashboard/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 user user
}
```

## 🔧 Maintenance

### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

### Accéder à un container

```bash
# Backend
docker-compose exec backend sh

# PostgreSQL
docker-compose exec postgres psql -U ha_dashboard

# Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD
```

### Nettoyer Docker

```bash
# Arrêter tous les containers
docker-compose down

# Nettoyer les images inutilisées
docker system prune -a

# Nettoyer les volumes (ATTENTION: supprime les données)
docker-compose down -v
```

## 🐛 Troubleshooting Production

### Le site ne répond pas

```bash
# Vérifier les containers
docker-compose ps

# Vérifier les logs Nginx
docker-compose logs nginx

# Vérifier le firewall
sudo ufw status
```

### Erreur 502 Bad Gateway

```bash
# Backend non démarré
docker-compose restart backend

# Vérifier les logs
docker-compose logs backend
```

### Base de données corrompue

```bash
# Restaurer depuis un backup
docker-compose exec -T postgres psql -U ha_dashboard ha_dashboard < backup.sql
```

### Espace disque saturé

```bash
# Nettoyer les logs Docker
docker system prune -a --volumes

# Nettoyer les logs système
sudo journalctl --vacuum-time=3d
```

## 📈 Optimisation Performance

### 1. PostgreSQL

```bash
# Éditer postgresql.conf
docker-compose exec postgres sh
vi /var/lib/postgresql/data/postgresql.conf

# Optimisations recommandées:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
```

### 2. Redis

```bash
# Éditer redis.conf pour activer la persistance
# Ajouter dans docker-compose.yml:
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 3. Nginx

Déjà optimisé dans la config fournie:
- Gzip compression
- Cache des assets statiques
- HTTP/2
- Rate limiting

## 📞 Support

En cas de problème:
1. Consultez les logs: `docker-compose logs -f`
2. Vérifiez le status: `docker-compose ps`
3. Testez l'API: `curl https://votre-domaine.com/api/health`
4. Consultez la documentation: `ARCHITECTURE.md`

---

**Bon déploiement ! 🎉**
