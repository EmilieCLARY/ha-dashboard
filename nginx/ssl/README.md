# Nginx SSL Certificates

Ce dossier contiendra vos certificats SSL pour la production.

## Configuration Let's Encrypt avec Certbot

### Installation sur le VPS

```bash
# Installer certbot
sudo apt update
sudo apt install certbot

# Obtenir un certificat
sudo certbot certonly --standalone -d votre-domaine.com

# Les certificats seront dans:
# /etc/letsencrypt/live/votre-domaine.com/
```

### Copier les certificats

```bash
# Copier dans le projet
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ./nginx/ssl/
sudo chown $USER:$USER ./nginx/ssl/*.pem
```

### Renouvellement automatique

```bash
# Ajouter au crontab
sudo crontab -e

# Ajouter cette ligne pour renouveler tous les mois
0 0 1 * * certbot renew --quiet && docker-compose restart nginx
```

## Alternative: Certificats auto-signés (développement)

```bash
# Générer des certificats auto-signés pour le développement
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out ./nginx/ssl/fullchain.pem \
  -subj "/C=FR/ST=France/L=Paris/O=Dev/CN=localhost"
```

**Note:** Ne pas utiliser en production !
