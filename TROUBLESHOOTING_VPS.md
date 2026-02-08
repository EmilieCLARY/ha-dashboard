# 🔧 Guide de Dépannage VPS

## ❌ Problème : Impossible de se connecter au serveur web

### Étape 1 : Se connecter en SSH

```bash
ssh votre-user@37.60.227.46
```

Si SSH ne fonctionne pas non plus, le VPS est peut-être éteint ou inaccessible.

### Étape 2 : Vérifier l'état des services Docker

```bash
cd ~/ha-dashboard
docker-compose ps
```

**Résultat attendu** : Tous les services doivent être "Up"

Si aucun service n'est démarré :
```bash
docker-compose --profile production up -d
```

### Étape 3 : Vérifier le firewall

```bash
# Vérifier si le firewall est actif
sudo ufw status

# Si le firewall bloque les ports, les ouvrir
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp
sudo ufw reload
```

### Étape 4 : Vérifier Nginx

```bash
# Vérifier si Nginx écoute sur le port 80
sudo netstat -tlnp | grep :80

# Ou avec ss
sudo ss -tlnp | grep :80

# Vérifier les logs Nginx
docker-compose logs nginx
```

### Étape 5 : Vérifier que le backend répond

```bash
# Test depuis le VPS
curl http://localhost:4000/health

# Devrait retourner : {"status":"ok"}
```

### Étape 6 : Redémarrer tous les services

```bash
cd ~/ha-dashboard
docker-compose --profile production down
docker-compose --profile production up -d

# Attendre 10 secondes puis vérifier
sleep 10
docker-compose ps
```

### Étape 7 : Vérifier les logs pour les erreurs

```bash
# Logs de tous les services
docker-compose logs --tail=100

# Logs spécifiques
docker-compose logs nginx
docker-compose logs backend
docker-compose logs postgres
```

## 🔍 Diagnostics Rapides

### Vérifier si les conteneurs tournent

```bash
docker ps
```

### Vérifier les ports ouverts

```bash
sudo netstat -tlnp | grep -E ':(80|443|4000|5432|6379)'
```

### Vérifier l'espace disque

```bash
df -h
```

### Vérifier la mémoire

```bash
free -h
```

### Vérifier les processus Docker

```bash
docker stats --no-stream
```

## 🚨 Solutions aux problèmes courants

### Problème : Port 80 déjà utilisé

```bash
# Trouver quel processus utilise le port 80
sudo lsof -i :80

# Arrêter le processus conflictuel (par exemple Apache)
sudo systemctl stop apache2
sudo systemctl disable apache2

# Redémarrer les conteneurs
docker-compose --profile production restart
```

### Problème : Pas assez d'espace disque

```bash
# Nettoyer les images Docker inutilisées
docker system prune -a

# Nettoyer les anciens backups
cd ~/ha-dashboard/backups
ls -lht | tail -n 20  # Voir les plus anciens
# Supprimer manuellement les anciens si besoin
```

### Problème : Base de données corrompue

```bash
# Restaurer depuis un backup
cd ~/ha-dashboard
docker-compose exec -T postgres psql -U ha_dashboard ha_dashboard < backups/db_backup_YYYYMMDD_HHMMSS.sql
```

### Problème : Variables d'environnement manquantes

```bash
# Vérifier le fichier .env
cat ~/ha-dashboard/.env

# Régénérer si nécessaire
cd ~/ha-dashboard
./scripts/generate-env.sh
```

## 📊 Commandes de monitoring

### Surveiller les logs en temps réel

```bash
docker-compose logs -f
```

### Vérifier la santé du backend périodiquement

```bash
watch -n 5 'curl -s http://localhost:4000/health'
```

### Voir l'utilisation des ressources

```bash
docker stats
```

## 🔄 Redéploiement complet

Si tout échoue, redéployer depuis zéro :

```bash
cd ~/ha-dashboard

# Sauvegarder la base de données
docker-compose exec -T postgres pg_dump -U ha_dashboard ha_dashboard > backup_before_reset.sql

# Tout arrêter et nettoyer
docker-compose --profile production down -v
docker system prune -a -f

# Sauvegarder le .env
cp .env .env.backup

# Pull des dernières modifications
git pull origin main

# Restaurer le .env
cp .env.backup .env

# Reconstruire et redémarrer
docker-compose --profile production build --no-cache
docker-compose --profile production up -d

# Appliquer les migrations
docker-compose exec backend npx prisma migrate deploy
```

## 📞 Obtenir de l'aide

Si le problème persiste :

1. **Collecter les informations** :
   ```bash
   docker-compose ps > debug_info.txt
   docker-compose logs --tail=200 >> debug_info.txt
   sudo ufw status >> debug_info.txt
   df -h >> debug_info.txt
   free -h >> debug_info.txt
   ```

2. **Vérifier les GitHub Actions** :
   - Aller sur GitHub → Actions
   - Voir les logs du dernier déploiement
   - Vérifier si le deployment a réussi

3. **Vérifier les secrets GitHub** :
   - Settings → Secrets → Actions
   - Vérifier que VPS_HOST, VPS_USER, VPS_SSH_KEY sont corrects
