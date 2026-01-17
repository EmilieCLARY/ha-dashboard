# 🏠 Home Assistant Dashboard

Dashboard de monitoring personnalisé pour Home Assistant avec React, Node.js, PostgreSQL et Redis.

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

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials Home Assistant

# Lancer avec Docker
docker-compose up -d

# Ou en développement
npm run dev
```

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:4000

## 📚 Documentation

**→ [Documentation complète dans `docs/`](./docs/README.md)**

| Document | Description |
|----------|-------------|
| [QUICKSTART](./docs/QUICKSTART.md) | Guide de démarrage rapide |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Architecture technique |
| [API](./docs/API.md) | Documentation API REST |
| [TESTING](./docs/TESTING.md) | Guide des tests |
| [DEPLOYMENT](./docs/DEPLOYMENT.md) | Déploiement production |

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
