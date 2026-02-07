# 🎯 Quick Reference - HA Dashboard VPS

## 📁 Chemins
- **Projet**: `~/ha-dashboard`
- **Config**: `~/ha-dashboard/.env`
- **Backups**: `~/ha-dashboard/backups/`
- **Logs**: `~/ha-dashboard/logs/`

## 🌐 Accès
- **Frontend**: http://VOTRE_IP:3000
- **Backend**: http://VOTRE_IP:4000
- **Health**: http://VOTRE_IP:4000/health

## 🛠️ Commandes Essentielles

```bash
cd ~/ha-dashboard

# État des services
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Redémarrer
docker-compose restart

# Mise à jour
git pull && docker-compose --profile production up -d --build

# Backup DB
./backup-db.sh

# Migrations
docker-compose exec backend npx prisma migrate deploy
```

## 🔍 Dépannage

```bash
# Logs détaillés
docker-compose logs backend
docker-compose logs frontend

# Santé de l'API
curl http://localhost:4000/health

# Redémarrage complet
docker-compose down && docker-compose --profile production up -d
```

## 📚 Documentation complète
→ https://github.com/EmilieCLARY/ha-dashboard/blob/main/docs/VPS_SETUP.md
