#!/bin/bash

# 🔒 Script d'installation SSL avec Let's Encrypt
# Usage: ./setup-ssl.sh dashboard.yuniemos.fr

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN=$1
EMAIL=${2:-"admin@${DOMAIN}"}
APP_PATH=$(pwd)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔒 Installation SSL Let's Encrypt   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Validation
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Erreur: Nom de domaine requis${NC}"
    echo -e "${YELLOW}Usage: $0 dashboard.yuniemos.fr [email@example.com]${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "   Domaine: ${GREEN}${DOMAIN}${NC}"
echo -e "   Email: ${GREEN}${EMAIL}${NC}"
echo -e "   Chemin: ${GREEN}${APP_PATH}${NC}"
echo ""

# Vérifier la résolution DNS
echo -e "${BLUE}🌐 Vérification DNS...${NC}"
if ! host ${DOMAIN} > /dev/null 2>&1; then
    echo -e "${RED}❌ Le domaine ${DOMAIN} ne résout pas encore${NC}"
    echo -e "${YELLOW}⚠️  Attendez que la propagation DNS soit terminée${NC}"
    echo -e "${YELLOW}   Vous pouvez vérifier avec: nslookup ${DOMAIN}${NC}"
    exit 1
fi

RESOLVED_IP=$(host ${DOMAIN} | grep "has address" | head -1 | awk '{print $4}')
echo -e "   ${GREEN}✓ DNS résolu: ${DOMAIN} → ${RESOLVED_IP}${NC}"
echo ""

# Installer Certbot si nécessaire
echo -e "${BLUE}📦 Installation de Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt update
    apt install -y certbot
    echo -e "   ${GREEN}✓ Certbot installé${NC}"
else
    echo -e "   ${GREEN}✓ Certbot déjà installé${NC}"
fi
echo ""

# Créer le dossier pour les challenges
echo -e "${BLUE}📁 Préparation des dossiers...${NC}"
mkdir -p ${APP_PATH}/nginx/ssl
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot
echo -e "   ${GREEN}✓ Dossiers créés${NC}"
echo ""

# Arrêter nginx temporairement
echo -e "${BLUE}🛑 Arrêt temporaire de nginx...${NC}"
cd ${APP_PATH}
docker-compose stop nginx || true
echo -e "   ${GREEN}✓ Nginx arrêté${NC}"
echo ""

# Obtenir le certificat
echo -e "${BLUE}🔐 Obtention du certificat SSL...${NC}"
echo -e "${YELLOW}   Cela peut prendre quelques secondes...${NC}"

if certbot certonly --standalone \
    -d ${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --force-renewal; then
    echo -e "   ${GREEN}✓ Certificat obtenu avec succès!${NC}"
else
    echo -e "${RED}❌ Échec de l'obtention du certificat${NC}"
    echo -e "${YELLOW}   Vérifiez les logs: /var/log/letsencrypt/letsencrypt.log${NC}"
    exit 1
fi
echo ""

# Copier les certificats
echo -e "${BLUE}📋 Copie des certificats...${NC}"
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${APP_PATH}/nginx/ssl/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${APP_PATH}/nginx/ssl/
chmod 644 ${APP_PATH}/nginx/ssl/*.pem
echo -e "   ${GREEN}✓ Certificats copiés${NC}"
echo ""

# Mettre à jour la configuration nginx
echo -e "${BLUE}⚙️  Configuration de nginx avec SSL...${NC}"

if [ -f "${APP_PATH}/nginx/nginx-with-ssl.conf" ]; then
    # Backup de la config actuelle
    cp ${APP_PATH}/nginx/nginx.conf ${APP_PATH}/nginx/nginx.conf.backup
    
    # Utiliser la config SSL
    cp ${APP_PATH}/nginx/nginx-with-ssl.conf ${APP_PATH}/nginx/nginx.conf
    
    # Remplacer le domaine
    sed -i "s/dashboard.yuniemos.fr/${DOMAIN}/g" ${APP_PATH}/nginx/nginx.conf
    
    echo -e "   ${GREEN}✓ Configuration nginx mise à jour${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier nginx-with-ssl.conf non trouvé${NC}"
    echo -e "${YELLOW}   Vous devrez mettre à jour nginx.conf manuellement${NC}"
fi
echo ""

# Redémarrer nginx
echo -e "${BLUE}🚀 Redémarrage de nginx...${NC}"
docker-compose up -d nginx
sleep 3
echo -e "   ${GREEN}✓ Nginx redémarré${NC}"
echo ""

# Vérifier le statut
echo -e "${BLUE}🔍 Vérification du statut...${NC}"
if docker-compose ps nginx | grep -q "Up"; then
    echo -e "   ${GREEN}✓ Nginx fonctionne correctement${NC}"
else
    echo -e "${RED}❌ Nginx ne fonctionne pas${NC}"
    echo -e "${YELLOW}   Vérifiez les logs: docker-compose logs nginx${NC}"
    exit 1
fi
echo ""

# Configuration du renouvellement automatique
echo -e "${BLUE}🔄 Configuration du renouvellement automatique...${NC}"

cat > /tmp/certbot-renew << EOF
#!/bin/bash
# Renouveler le certificat et redémarrer nginx
certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/${DOMAIN}/*.pem ${APP_PATH}/nginx/ssl/ && cd ${APP_PATH} && docker-compose restart nginx"
EOF

chmod +x /tmp/certbot-renew
mv /tmp/certbot-renew /etc/cron.daily/certbot-renew

echo -e "   ${GREEN}✓ Renouvellement automatique configuré${NC}"
echo ""

# Test du renouvellement
echo -e "${BLUE}🧪 Test du renouvellement...${NC}"
if certbot renew --dry-run --quiet; then
    echo -e "   ${GREEN}✓ Test de renouvellement réussi${NC}"
else
    echo -e "${YELLOW}⚠️  Test de renouvellement échoué (pas critique)${NC}"
fi
echo ""

# Résumé
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ Installation terminée!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Votre site est maintenant accessible via HTTPS:${NC}"
echo -e "   ${GREEN}https://${DOMAIN}${NC}"
echo ""
echo -e "${BLUE}📊 Informations sur le certificat:${NC}"
certbot certificates | grep -A 10 "${DOMAIN}" || true
echo ""
echo -e "${BLUE}🔄 Le certificat sera automatiquement renouvelé tous les 90 jours${NC}"
echo ""
echo -e "${YELLOW}💡 Testez votre configuration SSL:${NC}"
echo -e "   https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"
echo ""
