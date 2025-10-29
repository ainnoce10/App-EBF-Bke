#!/bin/bash

# Script de configuration pour Railway
# Ce script est exécuté pendant le déploiement

echo "🚀 Début de la configuration pour Railway..."

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p /app/data
mkdir -p /app/public/uploads/audio
mkdir -p /app/public/uploads/photos

# Vérifier si la base de données existe, sinon la créer
if [ ! -f "/app/data/custom.db" ]; then
    echo "🗄️ Création de la base de données..."
    touch /app/data/custom.db
fi

# Générer le client Prisma
echo "⚙️ Génération du client Prisma..."
npx prisma generate

# Pousser le schéma de la base de données
echo "📤 Poussage du schéma de la base de données..."
npx prisma db push

echo "✅ Configuration terminée avec succès!"