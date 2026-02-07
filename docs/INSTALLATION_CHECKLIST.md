# 🚀 Installation VPS - Checklist

Utilisez cette checklist pour installer HA Dashboard sur votre VPS.

## ✅ Avant de commencer

- [ ] J'ai un VPS avec Ubuntu 20.04+ ou Debian 11+
- [ ] J'ai accès SSH au VPS
- [ ] J'ai au moins 2 GB RAM et 20 GB d'espace disque
- [ ] J'ai une instance Home Assistant accessible
- [ ] J'ai un token d'accès longue durée Home Assistant

## 📋 Étapes d'Installation

### 1️⃣ Connexion au VPS

```bash
ssh votre-user@votre-vps-ip
```

- [ ] Je suis connecté au VPS

### 2️⃣ Installation automatique

```bash
# Télécharger le script
curl -fsSL https://raw.githubusercontent.com/EmilieCLARY/ha-dashboard/main/scripts/vps-initial-setup.sh -o setup.sh

# Rendre exécutable
chmod +x setup.sh

# Lancer l'installation
./setup.sh
```

- [ ] Script téléchargé
- [ ] Script lancé avec succès

### 3️⃣ Configuration du .env

Le script va vous demander d'éditer le fichier `.env`:

```bash
nano ~/ha-dashboard/.env
```

**Modifiez ces variables:**
```env
HA_URL=http://votre-home-assistant:8123
HA_TOKEN=votre_token_longue_duree
```

- [ ] HA_URL configuré
- [ ] HA_TOKEN configuré
- [ ] Fichier .env sauvegardé (Ctrl+O, Entrée, Ctrl+X)

### 4️⃣ Vérification

```bash
cd ~/ha-dashboard

# Vérifier les conteneurs
docker-compose ps

# Vérifier les logs
docker-compose logs -f

# Tester l'API
curl http://localhost:4000/health
```

- [ ] Tous les conteneurs sont "Up"
- [ ] Aucune erreur dans les logs
- [ ] L'API répond avec `{"status":"ok"}`

### 5️⃣ Accès à l'application

Ouvrez dans votre navigateur:
- **Frontend**: `http://VOTRE_IP:3000`
- **Backend**: `http://VOTRE_IP:4000/health`

- [ ] Le frontend s'affiche correctement
- [ ] Le backend répond

## 🔐 Configuration GitHub Actions (Optionnel)

Si vous voulez les déploiements automatiques:

### 1️⃣ Générer une clé SSH

**Sur votre machine locale** (pas sur le VPS):

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ha-dashboard-deploy -N ""
cat ~/.ssh/ha-dashboard-deploy.pub
```

- [ ] Clé SSH générée
- [ ] Clé publique copiée

### 2️⃣ Ajouter la clé au VPS

**Sur le VPS**:

```bash
echo "VOTRE_CLE_PUBLIQUE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

- [ ] Clé publique ajoutée au VPS

### 3️⃣ Tester la connexion

**Sur votre machine locale**:

```bash
ssh -i ~/.ssh/ha-dashboard-deploy votre-user@votre-vps-ip
```

- [ ] Connexion SSH fonctionne avec la nouvelle clé

### 4️⃣ Configurer GitHub Secrets

Allez sur GitHub: **Settings** → **Secrets and variables** → **Actions**

Ajoutez ces secrets:

- [ ] `VPS_HOST` = Votre IP VPS
- [ ] `VPS_USER` = Votre nom d'utilisateur SSH
- [ ] `VPS_SSH_KEY` = Contenu de `~/.ssh/ha-dashboard-deploy` (clé privée entière)
- [ ] `VPS_APP_PATH` = `/home/votre-user/ha-dashboard`
- [ ] `VPS_DOMAIN` = Votre IP VPS

### 5️⃣ Tester le déploiement automatique

```bash
# Faire un commit et push sur main
git add .
git commit -m "Test deployment"
git push origin main
```

- [ ] GitHub Action s'exécute
- [ ] Déploiement réussi
- [ ] Application mise à jour

## 🎉 Installation Terminée !

Votre application est maintenant:
- ✅ Installée sur votre VPS
- ✅ Accessible via HTTP
- ✅ Configurée avec des backups automatiques quotidiens
- ✅ Prête pour les déploiements automatiques (si configuré)

## 📚 Prochaines étapes

- [ ] Configurer un certificat SSL (HTTPS) avec Let's Encrypt
- [ ] Configurer un nom de domaine (optionnel)
- [ ] Personnaliser les widgets du dashboard
- [ ] Inviter d'autres utilisateurs

## 🛠️ Commandes utiles

```bash
cd ~/ha-dashboard

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Backup manuel
./backup-db.sh

# Mise à jour manuelle
git pull && docker-compose --profile production up -d --build
```

## 📖 Documentation

- **[VPS_SETUP.md](./VPS_SETUP.md)** - Guide détaillé
- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Déploiement GitHub Actions
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - Référence rapide

## 🆘 Problèmes ?

Consultez:
1. [VPS_SETUP.md - Section Dépannage](./VPS_SETUP.md#-dépannage)
2. Les logs: `docker-compose logs -f`
3. [GitHub Issues](https://github.com/EmilieCLARY/ha-dashboard/issues)

---

**Bon déploiement ! 🚀**
