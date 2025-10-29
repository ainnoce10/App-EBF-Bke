# EBF - Application de Gestion des Demandes d'Intervention Électrique

## Déploiement sur Railway

Ce guide vous explique comment déployer cette application Next.js sur Railway.

### Prérequis

- Un compte Railway ([railway.app](https://railway.app))
- Un dépôt Git avec votre code source
- Node.js 18+ (localement pour le développement)

### Étape 1: Préparation du dépôt Git

1. **Initialiser le dépôt Git** (si ce n'est pas déjà fait) :
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Créer un dépôt distant** :
   - Allez sur [GitHub](https://github.com), [GitLab](https://gitlab.com) ou [Bitbucket](https://bitbucket.org)
   - Créez un nouveau dépôt
   - Suivez les instructions pour lier votre dépôt local

3. **Pousser votre code** :
```bash
git remote add origin <votre-url-depot>
git push -u origin main
```

### Étape 2: Configuration sur Railway

1. **Connectez-vous à Railway** :
   - Allez sur [railway.app](https://railway.app)
   - Connectez-vous avec votre compte GitHub/GitLab

2. **Créez un nouveau projet** :
   - Cliquez sur "New Project"
   - Choisissez "Deploy from GitHub repo"
   - Sélectionnez votre dépôt
   - Choisissez la branche (généralement `main` ou `master`)

3. **Configuration des variables d'environnement** :
   Railway détectera automatiquement que c'est une application Node.js
   - Ajoutez les variables suivantes dans les "Variables" :

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:/app/data/custom.db
   NEXT_TELEMETRY_DISABLED=1
   UPLOADS_DIR=/app/public/uploads
   ```

### Étape 3: Configuration du Build

1. **Vérifiez le fichier `railway.toml`** :
   - Le fichier est déjà configuré pour Railway
   - Il inclut les commandes de build et de démarrage
   - Il configure les variables d'environnement par défaut

2. **Le build s'exécutera automatiquement** :
   - Railway exécutera : `chmod +x scripts/railway-setup.sh && ./scripts/railway-setup.sh && npm run build`
   - Le script de configuration va :
     - Créer les répertoires nécessaires
     - Initialiser la base de données SQLite
     - Générer le client Prisma
     - Pousser le schéma de la base de données

### Étape 4: Démarrage de l'application

1. **Commande de démarrage** :
   - Railway utilisera : `npm start`
   - L'application démarrera sur le port 3000

2. **Health Check** :
   - Un endpoint `/api/health` est disponible pour vérifier que tout fonctionne
   - Railway utilisera ce endpoint pour le health check

### Étape 5: Vérification du déploiement

1. **Attendez la fin du build** :
   - Le build prendra quelques minutes
   - Vous pouvez suivre les logs en temps réel

2. **Vérifiez les logs** :
   - Allez dans l'onglet "Logs" de votre projet Railway
   - Cherchez des erreurs éventuelles

3. **Testez l'application** :
   - Cliquez sur l'URL générée par Railway
   - Vérifiez que toutes les fonctionnalités fonctionnent :
     - Page d'accueil
     - Formulaire de signalement
     - Enregistrement audio
     - Soumission des demandes

### Fichiers de configuration importants

#### `railway.toml`
```toml
[build]
command = "chmod +x scripts/railway-setup.sh && ./scripts/railway-setup.sh && npm run build"

[deploy]
startCommand = "npm start"

[env]
NODE_ENV = "production"
PORT = "3000"
DATABASE_URL = "file:/app/data/custom.db"
NEXT_TELEMETRY_DISABLED = "1"

[healthcheck]
path = "/api/health"
interval = "30s"
timeout = "10s"
retries = 3
```

#### `scripts/railway-setup.sh`
```bash
#!/bin/bash
echo "🚀 Début de la configuration pour Railway..."
mkdir -p /app/data /app/public/uploads/audio /app/public/uploads/photos
touch /app/data/custom.db
npx prisma generate
npx prisma db push
echo "✅ Configuration terminée avec succès!"
```

#### `next.config.ts`
- Configuration optimisée pour Railway
- `output: 'standalone'` pour le déploiement
- Headers de sécurité configurés
- Optimisation des images

### Dépannage

#### Problèmes courants

1. **Build échoue** :
   - Vérifiez les logs dans Railway
   - Assurez-vous que toutes les dépendances sont dans `package.json`
   - Vérifiez que le script `railway-setup.sh` est exécutable

2. **Base de données ne fonctionne pas** :
   - Vérifiez que `DATABASE_URL` est correctement configuré
   - Le chemin doit être `file:/app/data/custom.db`
   - Vérifiez les logs pour les erreurs Prisma

3. **Fichiers uploadés ne fonctionnent pas** :
   - Vérifiez que les répertoires `/app/public/uploads` existent
   - Vérifiez les permissions des répertoires

4. **Application ne démarre pas** :
   - Vérifiez le port (doit être 3000)
   - Vérifiez que `npm start` fonctionne correctement
   - Regardez les logs pour des erreurs de démarrage

#### Commandes utiles

Pour tester localement avant le déploiement :
```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Pousser le schéma de la base de données
npm run db:push

# Démarrer en mode développement
npm run dev

# Build pour la production
npm run build
```

### Maintenance

#### Mises à jour

1. **Mettre à jour l'application** :
   - Poussez vos changements sur Git
   - Railway déployera automatiquement

2. **Sauvegardes** :
   - La base de données SQLite est dans `/app/data/custom.db`
   - Les fichiers uploadés sont dans `/app/public/uploads`
   - Railway ne sauvegarde pas automatiquement ces fichiers
   - Configurez des sauvegardes externes si nécessaire

#### Monitoring

- Utilisez les logs de Railway pour le monitoring
- Configurez des alertes pour les erreurs
- Surveillez l'utilisation du disque (pour les uploads)

### Support

Si vous rencontrez des problèmes :

1. Consultez les logs dans Railway
2. Vérifiez la documentation Railway
3. Contactez le support technique

---

**Note** : Cette configuration est optimisée pour Railway et utilise SQLite comme base de données. Pour un environnement de production avec plus de trafic, envisagez d'utiliser une base de données externe comme PostgreSQL.