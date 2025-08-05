# DocVault

Application SaaS de gestion de documents personnels sécurisée. Stockez, organisez et protégez vos documents importants avec des rappels automatiques et un partage sécurisé.

## 🚀 Fonctionnalités

- **Stockage sécurisé** : Chiffrement des documents avant stockage
- **Organisation intuitive** : Catégories, tags et recherche avancée
- **Rappels automatiques** : Alertes pour les documents à renouveler
- **Partage sécurisé** : Liens temporaires avec contrôle d'accès
- **Interface mobile-first** : Optimisé pour les appareils mobiles
- **Modèle freemium** : 5 documents gratuits, puis abonnement

## 🛠 Stack technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, API)
- **UI Components** : shadcn/ui
- **Validation** : Zod + React Hook Form
- **Authentification** : Supabase Auth
- **Déploiement** : Vercel

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd docvault
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration des variables d'environnement**
   
   Copiez `env.example` vers `.env.local` et remplissez les variables :
   ```bash
   cp env.example .env.local
   ```
   
   Variables requises :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ENCRYPTION_KEY=your_encryption_key_for_documents
   ```

4. **Configurer Supabase**
   
   Créez les tables suivantes dans votre base Supabase :
   
   ```sql
   -- Profils utilisateurs
   CREATE TABLE profiles (
     id uuid REFERENCES auth.users(id) PRIMARY KEY,
     email text,
     full_name text,
     avatar_url text,
     subscription_tier text DEFAULT 'free',
     created_at timestamptz DEFAULT now()
   );

   -- Documents
   CREATE TABLE documents (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     title text NOT NULL,
     description text,
     category text,
     file_path text,
     file_size bigint,
     mime_type text,
     expiry_date date,
     tags text[],
     is_encrypted boolean DEFAULT true,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   -- Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```
   
   L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
docvault/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── (auth)/            # Pages d'authentification
│   │   ├── dashboard/         # Interface principale
│   │   └── globals.css        # Styles globaux
│   ├── components/
│   │   ├── ui/               # Composants de base (shadcn/ui)
│   │   ├── forms/            # Formulaires
│   │   ├── document/         # Composants liés aux documents
│   │   └── layout/           # Layout et navigation
│   ├── lib/
│   │   ├── supabase/         # Configuration Supabase
│   │   ├── utils/            # Utilitaires généraux
│   │   └── validations/      # Schémas de validation (Zod)
│   └── types/                # Types TypeScript
├── public/                   # Assets statiques
└── docs/                     # Documentation
```

## 🔧 Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm run start` - Démarrer l'application en mode production
- `npm run lint` - Lancer ESLint
- `npm run type-check` - Vérifier les types TypeScript

## 🚦 État du projet

✅ **Complété :**
- Configuration Next.js 14 avec TypeScript
- Configuration Tailwind CSS et shadcn/ui
- Configuration Supabase (client/server)
- Système d'authentification complet (login, signup, reset)
- Middleware d'authentification
- Pages d'authentification avec validation
- Structure de base du dashboard
- Types TypeScript complets
- Validation avec Zod

🔄 **En cours :**
- Implémentation des fonctionnalités Supabase Auth
- Gestion des documents (upload, prévisualisation)
- Système de rappels
- Interface de gestion des documents

⏳ **À venir :**
- Partage sécurisé de documents
- Système de notifications
- Intégration n8n pour l'automatisation
- Optimisations et tests

## 📄 Licence

Ce projet est sous licence ISC.

---

Développé avec ❤️ pour simplifier la gestion de documents personnels.