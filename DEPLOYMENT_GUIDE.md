# GitHub Actions & VPS Deployment Setup Guide

> **📖 Pour une installation VPS complète depuis zéro, consultez [VPS_SETUP.md](./docs/VPS_SETUP.md)**

## 🚀 Quick Start (5 minutes)

### Step 1: Generate SSH Key for GitHub Actions

```bash
# Generate SSH key (no passphrase!)
ssh-keygen -t rsa -b 4096 -f ~/github-actions-key -N ""

# Copy private key (you'll paste this in GitHub Secrets)
cat ~/github-actions-key

# Copy public key
cat ~/github-actions-key.pub
```

### Step 2: Add Public Key to VPS

SSH into your VPS and run:

```bash
# Add public key to authorized_keys
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Test connection locally
ssh -i ~/github-actions-key your-username@your-vps-ip
```

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these:

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your VPS IP address | `192.168.1.100` |
| `VPS_USER` | SSH user | `ubuntu` or `root` |
| `VPS_SSH_KEY` | Content of `~/github-actions-key` | (entire private key) |
| `VPS_APP_PATH` | Application path on VPS | `/opt/ha-dashboard` |
| `VPS_DOMAIN` | Your VPS IP (no DNS needed!) | `192.168.1.100` |

**Note:** Vous n'avez **pas besoin de nom de domaine** ! Utilisez directement l'IP de votre VPS pour `VPS_DOMAIN`.

### Step 4: Setup VPS (One-time)

**Option A: Script automatique (recommandé)**

```bash
# SSH into your VPS
ssh your-username@your-vps-ip

# Télécharger et lancer le script d'installation
curl -fsSL https://raw.githubusercontent.com/EmilieCLARY/ha-dashboard/main/scripts/vps-initial-setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

Le script installe Docker, clone le repo, génère les secrets, configure le firewall et démarre l'application !

**→ [Guide complet d'installation VPS](./docs/VPS_SETUP.md)**

**Option B: Installation manuelle**

```bash
# SSH into your VPS
ssh your-username@your-vps-ip

# Clone le repository
git clone https://github.com/YOUR-USERNAME/ha-dashboard.git ~/ha-dashboard
cd ~/ha-dashboard

# Installer Docker et Docker Compose (si nécessaire)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Générer .env avec secrets
cp .env.example .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env
sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$(openssl rand -hex 32)/" .env

# Éditer avec vos credentials Home Assistant
nano .env

# Démarrer l'application
docker-compose --profile production up -d
```

### Step 5: Verify Deployment

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:4000/health
```

## 📋 What Gets Deployed

When you push to `main` branch:

1. ✅ **Tests run** (frontend + backend)
2. ✅ **Code quality checks** (ESLint, Prettier)
3. ✅ **Security scan** (Trivy)
4. ✅ **Docker images built**
5. ✅ **Deploy to VPS** (with 3 automatic retries on failure)
6. ✅ **Database backup** (automatic before deployment)
7. ✅ **Database migrations run**
8. ✅ **Health checks verify deployment**

### Deployment Retry Logic

The deployment automatically retries up to 3 times if it fails:
- **Attempt 1**: Immediate deployment
- **Attempt 2**: Retry after 10 seconds (if attempt 1 fails)
- **Attempt 3**: Final retry after 10 seconds (if attempt 2 fails)

This ensures transient network issues or temporary VPS unavailability don't cause deployment failures.

## 🔧 Manual Deployment Commands

If you need to deploy without waiting for GitHub Actions:

```bash
# SSH to VPS
ssh your-username@your-vps-ip

cd /opt/ha-dashboard

# Full deployment with backup
./scripts/deploy.sh production deploy

# Just restart containers
./scripts/deploy.sh production restart

# View logs
./scripts/deploy.sh production logs

# Rollback to previous version
./scripts/deploy.sh production rollback

# Backup database
./scripts/deploy.sh production backup-db

# Restore database
./scripts/deploy.sh production restore-db ./backups/db_backup_*.sql

# Check status
./scripts/deploy.sh production status
```

## 📊 GitHub Actions Workflows

### `ci-cd.yml` - Main Pipeline
Runs on: **Push to main/develop, PR**
- Linting
- Tests
- Build
- Security scan
- **Deploy to VPS** (main only)

### `pr-checks.yml` - Pull Request Checks
Runs on: **PR to main/develop**
- Code quality
- Tests
- Build check
- Security scan
- PR summary

## 🔒 Security Setup

### SSH Key Best Practices

✅ **Do:**
- Generate with 4096+ bits
- Use without passphrase (for CI/CD)
- Store private key safely
- Rotate keys every 6-12 months

❌ **Don't:**
- Share private key
- Commit key to git
- Use weak key size

### GitHub Secrets

- ✅ Never expose secrets in logs
- ✅ Use specific, limited access keys
- ✅ Rotate tokens regularly
- ✅ Monitor secret usage in Settings → Security log

### VPS Security

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Change: PasswordAuthentication yes → PasswordAuthentication no

# Restart SSH
sudo systemctl restart ssh

# Setup firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw default deny incoming
```

## 🐛 Troubleshooting

### SSH Connection Fails

```bash
# Test connection
ssh -v -i ~/github-actions-key your-username@your-vps-ip

# Check authorized_keys on VPS
cat ~/.ssh/authorized_keys

# Verify key permissions (should be 600)
ls -la ~/.ssh/

# Check SSH logs
sudo tail -f /var/log/auth.log
```

### Deployment Fails

```bash
# Check GitHub Actions logs
# Go to: Actions → Recent run → Deploy job

# Manual health check on VPS
curl -v http://localhost:4000/health

# View container logs
docker-compose logs --tail=100
docker-compose logs -f backend
docker-compose logs -f frontend

# Check Docker status
docker-compose ps
```

### Database Issues

```bash
# SSH to VPS
ssh your-username@your-vps-ip
cd /opt/ha-dashboard

# Check migrations
docker-compose exec backend npx prisma migrate status

# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U ha_dashboard -d ha_dashboard
```

## 📚 Additional Resources

- [CI/CD Setup Documentation](./CI_CD_SETUP.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Compose Guide](https://docs.github.com/en/actions)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ✅ Verification Checklist

Before your first deployment:

- [ ] SSH key generated and public key on VPS
- [ ] GitHub Secrets configured (5 required)
- [ ] VPS directory created (`/opt/ha-dashboard`)
- [ ] Git repository initialized on VPS
- [ ] `.env` file created on VPS
- [ ] Docker/Docker Compose installed on VPS
- [ ] Firewall configured on VPS
- [ ] First push to `main` branch triggers workflow
- [ ] GitHub Actions shows success
- [ ] Application accessible at your domain

## 🎉 Success!

After your first successful deployment:

1. Check your domain - the app should be live! 🚀
2. GitHub Actions will deploy automatically on every push to `main`
3. Use manual deployment script if you need urgent fixes
4. Monitor logs in `Actions` tab

For help, check the [full documentation](./CI_CD_SETUP.md)
