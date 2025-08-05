# Structure du Projet DocVault

## Vue d'ensemble

DocVault est une application SaaS de gestion de documents personnels sécurisée construite avec Next.js 14, TypeScript, Tailwind CSS et Supabase.

## Architecture

### Frontend
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **React Hook Form** + **Zod** pour la validation des formulaires

### Backend
- **Supabase** pour :
  - Base de données PostgreSQL
  - Authentification
  - Stockage de fichiers
  - API REST automatique

## Structure des dossiers

```
docvault/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── (auth)/            # Pages d'authentification (groupes de routes)
│   │   │   ├── login/         # Page de connexion
│   │   │   └── signup/        # Page d'inscription
│   │   ├── dashboard/         # Interface principale
│   │   ├── globals.css        # Styles globaux
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil
│   ├── components/
│   │   ├── ui/               # Composants de base (shadcn/ui)
│   │   │   └── button.tsx    # Composant Button
│   │   ├── forms/            # Formulaires réutilisables
│   │   ├── document/         # Composants liés aux documents
│   │   └── layout/           # Layout et navigation
│   ├── lib/
│   │   ├── supabase/         # Configuration Supabase
│   │   │   ├── client.ts     # Client frontend
│   │   │   └── server.ts     # Client serveur
│   │   ├── utils/            # Utilitaires généraux
│   │   │   └── utils.ts      # Fonction cn() pour les classes CSS
│   │   └── validations/      # Schémas de validation (Zod)
│   │       ├── auth.ts       # Validation authentification
│   │       └── document.ts   # Validation documents
│   └── types/                # Types TypeScript
│       └── index.ts          # Interfaces principales
├── public/                   # Assets statiques
├── docs/                     # Documentation
├── package.json              # Dépendances et scripts
├── tsconfig.json             # Configuration TypeScript
├── tailwind.config.ts        # Configuration Tailwind
├── postcss.config.js         # Configuration PostCSS
├── env.example               # Variables d'environnement d'exemple
└── .gitignore               # Fichiers à ignorer
```

## Fonctionnalités implémentées

### ✅ Terminé
- Configuration Next.js 14 avec TypeScript
- Configuration Tailwind CSS et shadcn/ui
- Configuration Supabase (client/server)
- Structure de base du dashboard
- Types TypeScript complets
- Validation avec Zod
- Pages d'authentification (UI seulement)
- Page d'accueil avec landing page
- Composants UI de base

### 🔄 En cours
- Implémentation des fonctionnalités Supabase Auth
- Gestion des documents (upload, prévisualisation)
- Système de rappels
- Interface de gestion des documents

### ⏳ À venir
- Partage sécurisé de documents
- Système de notifications
- Intégration n8n pour l'automatisation
- Optimisations et tests

## Configuration requise

### Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
ENCRYPTION_KEY=your_encryption_key_for_documents
```

### Base de données Supabase
Le projet nécessite les tables suivantes dans Supabase :
- `profiles` : Profils utilisateurs
- `documents` : Documents stockés

Voir le README.md pour les scripts SQL complets.

## Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer l'application en mode production
- `npm run lint` - Lancer ESLint
- `npm run type-check` - Vérifier les types TypeScript

## Prochaines étapes

1. Configurer un projet Supabase
2. Implémenter l'authentification complète
3. Créer les API routes pour la gestion des documents
4. Implémenter le système de chiffrement
5. Ajouter les fonctionnalités de partage
6. Tester et optimiser 