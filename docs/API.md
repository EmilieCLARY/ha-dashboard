# 🏠 Home Assistant Dashboard - API Documentation

## 🎯 Endpoints Disponibles

### Health Check
```http
GET /health
```
Vérifie que le serveur est en ligne.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

---

## 📊 Entities

### Lister toutes les entités
```http
GET /api/entities
```

**Response:**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "entity_id": "sensor.thermometre_aqara_salon_temperature",
      "state": "21.5",
      "attributes": {
        "unit_of_measurement": "°C",
        "friendly_name": "Thermomètre Aqara - Salon Temperature"
      },
      "last_changed": "2026-01-17T14:25:00.000Z",
      "last_updated": "2026-01-17T14:25:00.000Z"
    }
  ]
}
```

### Obtenir une entité spécifique
```http
GET /api/entities/:entity_id
```

**Example:**
```http
GET /api/entities/sensor.thermometre_aqara_salon_temperature
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entity_id": "sensor.thermometre_aqara_salon_temperature",
    "state": "21.5",
    "attributes": {
      "unit_of_measurement": "°C",
      "friendly_name": "Thermomètre Aqara - Salon Temperature",
      "device_class": "temperature"
    }
  }
}
```

### Obtenir l'historique d'une entité
```http
GET /api/entities/:entity_id/history?start=2026-01-16T00:00:00Z&end=2026-01-17T00:00:00Z
```

**Query Parameters:**
- `start` (optional): ISO 8601 date - Default: 24 hours ago
- `end` (optional): ISO 8601 date - Default: now

**Response:**
```json
{
  "success": true,
  "entity_id": "sensor.thermometre_aqara_salon_temperature",
  "period": {
    "start": "2026-01-16T00:00:00.000Z",
    "end": "2026-01-17T00:00:00.000Z"
  },
  "data": [
    {
      "state": "21.5",
      "last_changed": "2026-01-17T14:25:00.000Z",
      "attributes": { "unit_of_measurement": "°C" }
    }
  ]
}
```

---

## 🎮 Services

### Appeler un service Home Assistant
```http
POST /api/services/:domain/:service
Content-Type: application/json
```

**Example - Allumer une lumière:**
```http
POST /api/services/light/turn_on
Content-Type: application/json

{
  "entity_id": "light.salon",
  "brightness": 255
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "entity_id": "light.salon",
      "state": "on"
    }
  ]
}
```

---

## 🔌 WebSocket Events

### Connexion
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Événements disponibles

#### Home Assistant connecté
```javascript
socket.on('ha:connected', () => {
  console.log('Home Assistant WebSocket connected');
});
```

#### Changement d'état d'une entité
```javascript
socket.on('ha:state_changed', (data) => {
  console.log('Entity changed:', data);
  /*
  {
    entity_id: "sensor.temperature",
    new_state: { state: "22.5", attributes: {...} },
    old_state: { state: "22.3", attributes: {...} }
  }
  */
});
```

---

## 📝 Exemples d'utilisation

### Récupérer toutes les températures
```bash
curl http://localhost:4000/api/entities | jq '.data[] | select(.entity_id | contains("temperature"))'
```

### Obtenir l'historique d'une température
```bash
curl "http://localhost:4000/api/entities/sensor.thermometre_aqara_salon_temperature/history?start=2026-01-16T00:00:00Z"
```

### Appeler un service
```bash
curl -X POST http://localhost:4000/api/services/light/turn_on \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "light.salon", "brightness": 255}'
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React + WS)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐       ┌──────────────────┐
│   Backend API   │←──────│  Home Assistant  │
│  (Express + WS) │       │   (REST + WS)    │
└────────┬────────┘       └──────────────────┘
         │
   ┌─────┴─────┐
   │           │
┌──↓───┐   ┌──↓───┐
│ Redis│   │ Postgres │
└──────┘   └──────┘
```

---

## 🚀 Quick Start

1. **Démarrer les services:**
```bash
sudo docker-compose up -d
```

2. **Vérifier que tout fonctionne:**
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/entities
```

3. **Accéder au dashboard:**
```
http://localhost:3000
```

---

## 📚 Variables d'environnement

```env
# Backend
PORT=4000
NODE_ENV=development

# Home Assistant
HA_URL=https://test-yuniemos.duckdns.org:8123
HA_TOKEN=your_long_lived_token

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/ha_dashboard

# Redis
REDIS_URL=redis://default:password@redis:6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Backend ne se connecte pas à Home Assistant
```bash
# Vérifier les logs
sudo docker-compose logs backend

# Tester la connexion manuellement
curl -H "Authorization: Bearer ${HA_TOKEN}" https://test-yuniemos.duckdns.org:8123/api/
```

### WebSocket ne se connecte pas
```bash
# Vérifier que le port 4000 est accessible
netstat -tulpn | grep 4000

# Vérifier les logs WebSocket
sudo docker-compose logs backend | grep WebSocket
```

---

## 📖 Documentation complète

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture système détaillée
- [QUICKSTART.md](./QUICKSTART.md) - Guide de démarrage rapide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement en production
- [TODO.md](./TODO.md) - Roadmap et fonctionnalités à venir
