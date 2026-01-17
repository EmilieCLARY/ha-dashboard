# TODO - Roadmap de Développement

## 🎯 Phase 1: MVP (Minimum Viable Product)

### Infrastructure ✅
- [x] Architecture globale définie
- [x] Configuration Docker Compose
- [x] Configuration Nginx reverse proxy
- [x] Structure projet frontend (React + Vite + Tailwind)
- [x] Structure projet backend (Node.js + Express)
- [x] Configuration Prisma + PostgreSQL
- [x] Configuration Redis
- [x] Documentation complète (ARCHITECTURE.md, QUICKSTART.md, DEPLOYMENT.md)
- [x] Containers Docker opérationnels (frontend, backend, postgres, redis)
- [x] Application accessible sur http://localhost:3000

### Backend Core
- [x] Connexion à Home Assistant REST API
  - [x] Service de connexion HA
  - [x] Gestion du token long-lived
  - [x] Récupération des états d'entités
  - [x] Appel des services HA
- [x] Connexion WebSocket Home Assistant
  - [x] Subscribe aux événements
  - [x] Gestion de la reconnexion automatique
  - [x] Broadcast aux clients via Socket.io
- [x] Système d'authentification
  - [x] Inscription/Connexion utilisateur (code créé)
  - [x] JWT + Refresh tokens (code créé)
  - [x] Middleware d'authentification (code créé)
  - [x] Gestion des sessions (Redis) (code créé)
- [x] API Routes
  - [x] GET /api/entities - Liste toutes les entités
  - [x] GET /api/entities/:id - Détails d'une entité
  - [x] POST /api/services/:domain/:service - Appeler un service
  - [x] GET /api/entities/:id/history - Historique d'une entité
  - [x] POST /api/auth/register - Inscription
  - [x] POST /api/auth/login - Connexion
  - [x] POST /api/auth/refresh - Refresh token
  - [x] POST /api/auth/logout - Déconnexion
  - [x] GET /api/auth/me - Info utilisateur
- [x] Cache Layer (Redis)
  - [x] Cache des états d'entités
  - [x] Invalidation intelligente du cache
  - [x] TTL configurables
  - [x] Sessions Redis

### Frontend Core
- [x] Pages principales
  - [x] Page de connexion/inscription
  - [x] Dashboard principal
  - [x] Page historique
  - [x] Page paramètres
- [x] Composants de base
  - [x] Layout responsive
  - [x] Navigation sidebar (mobile + desktop)
  - [x] Header avec user menu & logout
  - [x] Composants UI (Button, Card, Modal, Input, Spinner, Badge)
- [x] Intégration WebSocket
  - [x] Connexion Socket.io
  - [x] Gestion des événements temps réel
  - [x] Mise à jour automatique UI
- [x] State Management (Zustand)
  - [x] Store entités
  - [x] Store utilisateur (auth)
  - [x] Store dashboard
- [x] Services
  - [x] API Service (Axios)
  - [x] WebSocket Service
  - [x] Auth Service

### Widgets Dashboard ✅ COMPLET
- [x] Widget Température
  - [x] Affichage valeur actuelle
  - [x] Historique 24h (graphique)
  - [x] Page de détail avec graphique complet (1h, 6h, 24h, 7j, 30j)
  - [x] Statistiques (min, max, moyenne)
- [x] Widget Humidité
  - [x] Affichage valeur actuelle
  - [x] Page de détail avec graphique complet
- [x] Widget Batteries (avec barre de progression)
  - [x] Affichage valeur actuelle
  - [x] Page de détail avec graphique complet
- [x] Widget Lumière (on/off)
  - [x] Affichage état (Allumée/Éteinte)
  - [x] Bouton toggle on/off
  - [x] Affichage luminosité (si disponible)
  - [x] Page de détail avec graphique
- [x] Widget Consommation énergétique
  - [x] Affichage valeur en W/kW
  - [x] Barre de progression
  - [x] Estimation coût (€/h)
  - [x] Page de détail avec graphique
- [x] Widget Météo
  - [x] Affichage température
  - [x] Icônes selon condition météo
  - [x] Humidité, vent, pression
  - [x] Prévisions (3 jours)
  - [x] Page de détail
- [x] Widget État système HA
  - [x] Statut connexion (API, WebSocket)
  - [x] Nombre d'entités chargées
  - [x] Utilisation CPU/Mémoire/Disque (si disponible)
  - [x] Barres de progression par ressource

### Monitoring Système ✅ COMPLET
- [x] Page dédiée System Monitor
  - [x] Route `/system` avec navigation sidebar
  - [x] Auto-détection et catégorisation des capteurs:
    - [x] Processeur (CPU) - entity_id contient 'cpu', 'processor'
    - [x] Mémoire (RAM) - entity_id contient 'memory', 'ram'
    - [x] Disques (Storage) - entity_id contient 'disk', 'storage'
    - [x] Réseau (Network) - entity_id contient 'network', 'eth', 'wlan', 'bytes'
    - [x] Températures système - device_class='temperature' + system/cpu/core
    - [x] Autres capteurs système
  - [x] Vue d'ensemble SystemStatusWidget
  - [x] Cartes de capteurs interactives:
    - [x] Couleurs dynamiques selon valeurs et types
    - [x] Barres de progression pour % et températures
    - [x] Timestamps de dernière mise à jour
    - [x] Navigation vers page de détail
  - [x] Responsive design (2/3/4 colonnes)
  - [x] État par défaut avec lien documentation HA
  - [x] Documentation complète (SYSTEM_MONITOR_PAGE.md)

