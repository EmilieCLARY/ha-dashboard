# GitHub Actions CI/CD Configuration

## Workflows

### 1. **Linting & Code Quality** (`lint`)
- Runs on: Every push and pull request
- Tasks:
  - ESLint for frontend and backend
  - Prettier formatting checks
  - Code quality checks

### 2. **Backend Tests** (`test-backend`)
- Runs on: Every push and pull request
- Requirements:
  - PostgreSQL service
  - Redis service
- Tasks:
  - Install dependencies
  - Generate Prisma Client
  - Run Jest tests

### 3. **Frontend Tests** (`test-frontend`)
- Runs on: Every push and pull request
- Tasks:
  - Install dependencies
  - Run Vitest tests

### 4. **Build Frontend** (`build-frontend`)
- Runs on: After lint + test-frontend pass
- Tasks:
  - Build React/Vite application
  - Upload artifacts for 7 days

### 5. **Build Backend** (`build-backend`)
- Runs on: After lint + test-backend pass
- Tasks:
  - Build Node.js/TypeScript application
  - Generate Prisma Client
  - Upload artifacts for 7 days

### 6. **Build Docker** (`build-docker`)
- Runs on: Main branch push only
- Needs: build-frontend + build-backend
- Tasks:
  - Build frontend Docker image
  - Build backend Docker image
  - Cache layers for faster builds

### 7. **Security Scan** (`security-scan`)
- Runs on: Every push and pull request
- Tasks:
  - Trivy vulnerability scan
  - npm audit for dependencies
  - Upload results to GitHub Security

### 8. **Deploy to VPS** (`deploy-vps`)
- Runs on: Main branch push only
- Needs: build-docker + security-scan
- Environment: production
- Tasks:
  - SSH to VPS
  - Pull latest code
  - Deploy Docker containers
  - Run migrations
  - Health checks
  - Notifications

## GitHub Secrets Configuration

You need to configure these secrets in GitHub repository settings:

### VPS Configuration Secrets

```
VPS_HOST          - VPS IP address or hostname (e.g., 192.168.1.100)
VPS_USER          - SSH user for VPS (e.g., ubuntu, root)
VPS_SSH_KEY       - Private SSH key (see below how to generate)
VPS_APP_PATH      - Path to app directory on VPS (e.g., /opt/ha-dashboard)
VPS_DOMAIN        - Your domain name (e.g., ha-dashboard.example.com)
```

### Docker Registry (Optional)

```
DOCKER_USERNAME   - Docker Hub username (optional)
DOCKER_PASSWORD   - Docker Hub password token (optional)
```

## Setup Instructions

### 1. Generate SSH Key for GitHub Actions

On your local machine:

```bash
# Generate SSH key (no passphrase)
ssh-keygen -t rsa -b 4096 -f github-actions-key -N ""

# Display private key (to copy in GitHub Secrets)
cat github-actions-key

# Display public key (to add to VPS)
cat github-actions-key.pub
```

### 2. Add SSH Public Key to VPS

On your VPS:

```bash
# Add the public key to authorized_keys
echo "PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Verify SSH connection
ssh -i github-actions-key user@your-vps-ip
```

### 3. Configure GitHub Secrets

1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add each secret with the corresponding value:

```
VPS_HOST          = your.vps.ip.or.hostname
VPS_USER          = ubuntu (or your SSH user)
VPS_SSH_KEY       = (content of private key)
VPS_APP_PATH      = /opt/ha-dashboard
VPS_DOMAIN        = your-domain.com
DOCKER_USERNAME   = (optional)
DOCKER_PASSWORD   = (optional)
```

### 4. Setup VPS (First Time Only)

On your VPS:

```bash
# Clone the repository or create app directory
mkdir -p /opt/ha-dashboard
cd /opt/ha-dashboard

# Run the setup script
curl -fsSL https://raw.githubusercontent.com/EmilieCLARY/ha-dashboard/main/scripts/vps-setup.sh | bash

# Edit .env file
nano .env

# Start the application
docker-compose --profile production up -d
```

## Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
# On VPS
cd /opt/ha-dashboard

# Deploy with backup and health checks
./scripts/deploy.sh production deploy

# Or just restart containers
./scripts/deploy.sh production restart

# View logs
./scripts/deploy.sh production logs

# Rollback if needed
./scripts/deploy.sh production rollback

# Backup database
./scripts/deploy.sh production backup-db

# Restore database
./scripts/deploy.sh production restore-db ./backups/db_backup_20240117_100000.sql
```

## Environment Variables

### Frontend
```
VITE_API_URL      - Backend API URL (e.g., https://api.example.com)
VITE_WS_URL       - WebSocket URL (e.g., wss://api.example.com)
```

### Backend
```
NODE_ENV          - development|production|test
PORT              - API port (default: 4000)
DATABASE_URL      - PostgreSQL connection string
REDIS_URL         - Redis connection string
JWT_SECRET        - Secret key for JWT tokens
JWT_REFRESH_SECRET - Secret key for refresh tokens
HA_URL            - Home Assistant URL
HA_TOKEN          - Home Assistant API token
CORS_ORIGIN       - Allowed CORS origins
POSTGRES_USER     - Database user
POSTGRES_PASSWORD - Database password
POSTGRES_DB       - Database name
REDIS_PASSWORD    - Redis password
```

## Troubleshooting

### SSH Connection Issues

```bash
# Test SSH connection
ssh -i github-actions-key -v user@your-vps-ip

# Check SSH key permissions on VPS
ls -la ~/.ssh/
# authorized_keys should have 600 permissions

# Check SSH logs on VPS
sudo tail -f /var/log/auth.log
```

### Docker Issues

```bash
# Check container status on VPS
docker-compose ps

# View container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose down
docker-compose --profile production up -d --build
```

### Database Migrations

```bash
# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Check migration status
docker-compose exec backend npx prisma migrate status

# View database
docker-compose exec postgres psql -U ha_dashboard -d ha_dashboard
```

## Monitoring

### Health Checks

The workflow runs automatic health checks after deployment:
- Frontend: Checks HTTP 200 response
- Backend: Checks `/api/health` endpoint
- Both must pass for deployment to be considered successful

### Logs

View deployment logs:
1. Go to repository
2. Click `Actions` tab
3. Select the workflow run
4. Click on the job to see detailed logs

### Notifications

After deployment:
- ✅ Success notifications are added to GitHub (optional)
- ❌ Failure notifications are added to GitHub
- Deployment URL is available in the environment

## Security Best Practices

1. **SSH Key**
   - Never share your private key
   - Use strong key (RSA 4096 or higher)
   - Rotate keys regularly

2. **Secrets**
   - Never commit secrets to git
   - Use GitHub encrypted secrets
   - Rotate tokens periodically

3. **Firewall**
   - Limit SSH access to GitHub servers
   - Use firewall rules on VPS

4. **VPS Access**
   - Use key-based authentication only
   - Disable password authentication
   - Update SSH port (optional)

5. **Database**
   - Use strong passwords
   - Backup regularly
   - Enable SSL/TLS connections

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
