# 🗄️ Connexion à la Base de Données PostgreSQL

## 🚀 Méthodes de Connexion

Il y a plusieurs façons de te connecter à la DB PostgreSQL du dashboard.

---

## 1️⃣ Via Docker (Méthode Recommandée)

### A. Connexion psql dans le container

```bash
# Se connecter au container et ouvrir psql
sudo docker-compose exec postgres psql -U ha_dashboard -d ha_dashboard
```

**Tu verras :**
```
ha_dashboard=#
```

### B. Commandes psql utiles

```sql
-- Lister toutes les tables
\dt

-- Voir la structure de la table users
\d users

-- Voir la structure de la table refresh_tokens
\d refresh_tokens

-- Lister tous les utilisateurs
SELECT * FROM users;

-- Compter le nombre d'utilisateurs
SELECT COUNT(*) FROM "User";

-- Voir les tokens de refresh
SELECT * FROM "RefreshToken";

-- Quitter psql
\q
```

---

## 2️⃣ Via pgAdmin / DBeaver / TablePlus (GUI)

### Configuration de Connexion

**Host :** `localhost`  
**Port :** `5432`  
**Database :** `ha_dashboard`  
**Username :** `ha_dashboard`  
**Password :** `ha_dashboard_password`

### Avec DBeaver (Gratuit et Open Source)

1. **Télécharger DBeaver**
   - https://dbeaver.io/download/
   - Ou via apt : `sudo apt install dbeaver-ce`

2. **Créer une Nouvelle Connexion**
   - Clic droit → "New Database Connection"
   - Sélectionne "PostgreSQL"
   - Remplis les infos ci-dessus
   - Test Connection → Save

3. **Explorer la DB**
   - Ouvre `ha_dashboard` → `Schemas` → `public` → `Tables`
   - Clic droit sur une table → "View Data"

### Avec pgAdmin (GUI officiel PostgreSQL)

```bash
# Installer pgAdmin4
sudo apt install pgadmin4

# Lancer pgAdmin
pgadmin4
```

**Configuration :**
- Clic droit sur "Servers" → "Create" → "Server"
- Name : `HA Dashboard`
- Host : `localhost`
- Port : `5432`
- Maintenance DB : `ha_dashboard`
- Username : `postgres`
- Password : `postgres`

---

## 3️⃣ Via Terminal (psql local)

### Installer psql sur WSL

```bash
# Installer le client PostgreSQL
sudo apt install postgresql-client -y

# Se connecter à la DB
psql -h localhost -p 5432 -U ha_dashboard -d ha_dashboard
```

**Mot de passe :** `ha_dashboard_password`

---

## 4️⃣ Via VS Code Extension

### Installer l'extension "PostgreSQL"

1. **Dans VS Code :**
   - `Ctrl+Shift+X`
   - Cherche "PostgreSQL" (par Chris Kolkman)
   - Installe l'extension

2. **Ajouter une connexion :**
   - Ouvre la vue PostgreSQL (icône dans la barre latérale)
   - Clic sur "+" pour ajouter une connexion
   - Remplis les infos :
     ```
     Host: localhost
     Port: 5432
     Database: ha_dashboard
     Username: postgres
     Password: postgres
     ```

3. **Explorer la DB :**
   - Clique sur la connexion
   - Explore les tables `User`, `RefreshToken`
   - Clic droit → "Run Query" pour exécuter du SQL

---

## 📊 Structure de la Base de Données

### Table `User`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | ID unique de l'utilisateur |
| email | VARCHAR | Email (unique) |
| name | VARCHAR | Nom de l'utilisateur |
| password | VARCHAR | Mot de passe hashé (bcrypt) |
| role | ENUM | Rôle (USER, ADMIN) |
| createdAt | TIMESTAMP | Date de création |
| updatedAt | TIMESTAMP | Dernière modification |

### Table `RefreshToken`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | ID unique du token |
| token | VARCHAR | Token de refresh JWT |
| userId | UUID | ID de l'utilisateur (FK) |
| expiresAt | TIMESTAMP | Date d'expiration |
| createdAt | TIMESTAMP | Date de création |