### Pages & Navigation
- [x] Page de détail d'entité
  - [x] Graphique d'historique avec Recharts
  - [x] Sélecteur de période (1h, 6h, 24h, 7j, 30j)
  - [x] Cartes de statistiques (min, max, moyenne, actuel)
  - [x] Informations de l'entité
  - [x] Navigation depuis les widgets
  - [x] Bouton retour vers dashboard

### Tests & Qualité
- [x] Configuration tests frontend (Vitest)
  - [x] Vitest + React Testing Library
  - [x] Configuration vitest.config.ts
  - [x] Setup files (mocks, matchers)
  - [x] Scripts npm (test, test:ui, test:coverage)
  - [x] Tests de base (Button, ApiService)
  - [x] Documentation complète (TESTING_FRONTEND.md)
- [x] Configuration tests backend (Jest)
  - [x] Jest + Supertest + ts-jest
  - [x] Configuration jest.config.js
  - [x] Setup files
  - [x] Scripts npm (test, test:watch, test:coverage)
  - [x] Test de base (health endpoint)
  - [x] Documentation complète (TESTING_BACKEND.md)
- [x] Tests unitaires de base (87 tests créés) ✅
  - [x] Frontend: Button component (10 tests)
  - [x] Frontend: TemperatureWidget (12 tests)
  - [x] Frontend: LightWidget (17 tests)
  - [x] Frontend: EnergyWidget (18 tests)
  - [x] Frontend: entities.store (10 tests)
  - [x] Backend: Health endpoint (2 tests)
  - [x] Backend: Auth routes (18 tests)
- [ ] Tests unitaires complets (restants ~193 tests)
  - [ ] Frontend: 4 widgets restants (Humidity, Battery, Weather, SystemStatus)
  - [ ] Frontend: 4 pages (Dashboard, SystemMonitor, EntityDetail, Login)
  - [ ] Frontend: 4 composants UI (Card, Modal, Input, Spinner)
  - [ ] Frontend: Services complets (API HTTP, WebSocket)
  - [ ] Frontend: auth.store
  - [ ] Backend: Services (HA, Auth, Cache)
  - [ ] Backend: Routes restantes (Entities, Services)
  - [ ] Backend: Middleware (Auth, Error)
- [ ] Tests d'intégration API
  - [ ] User flow complet
  - [ ] WebSocket events
  - [ ] Error handling
- [ ] ESLint + Prettier configurés
  - [x] ESLint configuré
  - [x] Prettier configuré
  - [ ] Pre-commit hooks (Husky)
- [ ] CI/CD GitHub Actions
  - [ ] Tests automatiques
  - [ ] Build automatique
  - [ ] Déploiement automatique

### Documentation
- [ ] README avec screenshots
- [ ] Guide de contribution
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Exemples de widgets personnalisés

---

## 🚀 Phase 2: Features Avancées

### Dashboard Personnalisable
- [ ] Drag & drop widgets (react-grid-layout)
- [ ] Configuration par utilisateur
- [ ] Templates de dashboard
- [ ] Export/Import configuration JSON
- [ ] Multi-dashboards par utilisateur

### Analytics & Historique
- [ ] Graphiques historiques avancés (Apache ECharts)
  - [ ] Période personnalisable (1h, 24h, 7j, 30j)
  - [ ] Comparaison de plusieurs entités
  - [ ] Export en CSV/PDF
- [ ] Statistiques agrégées
  - [ ] Consommation moyenne
  - [ ] Min/Max sur période
  - [ ] Tendances
- [ ] Stockage optimisé historique
  - [ ] Agrégation par périodes
  - [ ] Compression des données anciennes
  - [ ] Archivage automatique

### Notifications & Alertes
- [ ] Système de notifications
  - [ ] Push notifications (PWA)
  - [ ] Email notifications
  - [ ] Notifications dans l'app
- [ ] Règles d'alertes personnalisées
  - [ ] Seuils configurables
  - [ ] Conditions complexes (AND/OR)
  - [ ] Planification (horaires actifs)
- [ ] Historique des alertes
- [ ] Gestion des canaux de notification

### Automations Personnalisées
- [ ] Interface de création d'automations
  - [ ] Éditeur visuel (node-based)
  - [ ] Triggers multiples
  - [ ] Conditions
  - [ ] Actions multiples
- [ ] Templates d'automations
- [ ] Test/Debug des automations
- [ ] Logs d'exécution
- [ ] Version control des automations

