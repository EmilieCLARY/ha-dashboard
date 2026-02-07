# 🚀 Guide d'Installation VPS

Ce guide explique comment installer HA Dashboard sur votre VPS pour la première fois.

## 📋 Prérequis

- Un VPS avec **Ubuntu 20.04+** ou **Debian 11+**
- Accès SSH avec un utilisateur (root ou sudo)
- Au moins **2 GB RAM** et **20 GB d'espace disque**
- Une instance Home Assistant accessible

## 🎯 Installation Rapide (5 minutes)

### Étape 1: Se connecter au VPS

```bash
ssh votre-user@votre-vps-ip
```

### Étape 2: Télécharger et lancer le script d'installation

```bash
# Télécharger le script
curl -fsSL https://raw.githubusercontent.com/EmilieCLARY/ha-dashboard/main/scripts/vps-initial-setup.sh -o setup.sh

# Rendre exécutable
chmod +x setup.sh

# Lancer l'installation
./setup.sh
```

**OU** si vous avez déjà cloné le repo:

```bash
# Cloner le repository
git clone https://github.com/EmilieCLARY/ha-dashboard.git
cd ha-dashboard

# Lancer le script d'installation
./scripts/vps-initial-setup.sh
```

### Étape 3: Configurer les variables d'environnement

Le script va vous demander de configurer le fichier `.env`. Vous devez renseigner:

```bash
nano ~/ha-dashboard/.env
```

**Variables OBLIGATOIRES à modifier:**
```env
# Home Assistant
HA_URL=http://votre-home-assistant:8123
HA_TOKEN=votre_token_longue_duree_ici

# Les JWT_SECRET, POSTGRES_PASSWORD et REDIS_PASSWORD 
# sont déjà générés automatiquement !
```

Pour obtenir un token Home Assistant:
1. Allez dans Home Assistant → Profile → Long-Lived Access Tokens
2. Créez un nouveau token
3. Copiez-le dans `HA_TOKEN`

### Étape 4: Vérifier l'installation

```bash
# Vérifier les conteneurs
docker-compose ps

# Vérifier les logs
docker-compose logs -f

# Tester l'API
curl http://localhost:4000/health
```

## 🌐 Accès à l'Application

Une fois installée, l'application est accessible via:

- **Frontend**: `http://VOTRE_IP:3000`
- **Backend API**: `http://VOTRE_IP:4000`
- **Health Check**: `http://VOTRE_IP:4000/health`

## 🔐 Configuration SSH pour GitHub Actions

Pour permettre les déploiements automatiques depuis GitHub Actions:

### 1. Générer une clé SSH dédiée

```bash
# Sur votre machine locale (pas sur le VPS)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ha-dashboard-deploy -N ""
```

### 2. Ajouter la clé publique au VPS

```bash
# Copier la clé publique
cat ~/.ssh/ha-dashboard-deploy.pub

# Sur le VPS, l'ajouter aux clés autorisées
echo "VOTRE_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Tester la connexion

```bash
# Sur votre machine locale
ssh -i ~/.ssh/ha-dashboard-deploy votre-user@votre-vps-ip
```

### 4. Ajouter les secrets GitHub

Allez dans votre repo GitHub → **Settings** → **Secrets and variables** → **Actions**

Ajoutez ces secrets:

| Secret | Valeur |
|--------|--------|
| `VPS_HOST` | Votre IP VPS (ex: `192.168.1.100`) |
| `VPS_USER` | Votre nom d'utilisateur SSH |
| `VPS_SSH_KEY` | Contenu de `~/.ssh/ha-dashboard-deploy` (clé privée) |
| `VPS_APP_PATH` | `/home/votre-user/ha-dashboard` |
| `VPS_DOMAIN` | Votre IP VPS (ex: `192.168.1.100`) |

## 📦 Ce que le script installe

Le script `vps-initial-setup.sh` installe et configure:

✅ **Docker & Docker Compose**  
✅ **Clone du repository**  
✅ **Génération des secrets JWT**  
✅ **Génération des mots de passe DB et Redis**  
✅ **Configuration du firewall (UFW)**  
✅ **Démarrage des conteneurs Docker**  
✅ **Migrations de la base de données**  
✅ **Script de backup automatique quotidien**  
✅ **Configuration Git pour les déploiements**

## 🛠️ Commandes Utiles

### Gestion des conteneurs

```bash
cd ~/ha-dashboard

# Voir l'état
docker-compose ps

# Voir les logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Démarrer
docker-compose --profile production up -d
```

### Base de données

```bash
# Backup manuel
./backup-db.sh

# Voir les backups
ls -lh backups/

# Restaurer un backup
docker-compose exec -T postgres psql -U ha_dashboard ha_dashboard < backups/db_backup_YYYYMMDD_HHMMSS.sql

# Accéder à la DB
docker-compose exec postgres psql -U ha_dashboard -d ha_dashboard
```

### Migrations Prisma

```bash
# Voir le statut des migrations
docker-compose exec backend npx prisma migrate status

# Appliquer les migrations
docker-compose exec backend npx prisma migrate deploy

# Générer le client Prisma
docker-compose exec backend npx prisma generate
```

### Mise à jour manuelle

```bash
cd ~/ha-dashboard

# Récupérer les derniers changements
git pull origin main

# Rebuild et redémarrer
docker-compose --profile production up -d --build

# Appliquer les migrations
docker-compose exec backend npx prisma migrate deploy

# Vérifier la santé
curl http://localhost:4000/health
```

## 🔥 Configuration du Firewall

Le script configure automatiquement UFW:

```bash
# Vérifier le statut
sudo ufw status

# Ports ouverts:
# - 22 (SSH)
# - 80 (HTTP)
# - 443 (HTTPS)
# - 3000 (Frontend)
# - 4000 (Backend)
```

## 💾 Backups Automatiques

Le script configure un backup automatique quotidien à 2h du matin.

```bash
# Voir les backups planifiés
crontab -l

# Voir les logs de backup
tail -f ~/ha-dashboard/logs/backup.log

# Les 7 derniers backups sont conservés automatiquement
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs d'erreur
docker-compose logs

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### L'API ne répond pas

```bash
# Vérifier si le conteneur backend tourne
docker-compose ps

# Voir les logs du backend
docker-compose logs backend

# Vérifier le fichier .env
cat .env | grep -v PASSWORD | grep -v SECRET
```

### Erreur de connexion à Home Assistant

```bash
# Vérifier HA_URL et HA_TOKEN dans .env
nano .env

# Tester la connexion depuis le VPS
curl -H "Authorization: Bearer VOTRE_TOKEN" http://VOTRE_HA_URL/api/
```

### Problèmes de permissions Docker

```bash
# Ajouter votre user au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter
exit
```

## 📚 Documentation Complète

Pour plus de détails, consultez:

- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Guide de déploiement complet
- [CI_CD_SETUP.md](../docs/CI_CD_SETUP.md) - Configuration CI/CD
- [DATABASE_ACCESS.md](../docs/DATABASE_ACCESS.md) - Accès à la base de données

## 🆘 Support

En cas de problème:

1. Vérifiez les logs: `docker-compose logs -f`
2. Consultez les [Issues GitHub](https://github.com/EmilieCLARY/ha-dashboard/issues)
3. Vérifiez que tous les services tournent: `docker-compose ps`

---

**Note**: Ce guide suppose que vous utilisez un utilisateur dédié (non-root) avec des privilèges sudo. C'est la configuration recommandée pour la sécurité.
