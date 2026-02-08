#!/bin/bash

# 🔄 Script de configuration du renouvellement automatique SSL
# Usage: ./setup-ssl-renewal.sh dashboard.yuniemos.fr

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN=$1
APP_PATH=${2:-$(pwd)}

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Erreur: Nom de domaine requis${NC}"
    echo -e "${YELLOW}Usage: $0 dashboard.yuniemos.fr [/path/to/app]${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Configuration du renouvellement automatique SSL${NC}"
echo -e "   Domaine: ${GREEN}${DOMAIN}${NC}"
echo -e "   App: ${GREEN}${APP_PATH}${NC}"
echo ""

# Créer le script de renouvellement
echo -e "${BLUE}📝 Création du script de renouvellement...${NC}"

cat > /tmp/certbot-renew-${DOMAIN}.sh << 'EOF'
#!/bin/bash

# Script de renouvellement automatique pour DOMAIN
DOMAIN="DOMAIN_PLACEHOLDER"
APP_PATH="APP_PATH_PLACEHOLDER"

# Log file
LOG_FILE="${APP_PATH}/logs/ssl-renewal.log"
mkdir -p $(dirname ${LOG_FILE})

echo "[$(date)] Starting SSL renewal for ${DOMAIN}" >> ${LOG_FILE}

# Renew certificate
if certbot renew --quiet --cert-name ${DOMAIN}; then
    echo "[$(date)] Certificate renewed successfully" >> ${LOG_FILE}
    
    # Copy new certificates
    if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
        cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${APP_PATH}/nginx/ssl/
        cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${APP_PATH}/nginx/ssl/
        chmod 644 ${APP_PATH}/nginx/ssl/*.pem
        echo "[$(date)] Certificates copied" >> ${LOG_FILE}
        
        # Restart nginx
        cd ${APP_PATH}
        docker-compose restart nginx
        echo "[$(date)] Nginx restarted" >> ${LOG_FILE}
    else
        echo "[$(date)] ERROR: Certificate directory not found" >> ${LOG_FILE}
    fi
else
    echo "[$(date)] ERROR: Certificate renewal failed" >> ${LOG_FILE}
fi

echo "[$(date)] SSL renewal completed" >> ${LOG_FILE}
EOF

# Replace placeholders
sed -i "s|DOMAIN_PLACEHOLDER|${DOMAIN}|g" /tmp/certbot-renew-${DOMAIN}.sh
sed -i "s|APP_PATH_PLACEHOLDER|${APP_PATH}|g" /tmp/certbot-renew-${DOMAIN}.sh

# Install script
chmod +x /tmp/certbot-renew-${DOMAIN}.sh
mv /tmp/certbot-renew-${DOMAIN}.sh /usr/local/bin/certbot-renew-${DOMAIN}.sh

echo -e "   ${GREEN}✓ Script de renouvellement créé${NC}"
echo ""

# Configure cron job
echo -e "${BLUE}⏰ Configuration du cron job...${NC}"

# Remove old cron job if exists
crontab -l 2>/dev/null | grep -v "certbot-renew-${DOMAIN}" | crontab - 2>/dev/null || true

# Add new cron job (every day at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/certbot-renew-${DOMAIN}.sh") | crontab -

echo -e "   ${GREEN}✓ Cron job configuré (tous les jours à 3h du matin)${NC}"
echo ""

# Test renewal
echo -e "${BLUE}🧪 Test du renouvellement (dry-run)...${NC}"

if certbot renew --dry-run --cert-name ${DOMAIN} 2>&1 | grep -q "Congratulations"; then
    echo -e "   ${GREEN}✓ Test de renouvellement réussi${NC}"
else
    echo -e "   ${YELLOW}⚠️  Test de renouvellement échoué${NC}"
    echo -e "   ${YELLOW}   Le renouvellement automatique pourrait ne pas fonctionner${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Renouvellement automatique activé  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Configuration:${NC}"
echo -e "   • Domaine: ${GREEN}${DOMAIN}${NC}"
echo -e "   • Fréquence: ${GREEN}Tous les jours à 3h du matin${NC}"
echo -e "   • Script: ${GREEN}/usr/local/bin/certbot-renew-${DOMAIN}.sh${NC}"
echo -e "   • Logs: ${GREEN}${APP_PATH}/logs/ssl-renewal.log${NC}"
echo ""
echo -e "${BLUE}💡 Commandes utiles:${NC}"
echo -e "   • Voir les cron jobs: ${YELLOW}crontab -l${NC}"
echo -e "   • Tester manuellement: ${YELLOW}/usr/local/bin/certbot-renew-${DOMAIN}.sh${NC}"
echo -e "   • Voir les logs: ${YELLOW}tail -f ${APP_PATH}/logs/ssl-renewal.log${NC}"
echo -e "   • Forcer le renouvellement: ${YELLOW}certbot renew --force-renewal --cert-name ${DOMAIN}${NC}"
echo ""
