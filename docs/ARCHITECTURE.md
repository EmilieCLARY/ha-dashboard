# Architecture Dashboard Home Assistant - Vue d'ensemble

## 🏗️ Architecture Logique de Haut Niveau

### Vue Globale
```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • UI Components (Tailwind CSS)                          │  │
│  │  • State Management (Zustand/Redux)                      │  │
│  │  • Real-time Updates (WebSocket Client)                  │  │
│  │  • Data Visualization (Recharts/Chart.js)                │  │
│  │  • PWA Support (offline capabilities)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS/WSS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API BACKEND (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Layer                                                │  │
│  │  • REST API Endpoints                                     │  │
│  │  • WebSocket Server (Socket.io)                          │  │
│  │  • Authentication/Authorization (JWT)                     │  │
│  │  • Rate Limiting & Security                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Service Layer                                            │  │
│  │  • Home Assistant Integration Service                     │  │
│  │  • Data Processing & Aggregation                         │  │
│  │  • Notification Service                                   │  │
│  │  • Cache Management (Redis)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   PostgreSQL │ │  Redis   │ │ Home Assistant│
│   (Metrics   │ │  (Cache  │ │   Instance    │
│   History)   │ │  Session)│ │(duckdns.org)  │
└──────────────┘ └──────────┘ └──────────────┘
```

## 🎯 Composants Principaux

### 1. Frontend (React + Vite + Tailwind CSS)
**Responsabilités:**
- Interface utilisateur réactive et moderne
- Tableaux de bord personnalisables (drag & drop)
- Graphiques temps réel
- Gestion des alertes visuelles
- Mode sombre/clair
- Responsive design (mobile-first)

**Stack Technique:**
- **Framework:** React 18+ avec Vite (build rapide)
- **Styling:** Tailwind CSS + shadcn/ui ou Headless UI
- **State Management:** Zustand (léger) ou Redux Toolkit
- **Routing:** React Router v6
- **Graphiques:** Recharts ou Apache ECharts
- **WebSocket:** Socket.io-client
- **HTTP Client:** Axios avec intercepteurs
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React ou Heroicons

**Structure des Features:**
```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardGrid.tsx
│   │   ├── WidgetContainer.tsx
│   │   └── widgets/
│   │       ├── EntityCard.tsx
│   │       ├── TemperatureChart.tsx
│   │       ├── EnergyMonitor.tsx
│   │       └── CameraFeed.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── NavigationMenu.tsx
│   └── ui/ (composants réutilisables)
├── features/
│   ├── entities/
│   ├── automation/
│   ├── history/
│   └── settings/
├── services/
│   ├── api.service.ts
│   ├── websocket.service.ts
│   └── auth.service.ts
├── store/
│   ├── entitiesStore.ts
│   ├── dashboardStore.ts
│   └── userStore.ts
└── hooks/
    ├── useEntities.ts
    ├── useRealtime.ts
    └── useHomeAssistant.ts
```

### 2. Backend API (Node.js + Express)

**Responsabilités:**
- Proxy sécurisé vers Home Assistant
- Agrégation et transformation des données
- Authentification et autorisation
- Cache intelligent
- Gestion des événements temps réel
- Historique et analytics

**Stack Technique:**
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js ou Fastify (performance)
- **WebSocket:** Socket.io
- **ORM:** Prisma ou TypeORM
- **Validation:** Zod ou Joi
- **Authentication:** JWT + Refresh Tokens
- **Cache:** Redis
- **Database:** PostgreSQL
- **Logging:** Winston ou Pino
- **Monitoring:** Prometheus + Grafana (optionnel)

**Architecture Modulaire:**
```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── entities.routes.ts
│   │   │   ├── history.routes.ts
│   │   │   ├── automation.routes.ts
│   │   │   └── auth.routes.ts
│   │   └── controllers/
│   ├── services/
│   │   ├── homeAssistant.service.ts
│   │   ├── cache.service.ts
│   │   ├── notification.service.ts
│   │   └── analytics.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── websocket/
│   │   ├── handlers/
│   │   └── socketManager.ts
│   ├── database/
│   │   ├── models/
│   │   └── migrations/
│   └── utils/
├── config/
└── tests/
```

### 3. Home Assistant Integration

**Communication:**
- **REST API:** Pour les requêtes CRUD standard
- **WebSocket API:** Pour les événements temps réel
- **Long-Lived Access Token:** Authentification sécurisée

**Endpoints clés à exploiter:**
- `GET /api/states` - États de toutes les entités
- `GET /api/states/{entity_id}` - État d'une entité
- `POST /api/services/{domain}/{service}` - Appeler un service
- `GET /api/history/period/{timestamp}` - Historique
- `WebSocket` - Événements en temps réel (state_changed, etc.)

### 4. Base de Données (PostgreSQL)

**Tables principales:**
```sql
users (id, email, password_hash, role, created_at)
dashboard_layouts (id, user_id, config_json, is_default)
entity_history (id, entity_id, state, attributes, timestamp)
notifications (id, user_id, message, type, read, created_at)
custom_automations (id, user_id, trigger, action, enabled)
system_metrics (id, metric_name, value, timestamp)
```

