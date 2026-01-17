#!/bin/sh

# Tentative de build TypeScript
npx tsc --noEmit false 2>&1 | tee build.log

# Vérifier si des fichiers .js ont été générés
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build réussi - fichiers générés dans dist/"
    exit 0
else
    echo "❌ Build échoué - aucun fichier généré"
    exit 1
fi
