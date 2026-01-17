# Guide d'Installation pour WSL (Windows Subsystem for Linux)

## ⚠️ Problème avec WSL

WSL a des limitations avec les symlinks npm entre Windows et Linux. Voici les solutions.

## ✅ Solution Recommandée : Utiliser Docker

```bash
# Copier le fichier .env
cp .env.example .env

# Éditer .env avec votre configuration
nano .env

# Lancer avec Docker (pas besoin d'installer les dépendances)
docker-compose up -d

# Vérifier que ça fonctionne
docker-compose ps
docker-compose logs -f
```

**Avantages :**
- ✅ Pas de problème de symlinks
- ✅ Environnement isolé et reproductible
- ✅ Toutes les dépendances gérées automatiquement

## Alternative 1 : Installation Manuelle Sans Workspace

```bash
# 1. Nettoyer
rm -rf node_modules frontend/node_modules backend/node_modules
rm -f package-lock.json frontend/package-lock.json backend/package-lock.json

# 2. Installer uniquement concurrently à la racine
npm install concurrently --save-dev

# 3. Installer frontend
cd frontend
npm install
cd ..

# 4. Installer backend
cd backend
npm install
cd ..

# 5. Lancer en dev
npm run dev
```

## Alternative 2 : Déplacer le Projet dans WSL

Le problème vient du fait que vous accédez au système de fichiers WSL depuis Windows (`\\wsl.localhost\...`).

```bash
# 1. Vérifier où vous êtes
pwd
# Si vous voyez /mnt/c/... vous êtes dans Windows

# 2. Déplacer dans le système de fichiers WSL natif
# Devrait être déjà le cas si vous êtes dans ~/Repos/ha-dashboard

# 3. Si ce n'est pas le cas, vérifiez avec :
echo $PWD

# Devrait afficher : /home/yuniemos/Repos/ha-dashboard
# Et PAS : /mnt/c/Users/...
```

## Alternative 3 : Utiliser pnpm (Plus Robuste sous WSL)

```bash
# Installer pnpm globalement
npm install -g pnpm

# Nettoyer
rm -rf node_modules frontend/node_modules backend/node_modules

# Installer avec pnpm
pnpm install
cd frontend && pnpm install
cd ../backend && pnpm install

# Utiliser pnpm au lieu de npm
pnpm run dev
```

## Alternative 4 : Développer Directement sous Windows

Si vous préférez développer sous Windows natif :

```powershell
# Dans PowerShell Windows
cd C:\Users\yunie\Repos\ha-dashboard

# Installer
npm install
cd frontend
npm install
cd ..\backend
npm install

# Lancer
npm run dev
```

## 🎯 Solution Rapide Pour Continuer

Pour l'instant, utilisez **Docker** qui évite tous ces problèmes :

```bash
# 1. Configuration
cp .env.example .env
nano .env  # Ajoutez votre HA_TOKEN

# 2. Lancer
docker-compose up -d

# 3. Accéder
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

## 📝 Note sur les Erreurs

Les warnings suivants sont normaux et sans danger :
- `deprecated inflight@1.0.6` 
- `deprecated @humanwhocodes/config-array`
- `deprecated eslint@8.57.1`

L'erreur critique est liée aux **symlinks WSL** et ne peut être résolue qu'avec les solutions ci-dessus.

## 🔧 Pour Développer en Local Plus Tard

Une fois Docker lancé, vous pouvez :

```bash
# Éditer le code
# Les modifications seront automatiquement prises en compte si vous montez les volumes

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend
```

---

**Recommandation : Utilisez Docker pour éviter les problèmes WSL ! 🐳**
