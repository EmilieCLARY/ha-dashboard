#!/bin/bash

# Script to generate .env file with secure JWT secrets

set -e

echo "🔧 Generating .env file with secure secrets..."

# Check if .env already exists
if [ -f .env ]; then
    read -p "⚠️  .env file already exists. Overwrite? (y/N) " -n 1 -r
    echo
    if [[ ! $R REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Existing .env file preserved."
        exit 0
    fi
    # Backup existing .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "📦 Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy from example
cp .env.example .env

# Generate secure JWT secrets
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Update JWT secrets in .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}/" .env

echo "✅ .env file created successfully!"
echo ""
echo "🔐 Generated JWT secrets (already added to .env):"
echo "   JWT_SECRET=${JWT_SECRET}"
echo "   JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}"
echo ""
echo "⚠️  IMPORTANT: You still need to configure:"
echo "   - HA_URL (your Home Assistant URL)"
echo "   - HA_TOKEN (your Home Assistant long-lived access token)"
echo "   - POSTGRES_PASSWORD (secure database password)"
echo "   - REDIS_PASSWORD (secure Redis password)"
echo ""
echo "📝 Edit .env file with: nano .env"
echo ""
echo "🔒 SECURITY: Never commit .env to git! It's already in .gitignore"
