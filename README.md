# DocVault

Application SaaS de gestion de documents personnels sécurisée. Stockez, organisez et protégez vos documents importants avec des rappels automatiques et un partage sécurisé.

## 🏗 Architecture

Le projet est maintenant structuré en **Backend/Frontend séparés** :

```
DocVault/
├── backend/     # API Node.js/Express + Supabase
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middleware d'authentification
│   │   ├── services/       # Services métier
│   │   ├── config/         # Configuration (Supabase, etc.)
│   │   └── utils/          # Utilitaires
│   └── package.json
└── frontend/    # Interface Next.js
    ├── src/
    │   ├── app/           # Pages Next.js App Router
    │   ├── components/    # Composants React
    │   ├── services/      # Services API (axios)
    │   └── lib/          # Utilitaires frontend
    └── package.json
```

## 🚀 Installation & Démarrage

### 1. Backend (Port 8000)

```bash
cd backend
npm install
cp .env.example .env
# Configurez les variables d'environnement dans backend/.env
npm run dev
```

### 2. Frontend (Port 3000)

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configurez les variables d'environnement dans frontend/.env.local
npm run dev
```

### 3. Variables d'environnement

**Backend (.env) :**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=8000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_for_documents
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local) :**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
ENCRYPTION_KEY=your_encryption_key_for_documents
```

## 🔧 Stack Technique

### Backend
- **Framework** : Express.js
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (MVP - JWT simplifié)
- **Upload fichiers** : Multer + Supabase Storage
- **Validation** : Zod
- **Sécurité** : Helmet, CORS

### Frontend
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : shadcn/ui
- **Client Supabase** : @supabase/supabase-js
- **Form Validation** : React Hook Form + Zod
- **MVP Features** : Auth basique, Upload simple, CRUD documents

## 📡 API Routes

### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Déconnexion
- `POST /api/auth/reset-password` - Reset mot de passe
- `POST /api/auth/update-password` - Mise à jour mot de passe

### Documents
- `GET /api/documents` - Liste des documents
- `GET /api/documents/:id` - Détails d'un document
- `POST /api/documents` - Upload d'un document
- `PUT /api/documents/:id` - Mise à jour d'un document
- `DELETE /api/documents/:id` - Suppression d'un document
- `POST /api/documents/:id/share` - Génération de lien de partage

### Profil
- `GET /api/profiles` - Profil utilisateur
- `PUT /api/profiles` - Mise à jour du profil
- `GET /api/profiles/stats` - Statistiques utilisateur

## 🔐 Authentification (MVP Simplifié)

L'authentification utilise un système simplifié pour le MVP :
1. **Supabase Auth** côté backend pour la validation des utilisateurs
2. **Access tokens** Supabase côté client
3. **Middleware Express** simplifié (Supabase uniquement)
4. **Middleware Next.js** désactivé pour MVP (garde côté client)

## 📦 Scripts Disponibles

### Backend
```bash
npm run dev      # Développement avec nodemon
npm start        # Production
npm test         # Tests (à configurer)
```

### Frontend
```bash
npm run dev      # Développement Next.js
npm run build    # Build production
npm start        # Serveur production
npm run lint     # Linting ESLint
npm run type-check # Vérification TypeScript
```

## 🚦 État du Projet (MVP)

✅ **MVP Complété :**
- Architecture backend/frontend nettoyée
- Auth middleware backend simplifié (Supabase uniquement)
- Frontend middleware désactivé pour MVP
- Suppression des fonctionnalités non-MVP (sharing, notifications, reminders)
- Chiffrement simplifié (base64 encoding pour MVP)
- TypeScript errors corrigées
- Build et lint qui passent
- Documentation mise à jour

🔄 **MVP En cours :**
- Tests de fonctionnement e2e (signup → upload → list → delete)

⏳ **Post-MVP :**
- Vraie encryption côté client
- Partage de documents public
- Notifications et rappels
- Statistiques avancées
- Tests automatisés
- CI/CD et déploiement

## 🛠 Développement

### Démarrage rapide
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Structure de développement recommandée
1. Développer les nouvelles features côté backend d'abord
2. Tester les endpoints avec un client REST (Postman/Insomnia)
3. Implémenter côté frontend avec les services API
4. Tester l'intégration complète

## 📄 Licence

Ce projet est sous licence ISC.

---

Développé avec ❤️ pour simplifier la gestion de documents personnels.