### Multi-utilisateurs & Permissions
- [ ] Système de rôles
  - [ ] Admin
  - [ ] Utilisateur standard
  - [ ] Lecture seule
- [ ] Permissions granulaires
  - [ ] Accès par entité
  - [ ] Accès par dashboard
  - [ ] Accès aux automations
- [ ] Gestion des utilisateurs (admin)
- [ ] Invitations par email
- [ ] Audit logs

### Mobile & PWA
- [ ] Progressive Web App complète
  - [ ] Manifest configuré
  - [ ] Service Worker
  - [ ] Offline mode
  - [ ] App installable
- [ ] Interface mobile optimisée
  - [ ] Navigation mobile friendly
  - [ ] Swipe gestures
  - [ ] Bottom navigation
- [ ] Notifications push natives
- [ ] Géolocalisation (automations)
- [ ] Mode sombre automatique

---

## 🌟 Phase 3: Optimisation & Scale

### Performance
- [ ] Code splitting frontend
- [ ] Lazy loading des composants
- [ ] Memoization React
- [ ] Virtual scrolling pour grandes listes
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Server-side rendering (SSR) optionnel

### Backend Scale
- [ ] Rate limiting avancé
- [ ] Load balancing
- [ ] Multi-instances backend
- [ ] Message queue (Bull/RabbitMQ)
  - [ ] Jobs asynchrones
  - [ ] Retry logic
  - [ ] Job scheduling
- [ ] Database optimization
  - [ ] Index optimisés
  - [ ] Query optimization
  - [ ] Read replicas
- [ ] Redis Cluster
- [ ] Monitoring & Observability
  - [ ] Prometheus metrics
  - [ ] Grafana dashboards
  - [ ] Logs centralisés (ELK/Loki)
  - [ ] APM (Application Performance Monitoring)

### Sécurité Avancée
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] API Keys pour intégrations externes
- [ ] Rotation automatique des tokens
- [ ] Security headers complets
- [ ] Content Security Policy (CSP)
- [ ] Penetration testing
- [ ] Vulnerability scanning (Dependabot)
- [ ] Rate limiting par utilisateur
- [ ] Captcha sur login

### DevOps & Deployment
- [ ] CI/CD complet
  - [ ] Tests automatiques
  - [ ] Build automatique
  - [ ] Deploy automatique (staging)
  - [ ] Deploy production (manuel approval)
- [ ] Infrastructure as Code
  - [ ] Terraform/Pulumi
  - [ ] Ansible playbooks
- [ ] Kubernetes deployment (optionnel)
  - [ ] Helm charts
  - [ ] Auto-scaling
  - [ ] Rolling updates
- [ ] Backup automatique
  - [ ] Base de données
  - [ ] Configurations
  - [ ] Restauration testée
- [ ] Disaster recovery plan
- [ ] Blue/Green deployment

---

## 💡 Phase 4: Features Innovantes

### Intelligence Artificielle
- [ ] Prédictions ML
  - [ ] Prédiction consommation énergétique
  - [ ] Prédiction température
  - [ ] Anomaly detection
- [ ] Recommandations intelligentes
  - [ ] Suggestions d'automations
  - [ ] Optimisations énergétiques
- [ ] Natural Language Processing
  - [ ] Commandes vocales
  - [ ] Recherche en langage naturel

### Intégrations
- [ ] API publique documentée
- [ ] Webhooks
- [ ] Intégration IFTTT
- [ ] Intégration Google Home/Alexa
- [ ] Intégration Telegram/Discord
- [ ] Export vers InfluxDB/TimescaleDB

### Visualisation Avancée
- [ ] Graphiques 3D
- [ ] Cartes thermiques
- [ ] Plans 3D de la maison
- [ ] Réalité augmentée (AR)
- [ ] Timelines interactives

### Collaboration
- [ ] Dashboards partagés (read-only links)
- [ ] Commentaires sur entités
- [ ] Notes collaboratives
- [ ] Export de rapports automatiques

### Marketplace
- [ ] Store de widgets communautaires
- [ ] Store de templates dashboard
- [ ] Store d'automations
- [ ] Rating & reviews
- [ ] Installation en 1 clic

---

## 🐛 Bugs Connus & À Corriger

### High Priority
- [ ] TBD après tests

### Medium Priority
- [ ] TBD après tests

### Low Priority
- [ ] TBD après tests

---

## 📝 Notes

### Décisions Techniques
- **State Management**: Zustand choisi pour sa simplicité vs Redux
- **Styling**: Tailwind CSS pour la rapidité de développement
- **Database**: PostgreSQL pour la fiabilité et les features avancées
- **Cache**: Redis pour la performance et la flexibilité
- **WebSocket**: Socket.io pour la compatibilité multi-plateforme

### Dépendances à Surveiller
- React 19 (quand stable)
- Prisma 6 (quand disponible)
- Vite 6 (évolution continue)

### Optimisations Futures
- Passage à pnpm pour la gestion des packages
- Migration vers Bun (si production-ready)
- Utilisation de Turbopack (quand stable avec Vite)

---

**Dernière mise à jour**: 2026-01-17