---

## 🔍 Requêtes SQL Utiles

### Voir tous les utilisateurs avec leur rôle

```sql
SELECT id, name, email, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;
```

### Compter les utilisateurs par rôle

```sql
SELECT role, COUNT(*) as count 
FROM "User" 
GROUP BY role;
```

### Voir les tokens actifs

```sql
SELECT rt.id, rt.token, u.email, rt."expiresAt"
FROM "RefreshToken" rt
JOIN "User" u ON rt."userId" = u.id
WHERE rt."expiresAt" > NOW()
ORDER BY rt."createdAt" DESC;
```

### Supprimer les tokens expirés

```sql
DELETE FROM "RefreshToken" 
WHERE "expiresAt" < NOW();
```

### Voir le dernier utilisateur créé

```sql
SELECT * FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

### Supprimer un utilisateur (et ses tokens en cascade)

```sql
DELETE FROM "User" 
WHERE email = 'test@example.com';
```

---

## 🛠️ Commandes de Maintenance

### Backup de la DB

```bash
# Backup complet
sudo docker-compose exec postgres pg_dump -U postgres ha_dashboard > backup.sql

# Backup avec timestamp
sudo docker-compose exec postgres pg_dump -U postgres ha_dashboard > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurer un Backup

```bash
# Restaurer depuis un fichier
cat backup.sql | sudo docker-compose exec -T postgres psql -U postgres -d ha_dashboard
```

### Reset la DB (ATTENTION : Efface tout !)

```bash
# Arrêter les containers
sudo docker-compose down

# Supprimer le volume de la DB
sudo docker volume rm ha-dashboard_postgres_data

# Redémarrer (recréera la DB)
sudo docker-compose up -d
```

### Voir la taille de la DB

```sql
SELECT pg_size_pretty(pg_database_size('ha_dashboard'));
```

### Voir la taille de chaque table

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚀 Quick Access (Commande rapide)

```bash
# Connexion rapide via Docker
sudo docker-compose exec postgres psql -U postgres -d ha_dashboard
```

**Une fois connecté :**
```sql
-- Voir tous les utilisateurs
SELECT * FROM "User";

-- Quitter
\q
```

---

## 🔒 Sécurité

### En Production

⚠️ **Ne JAMAIS utiliser ces credentials en production !**

Change les variables dans `docker-compose.yml` :
```yaml
environment:
  POSTGRES_PASSWORD: <mot_de_passe_fort>
  DATABASE_URL: postgresql://postgres:<mot_de_passe_fort>@postgres:5432/ha_dashboard
```

### Créer un utilisateur avec moins de privilèges

```sql
-- Se connecter en tant que postgres
-- Créer un utilisateur read-only
CREATE USER readonly WITH PASSWORD 'your_password';
GRANT CONNECT ON DATABASE ha_dashboard TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
```

---

## 📚 Documentation Prisma

### Voir les migrations appliquées

```bash
cd ~/Repos/ha-dashboard/backend
npx prisma migrate status
```

### Créer une nouvelle migration

```bash
cd ~/Repos/ha-dashboard/backend
npx prisma migrate dev --name nom_de_la_migration
```

### Régénérer le client Prisma

```bash
cd ~/Repos/ha-dashboard/backend
npx prisma generate
```

---

## 🎯 Résumé Rapide

| Méthode | Commande | Avantages |
|---------|----------|-----------|
| **Docker psql** | `sudo docker-compose exec postgres psql -U postgres -d ha_dashboard` | ✅ Rapide, intégré |
| **DBeaver** | GUI avec localhost:5432 | ✅ Interface visuelle, facile |
| **VS Code Extension** | PostgreSQL extension | ✅ Dans VS Code, pratique |
| **psql local** | `psql -h localhost -p 5432 -U postgres -d ha_dashboard` | ✅ Terminal local |

---

**🎉 Choisis la méthode qui te convient le mieux !**
