# 🏠 Home Assistant Dashboard

Dashboard de monitoring personnalisé pour Home Assistant avec React, Node.js, PostgreSQL et Redis. 🚀

## ✨ Fonctionnalités

- 🔐 Authentification JWT sécurisée
- 📊 7 widgets temps réel (température, humidité, batterie, lumière, énergie, météo, système)
- 📈 Graphiques d'historique interactifs
- 🔄 WebSocket pour mises à jour en temps réel
- 🎨 Interface moderne avec Tailwind CSS
- 🐳 Déploiement Docker complet
- 🧪 Tests unitaires et d'intégration

## 🚀 Démarrage Rapide

```bash
# Cloner le projet
git clone <repo-url>
cd ha-dashboard

# Générer .env avec JWT secrets sécurisés
./scripts/generate-env.sh

# OU manuellement:
cp .env.example .env
# Éditer .env avec vos credentials:
# - HA_URL (votre URL Home Assistant)
# - HA_TOKEN (token d'accès Home Assistant)
# - JWT_SECRET et JWT_REFRESH_SECRET (voir ci-dessous)
# - POSTGRES_PASSWORD et REDIS_PASSWORD

# Générer des JWT secrets sécurisés:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Lancer avec Docker
docker-compose up -d

# Ou en développement
npm run dev
```

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:4000

### 🔐 Configuration Requise

**Variables essentielles dans `.env`:**
- `HA_URL` - URL de votre Home Assistant
- `HA_TOKEN` - Token d'accès longue durée
- `JWT_SECRET` - Clé secrète 64 caractères (hex)
- `JWT_REFRESH_SECRET` - Clé secrète 64 caractères (hex)
- `POSTGRES_PASSWORD` - Mot de passe DB
- `REDIS_PASSWORD` - Mot de passe Redis

## 📚 Documentation

**→ [Documentation complète dans `docs/`](./docs/README.md)**

| Document | Description |
|----------|-------------|
| [QUICKSTART](./docs/QUICKSTART.md) | Guide de démarrage rapide |
| [VPS_SETUP](./docs/VPS_SETUP.md) | **🚀 Installation VPS complète** |
| [DEPLOYMENT_GUIDE](./DEPLOYMENT_GUIDE.md) | Déploiement & GitHub Actions |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Architecture technique |
| [API](./docs/API.md) | Documentation API REST |
| [TESTING](./docs/TESTING.md) | Guide des tests |

## 🛠️ Stack Technique

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand  
**Backend**: Node.js + Express + TypeScript  
**Database**: PostgreSQL + Prisma ORM  
**Cache**: Redis  
**Tests**: Vitest + Jest + React Testing Library  
**DevOps**: Docker + Docker Compose + GitHub Actions

## 📊 État du Projet

✅ **Phase 1 - MVP**: Complété  
🔄 **Phase 2 - Features Avancées**: En cours

Voir [TODO.md](./TODO.md) pour la roadmap complète.

## 🤝 Contribution

Consultez [CONTRIBUTING.md](./docs/CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

MIT License

---

**Dernière mise à jour**: 18 janvier 2026
