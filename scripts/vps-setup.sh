#!/bin/bash
# VPS setup script - Run this once on your VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Update system
log_info "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    log_success "Docker installed"
else
    log_success "Docker already installed"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
    log_success "Docker Compose installed"
else
    log_success "Docker Compose already installed"
fi

# Install Git
log_info "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
    log_success "Git installed"
else
    log_success "Git already installed"
fi

# Install curl
log_info "Installing curl..."
if ! command -v curl &> /dev/null; then
    sudo apt-get install -y curl
    log_success "curl installed"
else
    log_success "curl already installed"
fi

# Create app directory
APP_PATH="/opt/ha-dashboard"
log_info "Creating application directory at $APP_PATH..."
if [ ! -d "$APP_PATH" ]; then
    sudo mkdir -p "$APP_PATH"
    sudo chown -R $USER:$USER "$APP_PATH"
    log_success "Application directory created"
else
    log_success "Application directory already exists"
fi

# Clone or update repository
log_info "Setting up repository..."
if [ -d "$APP_PATH/.git" ]; then
    cd "$APP_PATH"
    git fetch origin
    git checkout main
    git pull origin main
    log_success "Repository updated"
else
    cd "$APP_PATH"
    git init
    git remote add origin $GIT_REPO_URL
    git fetch origin
    git checkout main
    log_success "Repository cloned"
fi

# Create .env file from example
log_info "Setting up environment variables..."
if [ ! -f "$APP_PATH/.env" ]; then
    cp "$APP_PATH/.env.example" "$APP_PATH/.env"
    log_info "Please edit $APP_PATH/.env with your configuration"
    log_info "Required variables:"
    log_info "  - HA_URL: Your Home Assistant instance URL"
    log_info "  - HA_TOKEN: Your Home Assistant API token"
    log_info "  - JWT_SECRET: A secure secret for JWT tokens"
    log_info "  - POSTGRES_PASSWORD: Database password"
    log_info "  - REDIS_PASSWORD: Redis password"
else
    log_success ".env file already exists"
fi

# Setup firewall (if UFW is installed)
if command -v ufw &> /dev/null; then
    log_info "Configuring firewall..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 3000/tcp || true
    sudo ufw allow 4000/tcp || true
    log_success "Firewall configured"
fi

# Create systemd service for auto-start
log_info "Creating systemd service..."
sudo tee /etc/systemd/system/ha-dashboard.service > /dev/null <<EOF
[Unit]
Description=Ha-Dashboard
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_PATH
ExecStart=/usr/bin/docker-compose --profile production up -d
ExecStop=/usr/bin/docker-compose --profile production down
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ha-dashboard.service
log_success "Systemd service created and enabled"

log_success "VPS setup completed!"
log_info "Next steps:"
log_info "1. Edit $APP_PATH/.env with your configuration"
log_info "2. Run: cd $APP_PATH && docker-compose --profile production up -d"
log_info "3. Check logs: cd $APP_PATH && docker-compose logs -f"
