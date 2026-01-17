# Guide de Démarrage Rapide

Ce guide vous permettra de lancer rapidement le dashboard Home Assistant.

## 🎯 Objectif

Créer un dashboard personnalisé pour monitorer votre instance Home Assistant accessible sur `https://test-yuniemos.duckdns.org:8123`.

## 📋 Étapes de Configuration

> **⚠️ Utilisateurs WSL (Windows)** : Si vous rencontrez des erreurs d'installation, consultez [WSL-INSTALL.md](./WSL-INSTALL.md) pour les solutions spécifiques.

### 1. Préparer votre environnement

```bash
# Cloner le repository
cd ~/Repos/ha-dashboard

# Option A: Avec Docker (RECOMMANDÉ pour WSL)
# Pas besoin d'installer les dépendances npm
cp .env.example .env

# Option B: Installation locale (si pas de problème WSL)
npm install
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env
```

**Éditez le fichier `.env` et configurez:**

```bash
# Home Assistant
HA_URL=https://test-yuniemos.duckdns.org:8123
HA_TOKEN=votre_token_long_lived_access_token_ici

# Base de données
POSTGRES_USER=ha_dashboard
POSTGRES_PASSWORD=un_mot_de_passe_securise
POSTGRES_DB=ha_dashboard

# Redis
REDIS_PASSWORD=un_autre_mot_de_passe_securise

# JWT (générer des secrets aléatoires)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# URLs
CORS_ORIGIN=http://localhost:3000
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

### 3. Obtenir le Token Home Assistant

1. Ouvrez votre Home Assistant: https://test-yuniemos.duckdns.org:8123
2. Cliquez sur votre profil utilisateur (en bas à gauche)
3. Scrollez jusqu'à "Long-Lived Access Tokens"
4. Cliquez sur "Create Token"
5. Donnez un nom: `Dashboard Monitoring`
6. Copiez le token et collez-le dans `.env` comme `HA_TOKEN`

### 4. Lancer avec Docker (Recommandé)

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

**Services lancés:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Backend API: `localhost:4000`
- Frontend: `localhost:3000`

### 5. Lancer en mode développement local

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 6. Accéder à l'application

Ouvrez votre navigateur à: http://localhost:3000

## 🔍 Vérification de l'installation

### Tester la connexion Home Assistant

```bash
# Remplacez YOUR_TOKEN par votre token
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  https://test-yuniemos.duckdns.org:8123/api/
```

Vous devriez recevoir: `{"message": "API running."}`

### Tester le backend

```bash
curl http://localhost:4000/health
```

Devrait retourner: `{"status":"ok","timestamp":"..."}`

### Tester le frontend

Visitez: http://localhost:3000

Vous devriez voir la page de connexion du dashboard.

## 🚀 Prochaines Étapes

### Phase 1: Configuration de base
1. [ ] Installer les dépendances frontend et backend
2. [ ] Configurer les variables d'environnement
3. [ ] Tester la connexion à Home Assistant
4. [ ] Lancer l'application

### Phase 2: Développement
1. [ ] Implémenter la connexion WebSocket à Home Assistant
2. [ ] Afficher les entités en temps réel
3. [ ] Créer les widgets personnalisés
4. [ ] Implémenter l'authentification

### Phase 3: Déploiement sur VPS
1. [ ] Configurer le reverse proxy (Nginx)
2. [ ] Configurer SSL/TLS (Let's Encrypt)
3. [ ] Déployer avec Docker Compose
4. [ ] Configurer le monitoring

## 📦 Commandes Docker Utiles

```bash
# Arrêter tous les services
docker-compose down

# Rebuild les images
docker-compose build

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Entrer dans un container
docker-compose exec backend sh
docker-compose exec postgres psql -U ha_dashboard

# Nettoyer les volumes
docker-compose down -v
```

## 🔧 Commandes de Développement

```bash
# Frontend
cd frontend
npm run dev        # Mode développement
npm run build      # Build production
npm run preview    # Preview du build

# Backend
cd backend
npm run dev        # Mode développement avec hot reload
npm run build      # Build TypeScript
npm start          # Démarrer en production

# Database
cd backend
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer/appliquer migrations
npm run prisma:studio    # Interface visuelle de la DB
```

## 🛠️ Structure de Développement

### Ajouter un nouveau widget

1. Créer le composant:
```bash
touch frontend/src/components/widgets/TemperatureWidget.tsx
```

2. Ajouter au dashboard:
```typescript
// Dans frontend/src/pages/Dashboard.tsx
import { TemperatureWidget } from '@/components/widgets/TemperatureWidget';

// Dans le JSX
<TemperatureWidget entityId="sensor.temperature_salon" />
```

### Ajouter une nouvelle route API

1. Créer la route:
```bash
touch backend/src/api/routes/entities.routes.ts
```

2. Créer le service:
```bash
touch backend/src/services/homeAssistant.service.ts
```

3. Enregistrer la route:
```typescript
// Dans backend/src/api/routes/index.ts
import { entitiesRoutes } from './entities.routes.js';
apiRoutes.use('/entities', entitiesRoutes);
```

## 🐛 Dépannage Courant

### Erreur: Cannot connect to Home Assistant

**Solution:**
1. Vérifiez que l'URL est correcte dans `.env`
2. Vérifiez que le token est valide
3. Testez l'URL avec curl (voir section Vérification)

### Erreur: Port already in use

**Solution:**
```bash
# Trouver le processus qui utilise le port
sudo lsof -i :4000
sudo lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur: Database connection failed

**Solution:**
1. Vérifiez que PostgreSQL est démarré: `docker-compose ps`
2. Vérifiez les credentials dans `.env`
3. Redémarrez les services: `docker-compose restart`

### Les modifications frontend ne se rechargent pas

**Solution:**
```bash
# Nettoyer le cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## 📚 Ressources

- [Documentation Architecture](./ARCHITECTURE.md)
- [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest)
- [Home Assistant WebSocket API](https://developers.home-assistant.io/docs/api/websocket)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## 💡 Conseils

1. **Commencez simple**: Affichez d'abord une entité, puis ajoutez des fonctionnalités
2. **Utilisez les logs**: `docker-compose logs -f` est votre ami
3. **Testez l'API**: Utilisez Postman ou curl pour tester le backend
4. **Mode sombre**: Implémenté par défaut avec Tailwind
5. **Hot Reload**: Le frontend et backend se rechargent automatiquement

## 🎨 Personnalisation

### Modifier les couleurs Tailwind

Éditez `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(222.2 47.4% 11.2%)',
        // Vos couleurs personnalisées
      }
    }
  }
}
```

### Changer le layout

Modifiez `frontend/src/components/layout/Layout.tsx` pour personnaliser la disposition.

---

**Bon développement ! 🚀**

En cas de problème, consultez la section Dépannage ou ouvrez une issue sur le repository.
