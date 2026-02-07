#!/bin/bash
# Deploy script for VPS deployment
# Usage: ./deploy.sh [environment] [action]

set -e

ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
PROJECT_NAME="ha-dashboard"
DOCKER_COMPOSE="docker-compose --profile $ENVIRONMENT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_success "All requirements met"
}

# Pull latest code
pull_code() {
    log_info "Pulling latest code from GitHub..."
    git fetch origin
    git checkout main
    git pull origin main
    log_success "Code updated"
}

# Build and start containers
deploy() {
    log_info "Deploying $PROJECT_NAME to $ENVIRONMENT..."
    
    # Pull latest images
    log_info "Pulling latest images..."
    $DOCKER_COMPOSE pull
    
    # Build and start containers
    log_info "Starting containers..."
    $DOCKER_COMPOSE up -d --build
    
    log_success "Containers started"
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    
    $DOCKER_COMPOSE exec -T backend npx prisma migrate deploy || {
        log_warning "Migrations already up to date or encountered an issue"
    }
    
    log_success "Migrations completed"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        # Check if backend is responding
        if $DOCKER_COMPOSE exec -T backend curl -f http://localhost:4000/health &> /dev/null; then
            log_success "Backend health check passed"
            return 0
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show logs
show_logs() {
    log_info "Showing logs..."
    $DOCKER_COMPOSE logs --tail=100 -f
}

# Stop containers
stop() {
    log_info "Stopping containers..."
    $DOCKER_COMPOSE down
    log_success "Containers stopped"
}

# Restart containers
restart() {
    log_info "Restarting containers..."
    $DOCKER_COMPOSE restart
    log_success "Containers restarted"
}

# Rollback to previous version
rollback() {
    log_warning "Rolling back to previous version..."
    
    log_info "Stopping containers..."
    $DOCKER_COMPOSE down
    
    log_info "Checking out previous commit..."
    git checkout HEAD~1
    
    log_info "Starting containers with previous version..."
    $DOCKER_COMPOSE up -d --build
    
    if health_check; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed!"
        exit 1
    fi
}

# Cleanup unused Docker resources
cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker system prune -f
    $DOCKER_COMPOSE down --remove-orphans
    log_success "Cleanup completed"
}

# Backup database
backup_db() {
    log_info "Backing up database..."
    
    local backup_dir="./backups"
    local backup_file="$backup_dir/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$backup_dir"
    
    $DOCKER_COMPOSE exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "$backup_file"
    
    log_success "Database backed up to $backup_file"
}

# Restore database
restore_db() {
    if [ -z "$2" ]; then
        log_error "Usage: $0 $ENVIRONMENT restore-db <backup_file>"
        exit 1
    fi
    
    local backup_file=$2
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_warning "Restoring database from $backup_file..."
    
    $DOCKER_COMPOSE exec -T postgres psql -U $POSTGRES_USER $POSTGRES_DB < "$backup_file"
    
    log_success "Database restored"
}

# Show status
status() {
    log_info "Showing container status..."
    $DOCKER_COMPOSE ps
}

# Main script
main() {
    log_info "Ha-Dashboard Deployment Script"
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    
    check_requirements
    
    case $ACTION in
        deploy)
            pull_code
            backup_db
            deploy
            run_migrations
            health_check
            log_success "Deployment completed!"
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        rollback)
            rollback
            ;;
        logs)
            show_logs
            ;;
        cleanup)
            cleanup
            ;;
        backup-db)
            backup_db
            ;;
        restore-db)
            restore_db "$@"
            ;;
        status)
            status
            ;;
        health-check)
            health_check
            ;;
        *)
            log_error "Unknown action: $ACTION"
            echo "Available actions: deploy, stop, restart, rollback, logs, cleanup, backup-db, restore-db, status, health-check"
            exit 1
            ;;
    esac
}

main "$@"
