# Diagrammes d'Architecture

Ce fichier contient les diagrammes de l'architecture du système.

## Architecture Globale

```mermaid
graph TB
    subgraph "Client"
        Browser[Navigateur Web]
        Mobile[Application Mobile/PWA]
    end

    subgraph "VPS - Frontend"
        Nginx[Nginx Reverse Proxy<br/>SSL/TLS]
        Frontend[React Application<br/>Vite + Tailwind CSS]
    end

    subgraph "VPS - Backend"
        API[Node.js API<br/>Express]
        WS[WebSocket Server<br/>Socket.io]
    end

    subgraph "VPS - Data Layer"
        Redis[(Redis Cache<br/>Session & Cache)]
        PostgreSQL[(PostgreSQL<br/>Metrics & Users)]
    end

    subgraph "External"
        HA[Home Assistant<br/>test-yuniemos.duckdns.org:8123]
    end

    Browser --> Nginx
    Mobile --> Nginx
    Nginx --> Frontend
    Nginx --> API
    Nginx --> WS
    
    Frontend --> API
    Frontend --> WS
    
    API --> Redis
    API --> PostgreSQL
    API --> HA
    
    WS --> Redis
    WS --> HA
    
    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style Nginx fill:#b3e5fc
    style Frontend fill:#81d4fa
    style API fill:#4fc3f7
    style WS fill:#29b6f6
    style Redis fill:#ff9800
    style PostgreSQL fill:#4caf50
    style HA fill:#f44336
```

## Flux de Données Temps Réel

```mermaid
sequenceDiagram
    participant HA as Home Assistant
    participant WS as Backend WebSocket
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant Client as Frontend

    HA->>WS: État changé (event)
    WS->>WS: Traitement & Enrichissement
    
    par Mise à jour Cache
        WS->>Redis: UPDATE cache
    and Sauvegarde Historique
        WS->>DB: INSERT history
    end
    
    WS->>Client: Broadcast event (Socket.io)
    Client->>Client: Update UI (React State)
    
    Note over Client: Affichage temps réel<br/>sans rechargement
```

## Architecture Backend en Couches

```mermaid
graph LR
    subgraph "API Layer"
        Routes[Routes<br/>Express Router]
        Middleware[Middleware<br/>Auth, Validation, Rate Limit]
    end

    subgraph "Service Layer"
        HAService[Home Assistant<br/>Service]
        CacheService[Cache<br/>Service]
        NotifService[Notification<br/>Service]
        AuthService[Auth<br/>Service]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        RedisClient[Redis Client]
        HAClient[HA API Client]
    end

    subgraph "External"
        DB[(PostgreSQL)]
        Cache[(Redis)]
        HA[Home Assistant]
    end

    Routes --> Middleware
    Middleware --> HAService
    Middleware --> CacheService
    Middleware --> NotifService
    Middleware --> AuthService
    
    HAService --> HAClient
    CacheService --> RedisClient
    AuthService --> Prisma
    NotifService --> Prisma
    
    Prisma --> DB
    RedisClient --> Cache
    HAClient --> HA

    style Routes fill:#81d4fa
    style Middleware fill:#4fc3f7
    style HAService fill:#29b6f6
    style CacheService fill:#29b6f6
    style NotifService fill:#29b6f6
    style AuthService fill:#29b6f6
    style Prisma fill:#0277bd
    style RedisClient fill:#ff9800
    style HAClient fill:#f44336
```

## Flux d'Authentification

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant Redis as Redis
    participant DB as PostgreSQL

    U->>F: Login (email, password)
    F->>API: POST /api/auth/login
    API->>DB: Vérifier credentials
    DB-->>API: User found
    API->>API: Générer JWT + Refresh Token
    API->>Redis: Stocker session
    API-->>F: {accessToken, refreshToken}
    F->>F: Stocker tokens (localStorage)
    
    Note over F,API: Requêtes authentifiées
    
    F->>API: GET /api/entities<br/>Header: Bearer {token}
    API->>API: Valider JWT
    API->>Redis: Vérifier session
    API-->>F: {entities: [...]}
    
    Note over F,API: Token expiré
    
    F->>API: POST /api/auth/refresh<br/>{refreshToken}
    API->>Redis: Vérifier refresh token
    API->>API: Générer nouveau JWT
    API-->>F: {accessToken}
```

## Architecture Frontend React

```mermaid
graph TB
    subgraph "Components"
        Layout[Layout Components<br/>Header, Sidebar]
        Pages[Pages<br/>Dashboard, History, Settings]
        Widgets[Widgets<br/>Temperature, Energy, Camera]
        UI[UI Components<br/>Button, Card, Modal]
    end

    subgraph "State Management"
        Zustand[Zustand Stores<br/>Entities, Dashboard, User]
    end

    subgraph "Services"
        API[API Service<br/>Axios]
        WS[WebSocket Service<br/>Socket.io-client]
        Auth[Auth Service]
    end

    subgraph "Hooks"
        UseEntities[useEntities]
        UseRealtime[useRealtime]
        UseAuth[useAuth]
    end

    Pages --> Layout
    Pages --> Widgets
    Widgets --> UI
    
    Pages --> UseEntities
    Pages --> UseRealtime
    Widgets --> UseEntities
    
    UseEntities --> Zustand
    UseRealtime --> Zustand
    UseAuth --> Zustand
    
    UseEntities --> API
    UseRealtime --> WS
    UseAuth --> Auth
    
    API --> Backend[Backend API]
    WS --> Backend
    Auth --> Backend

    style Layout fill:#e1bee7
    style Pages fill:#ce93d8
    style Widgets fill:#ba68c8
    style UI fill:#ab47bc
    style Zustand fill:#81c784
    style API fill:#4fc3f7
    style WS fill:#29b6f6
    style Auth fill:#0288d1
