# 🔒 Configuration SSL avec Let's Encrypt

## 📋 Prérequis

- Nom de domaine : **yuniemos.fr** ✅
- Sous-domaine souhaité : **dashboard.yuniemos.fr**
- VPS accessible : **37.60.227.46** ✅

## 🌐 Étape 1 : Configuration DNS

### Chez votre registrar (OVH, Cloudflare, etc.)

Ajoutez ces enregistrements DNS :

```
Type: A
Nom: dashboard
Valeur: 37.60.227.46
TTL: 300 (ou Auto)
```

**Résultat** : dashboard.yuniemos.fr pointera vers votre VPS

### Vérifier la propagation DNS

Attendez 5-30 minutes puis testez :

```bash
# Depuis votre machine locale
nslookup dashboard.yuniemos.fr
# ou
dig dashboard.yuniemos.fr

# Devrait retourner : 37.60.227.46
```

## 🔧 Étape 2 : Installation SSL sur le VPS

### Connectez-vous au VPS

```bash
ssh root@37.60.227.46
cd ~/ha-dashboard
```

### Lancez le script d'installation SSL

```bash
# Rendre le script exécutable
chmod +x scripts/setup-ssl.sh

# Lancer l'installation
./scripts/setup-ssl.sh dashboard.yuniemos.fr
```

Le script va :
1. ✅ Installer Certbot
2. ✅ Configurer nginx temporairement pour validation
3. ✅ Obtenir le certificat SSL
4. ✅ Configurer nginx avec HTTPS
5. ✅ Configurer le renouvellement automatique

### Ou installation manuelle

Si vous préférez le faire manuellement :

```bash
# 1. Installer Certbot
sudo apt update
sudo apt install -y certbot

# 2. Créer le dossier pour les challenges
sudo mkdir -p /var/www/certbot

# 3. Arrêter nginx temporairement
docker-compose stop nginx

# 4. Obtenir le certificat
sudo certbot certonly --standalone \
  -d dashboard.yuniemos.fr \
  --non-interactive \
  --agree-tos \
  --email votre-email@example.com

# 5. Copier les certificats dans le projet
sudo cp /etc/letsencrypt/live/dashboard.yuniemos.fr/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/dashboard.yuniemos.fr/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem

# 6. Mettre à jour nginx avec SSL
# (utilisez la config nginx-with-ssl.conf préparée)
cp nginx/nginx-with-ssl.conf nginx/nginx.conf

# 7. Mettre à jour le domaine dans la config
sed -i 's/dashboard.yuniemos.fr/dashboard.yuniemos.fr/g' nginx/nginx.conf

# 8. Redémarrer nginx
docker-compose up -d nginx
```

## 🔄 Étape 3 : Renouvellement automatique

Le certificat Let's Encrypt expire tous les **90 jours**.

### Configurer le renouvellement automatique

```bash
# Créer un script de renouvellement
sudo nano /etc/cron.d/certbot-renew
```

Ajoutez :

```bash
# Renouveler le certificat tous les jours à 3h du matin
0 3 * * * root certbot renew --quiet --deploy-hook "cd /root/ha-dashboard && cp /etc/letsencrypt/live/dashboard.yuniemos.fr/*.pem nginx/ssl/ && docker-compose restart nginx"
```

### Ou utilisez le script fourni

```bash
# Installer le cron job automatiquement
sudo bash scripts/setup-ssl-renewal.sh dashboard.yuniemos.fr
```

## ✅ Étape 4 : Vérification

### Tester HTTPS

```bash
# Depuis le VPS
curl -I https://dashboard.yuniemos.fr

# Devrait retourner : HTTP/2 200
```

### Tester depuis le navigateur

Ouvrez : **https://dashboard.yuniemos.fr**

Vous devriez voir :
- ✅ Cadenas vert dans la barre d'adresse
- ✅ "Connexion sécurisée"
- ✅ Certificat valide

### Tester le renouvellement

```bash
# Dry-run du renouvellement (ne renouvelle pas vraiment)
sudo certbot renew --dry-run

# Devrait afficher : Congratulations, all renewals succeeded
```

## 🔍 Dépannage

### Le certificat n'a pas pu être obtenu

**Erreur** : "Failed to verify domain"

**Causes possibles** :
1. DNS pas encore propagé → Attendez 30 minutes de plus
2. Port 80 bloqué → Vérifiez le firewall : `sudo ufw allow 80/tcp`
3. Nginx tourne encore → Arrêtez-le : `docker-compose stop nginx`

### Vérifier les logs Certbot

```bash
sudo cat /var/log/letsencrypt/letsencrypt.log
```

### Vérifier que nginx fonctionne avec SSL

```bash
docker-compose logs nginx

# Devrait montrer : "Server is ready"
# PAS d'erreur SSL
```

### Forcer le renouvellement

```bash
sudo certbot renew --force-renewal
sudo cp /etc/letsencrypt/live/dashboard.yuniemos.fr/*.pem ~/ha-dashboard/nginx/ssl/
docker-compose restart nginx
```

## 📊 Informations sur le certificat

### Voir les détails du certificat

```bash
sudo certbot certificates
```

### Date d'expiration

```bash
echo | openssl s_client -servername dashboard.yuniemos.fr -connect dashboard.yuniemos.fr:443 2>/dev/null | openssl x509 -noout -dates
```

## 🎯 Checklist finale

- [ ] DNS configuré (dashboard.yuniemos.fr → 37.60.227.46)
- [ ] DNS propagé (nslookup fonctionne)
- [ ] Certbot installé sur le VPS
- [ ] Certificat obtenu avec succès
- [ ] Nginx configuré avec SSL
- [ ] HTTPS fonctionne dans le navigateur
- [ ] Renouvellement automatique configuré
- [ ] Dry-run du renouvellement réussi

## 🔗 Ressources

- [Documentation Let's Encrypt](https://letsencrypt.org/docs/)
- [Documentation Certbot](https://certbot.eff.org/)
- [Test SSL](https://www.ssllabs.com/ssltest/)