### 5. Cache Layer (Redis)

**Utilisation:**
- Cache des états d'entités (TTL: 30s-60s)
- Sessions utilisateur
- Rate limiting
- Queue de notifications
- Statistiques temps réel

**Pattern de cache:**
```
ha:entities:{entity_id} → État de l'entité
ha:states:all → Liste complète (invalidation fréquente)
user:session:{token} → Session utilisateur
stats:realtime → Métriques agrégées
```

## 🔐 Sécurité

### Niveaux de Sécurité
1. **Frontend:**
   - Validation côté client (Zod)
   - XSS Protection
   - HTTPS obligatoire
   - Secure Cookie Storage

2. **Backend:**
   - JWT avec refresh tokens
   - Rate limiting (express-rate-limit)
   - CORS configuré strictement
   - Helmet.js pour headers sécurisés
   - Input validation (Zod)
   - SQL injection protection (ORM)

3. **Home Assistant:**
   - Long-Lived Access Token stocké en variable d'environnement
   - Proxy backend (jamais d'appel direct depuis frontend)
   - Validation des permissions

## 📊 Flux de Données

### Flux Temps Réel
```
Home Assistant Event
        ↓
HA WebSocket → Backend WebSocket Handler
        ↓
Data Processing & Enrichment
        ↓
Redis Cache Update
        ↓
PostgreSQL Insert (history)
        ↓
Socket.io Broadcast
        ↓
Frontend State Update
        ↓
UI Re-render (React)
```

### Flux Requête Standard
```
User Action (Frontend)
        ↓
API Call (Axios)
        ↓
Backend Route → Middleware (Auth, Validation)
        ↓
Service Layer → Check Cache (Redis)
        ↓
Cache Miss → Home Assistant API Call
        ↓
Response Processing → Update Cache
        ↓
Response to Frontend
```

## 🚀 Scalabilité & Évolutivité

### Phase 1 (MVP) - Monolithe
- Frontend + Backend sur même VPS
- PostgreSQL + Redis sur même instance
- Connexion directe à Home Assistant

### Phase 2 (Croissance)
- Séparation Frontend (CDN/Vercel) + Backend (VPS)
- Database séparée (managed service)
- Monitoring et logging centralisés

### Phase 3 (Production Large Scale)
- Multi-instances backend (load balancer)
- Redis Cluster
- PostgreSQL Replica (read/write split)
- Message Queue (RabbitMQ/Bull) pour jobs asynchrones
- Microservices (optionnel):
  - Entity Service
  - History Service
  - Notification Service
  - Analytics Service

## 🛠️ Déploiement sur VPS

### Stack Docker Compose
```yaml
services:
  frontend:
    - Nginx servant build React
    - Port 3000
  
  backend:
    - Node.js application
    - Port 4000
  
  postgres:
    - PostgreSQL 16
    - Volume persistant
  
  redis:
    - Redis 7
    - Cache ephemeral
  
  nginx:
    - Reverse proxy
    - SSL/TLS (Let's Encrypt)
    - Port 80/443
```

### CI/CD
- GitHub Actions
- Tests automatisés
- Build & Deploy sur VPS
- Rolling updates (zero downtime)

## 📱 Features Avancées (Évolutivité)

1. **Dashboards personnalisables**
   - Drag & drop widgets
   - Templates de dashboard
   - Export/Import configuration

2. **Alertes intelligentes**
   - Règles personnalisées
   - Multi-canal (email, push, SMS)
   - Historique des alertes

3. **Analytics avancés**
   - Consommation énergétique
   - Patterns de température
   - Prédictions ML (optionnel)

4. **Mobile App**
   - PWA avec capacités offline
   - Notifications push natives
   - Géolocalisation

5. **Automations visuelles**
   - Node-RED like interface
   - Testable en sandbox
   - Version control

6. **Multi-utilisateurs**
   - Rôles et permissions
   - Dashboards partagés
   - Audit logs

## 🔧 Technologies Recommandées

### Must-Have
- TypeScript (frontend + backend)
- ESLint + Prettier
- Jest + React Testing Library
- Docker & Docker Compose
- Git hooks (Husky)

### Nice-to-Have
- Storybook (composants UI)
- Sentry (error tracking)
- Plausible/Umami (analytics privacy-first)
- Swagger/OpenAPI (documentation API)

## 📈 Métriques de Succès

- **Performance:** Time to Interactive < 2s
- **Réactivité:** WebSocket latency < 100ms
- **Disponibilité:** Uptime > 99.5%
- **Cache Hit Rate:** > 80%
- **API Response Time:** P95 < 500ms

---

## 🎯 Next Steps

1. Setup initial project structure
2. Configure Tailwind CSS + shadcn/ui
3. Implement Home Assistant WebSocket connection
4. Build first dashboard widgets
5. Setup backend API with caching
6. Implement authentication
7. Deploy on VPS with Docker
