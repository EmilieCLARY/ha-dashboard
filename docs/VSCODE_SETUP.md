# 🔧 Configuration VS Code pour WSL

## Problème : Erreurs TypeScript "module path 'react/jsx-runtime' not found"

**Cause :** Les `node_modules` ne sont pas installés localement, VS Code ne peut pas résoudre les types TypeScript.

---

## ✅ Solution : Installer node_modules dans WSL

### Étape 1 : Vérifier que tu es dans WSL

```bash
# Dans ton terminal WSL (pas Windows PowerShell/CMD)
pwd
# Devrait afficher : /home/yuniemos/Repos/ha-dashboard
```

### Étape 2 : Installer les dépendances frontend

```bash
cd /home/yuniemos/Repos/ha-dashboard/frontend
npm install
```

### Étape 3 : Installer les dépendances backend (optionnel)

```bash
cd /home/yuniemos/Repos/ha-dashboard/backend
npm install
```

### Étape 4 : Recharger VS Code

Appuie sur `Ctrl+Shift+P` et tape :
```
Developer: Reload Window
```

---

## 🎯 Vérification

Après le rechargement, les erreurs TypeScript devraient disparaître :
- ✅ Pas d'erreur sur les imports React
- ✅ Autocomplétion fonctionne
- ✅ Types disponibles

---

## 📝 Notes Importantes

### ⚠️ N'utilise PAS npm depuis Windows !

**❌ MAUVAIS** (depuis PowerShell/CMD Windows) :
```bash
npm install  # ❌ Erreur EPERM
```

**✅ BON** (depuis WSL Ubuntu) :
```bash
npm install  # ✅ Fonctionne
```

### 🔍 Comment savoir dans quel terminal tu es ?

**Windows PowerShell/CMD :**
```
PS C:\Users\yunie>
# ou
C:\Users\yunie>
```

**WSL Ubuntu :**
```bash
yuniemos@DESKTOP-QR77CMR:~$
```

### 🐳 Les containers Docker ne sont PAS affectés

Les `node_modules` locaux sont **uniquement pour VS Code**.
Les containers Docker ont leurs propres `node_modules` isolés.

---

## 🚀 Quick Fix (Commandes rapides)

Copie-colle ça dans un terminal **WSL** :

```bash
# Aller dans le projet
cd ~/Repos/ha-dashboard

# Installer frontend
cd frontend && npm install && cd ..

# Installer backend
cd backend && npm install && cd ..

echo "✅ Installation terminée ! Recharge VS Code avec Ctrl+Shift+P > Reload Window"
```

---

## 🆘 Troubleshooting

### Erreur : "npm: command not found" ou npm utilise le chemin Windows

**Symptômes :**
```bash
which npm
# Retourne: /mnt/c/Program Files/nodejs/npm  ❌ MAUVAIS
```

**Solution :** Installer Node.js dans WSL

```bash
# Installer Node.js 20 dans WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Vérifier (devrait afficher /usr/bin/npm)
which npm           # /usr/bin/npm ✅ BON
node --version      # v20.20.0
npm --version       # 10.9.0
```

### Erreur : "EACCES: permission denied" sur node_modules

**Cause :** Le dossier `node_modules` a été créé par Docker avec des permissions root.

**Solution :**
```bash
cd ~/Repos/ha-dashboard/frontend
sudo rm -rf node_modules package-lock.json
npm install

cd ~/Repos/ha-dashboard/backend
sudo rm -rf node_modules package-lock.json
npm install
```

### Les erreurs TypeScript persistent

1. **Supprimer le cache TypeScript**
   ```bash
   cd ~/Repos/ha-dashboard/frontend
   rm -rf node_modules/.cache
   ```

2. **Redémarrer le serveur TypeScript dans VS Code**
   - Ouvre un fichier `.tsx`
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

3. **Vérifier que node_modules existe**
   ```bash
   ls -la ~/Repos/ha-dashboard/frontend/node_modules/@types/react
   # Devrait afficher les fichiers
   ```

### Permission denied sur node_modules

```bash
# Réparer les permissions
cd ~/Repos/ha-dashboard/frontend
sudo chown -R $USER:$USER node_modules
```

---

## 📚 Pourquoi cette solution ?

VS Code a besoin des fichiers de types TypeScript (`@types/react`, etc.) pour :
- ✅ Vérifier le code en temps réel
- ✅ Fournir l'autocomplétion
- ✅ Afficher la documentation au survol
- ✅ Détecter les erreurs avant la compilation

Les containers Docker ont leurs propres `node_modules`, mais VS Code ne peut pas y accéder directement. Il faut donc une copie locale dans WSL.

---

**🎉 Après ces étapes, toutes les erreurs TypeScript devraient disparaître !**
