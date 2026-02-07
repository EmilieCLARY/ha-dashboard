#!/bin/bash

# Script pour afficher les informations d'accès au dashboard

PROJECT_DIR="$HOME/ha-dashboard"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Récupérer l'IP du VPS
VPS_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 HA Dashboard - Informations d'accès${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}🌐 URLs d'accès:${NC}"
echo -e "  Frontend:  ${YELLOW}http://${VPS_IP}:3000${NC}"
echo -e "  Backend:   ${YELLOW}http://${VPS_IP}:4000${NC}"
echo -e "  Health:    ${YELLOW}http://${VPS_IP}:4000/health${NC}"
echo ""

echo -e "${GREEN}📁 Chemins importants:${NC}"
echo -e "  Projet:    ${YELLOW}${PROJECT_DIR}${NC}"
echo -e "  Config:    ${YELLOW}${PROJECT_DIR}/.env${NC}"
echo -e "  Backups:   ${YELLOW}${PROJECT_DIR}/backups/${NC}"
echo -e "  Logs:      ${YELLOW}${PROJECT_DIR}/logs/${NC}"
echo ""

echo -e "${GREEN}🐳 État des services:${NC}"
cd "$PROJECT_DIR" && docker-compose ps
echo ""

echo -e "${GREEN}🛠️  Commandes rapides:${NC}"
echo -e "  ${YELLOW}cd ~/ha-dashboard${NC}                              - Aller au projet"
echo -e "  ${YELLOW}docker-compose logs -f${NC}                         - Voir les logs"
echo -e "  ${YELLOW}docker-compose restart${NC}                         - Redémarrer"
echo -e "  ${YELLOW}./backup-db.sh${NC}                                 - Backup DB"
echo -e "  ${YELLOW}git pull && docker-compose up -d --build${NC}       - Mettre à jour"
echo ""

echo -e "${BLUE}📚 Documentation: ${YELLOW}https://github.com/EmilieCLARY/ha-dashboard${NC}"
echo ""