```

## Déploiement Docker

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Network: ha-network"
            N[nginx:alpine]
            F[frontend<br/>Node Build]
            B[backend<br/>Node.js]
            P[(postgres:16)]
            R[(redis:7)]
        end
    end

    subgraph "Volumes"
        PV[postgres_data]
        RV[redis_data]
        LV[backend_logs]
        NV[nginx_logs]
    end

    subgraph "External"
        HA[Home Assistant<br/>duckdns.org:8123]
        USER[Users<br/>Internet]
    end

    USER -->|HTTPS :443| N
    N -->|:80| F
    N -->|:4000| B
    B --> P
    B --> R
    B -->|REST/WS| HA
    
    P -.-> PV
    R -.-> RV
    B -.-> LV
    N -.-> NV

    style N fill:#b3e5fc
    style F fill:#81d4fa
    style B fill:#4fc3f7
    style P fill:#4caf50
    style R fill:#ff9800
    style HA fill:#f44336
```

## Scalabilité Future

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx Load Balancer<br/>Round Robin]
    end

    subgraph "Frontend Cluster"
        F1[Frontend Instance 1]
        F2[Frontend Instance 2]
        F3[Frontend Instance N]
    end

    subgraph "Backend Cluster"
        B1[Backend Instance 1]
        B2[Backend Instance 2]
        B3[Backend Instance N]
    end

    subgraph "Cache Layer"
        RC[Redis Cluster<br/>Master-Slave]
    end

    subgraph "Database Layer"
        PM[PostgreSQL Master]
        PS1[PostgreSQL Slave 1]
        PS2[PostgreSQL Slave 2]
    end

    subgraph "Message Queue"
        MQ[RabbitMQ/Bull<br/>Job Queue]
    end

    LB --> F1
    LB --> F2
    LB --> F3
    
    F1 --> B1
    F2 --> B2
    F3 --> B3
    
    B1 --> RC
    B2 --> RC
    B3 --> RC
    
    B1 --> PM
    B2 --> PM
    B3 --> PM
    
    PM --> PS1
    PM --> PS2
    
    B1 --> MQ
    B2 --> MQ
    B3 --> MQ

    style LB fill:#b3e5fc
    style F1 fill:#81d4fa
    style F2 fill:#81d4fa
    style F3 fill:#81d4fa
    style B1 fill:#4fc3f7
    style B2 fill:#4fc3f7
    style B3 fill:#4fc3f7
    style RC fill:#ff9800
    style PM fill:#4caf50
    style PS1 fill:#66bb6a
    style PS2 fill:#66bb6a
    style MQ fill:#ab47bc
```

## Sécurité en Profondeur

```mermaid
graph TB
    subgraph "Layer 1: Périphérie"
        FW[Firewall UFW<br/>Ports 80, 443]
        F2B[Fail2Ban<br/>Protection DDoS]
    end

    subgraph "Layer 2: Proxy"
        SSL[SSL/TLS<br/>Let's Encrypt]
        RL[Rate Limiting<br/>Nginx]
    end

    subgraph "Layer 3: Application"
        CORS[CORS<br/>Origin Validation]
        JWT[JWT Auth<br/>Token Based]
        HELMET[Helmet.js<br/>Security Headers]
    end

    subgraph "Layer 4: Validation"
        ZOD[Zod<br/>Input Validation]
        CSRF[CSRF Protection]
    end

    subgraph "Layer 5: Data"
        ENC[Encryption at Rest]
        PARAM[Parameterized Queries<br/>Prisma ORM]
    end

    Internet[Internet] --> FW
    FW --> F2B
    F2B --> SSL
    SSL --> RL
    RL --> CORS
    CORS --> JWT
    JWT --> HELMET
    HELMET --> ZOD
    ZOD --> CSRF
    CSRF --> ENC
    ENC --> PARAM
    PARAM --> DB[(Database)]

    style FW fill:#f44336
    style F2B fill:#e53935
    style SSL fill:#d32f2f
    style RL fill:#c62828
    style CORS fill:#ff9800
    style JWT fill:#ff6f00
    style HELMET fill:#ffa726
    style ZOD fill:#4caf50
    style CSRF fill:#43a047
    style ENC fill:#388e3c
    style PARAM fill:#2e7d32
```

---

Ces diagrammes peuvent être visualisés:
- Sur GitHub (rendu automatique)
- Sur GitLab (rendu automatique)
- Avec l'extension VS Code "Markdown Preview Mermaid Support"
- Sur https://mermaid.live/
