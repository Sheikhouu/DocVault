# Guide de démarrage - DocVault

## 🎯 Vue d'ensemble

DocVault est une application SaaS moderne construite avec Next.js 14 et Supabase. Ce guide vous aidera à configurer rapidement l'environnement de développement et à comprendre l'architecture.

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Supabase
- Git

## 🚀 Démarrage rapide

### 1. Configuration initiale

```bash
# Cloner et installer
git clone <repository-url>
cd docvault
npm install

# Copier les variables d'environnement
cp env.example .env.local
```

### 2. Configuration Supabase

1. **Créer un nouveau projet** sur [supabase.com](https://supabase.com)
2. **Récupérer les clés** dans Settings > API
3. **Mettre à jour .env.local** avec vos clés

### 3. Créer les tables de base

Exécutez ce SQL dans votre éditeur Supabase :

```sql
-- Profils utilisateurs (extension du système auth de Supabase)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

-- Documents principaux
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

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Politiques de sécurité pour documents
CREATE POLICY "Users can view own documents" ON documents 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents 
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Démarrer l'application

```bash
npm run dev
```

Visitez [http://localhost:3000](http://localhost:3000)

## 🏗 Architecture du projet

### Structure des dossiers

```
src/
├── app/                     # App Router Next.js 14
│   ├── (auth)/             # Groupe de routes d'authentification
│   │   ├── signin/         # Page de connexion
│   │   ├── signup/         # Page d'inscription  
│   │   └── reset-password/ # Réinitialisation mot de passe
│   ├── dashboard/          # Interface principale
│   ├── layout.tsx          # Layout racine
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── components/
│   ├── ui/                # Composants de base (shadcn/ui)
│   ├── forms/             # Formulaires spécialisés
│   ├── document/          # Composants liés aux documents
│   └── layout/            # Composants de layout
├── lib/
│   ├── supabase/          # Configuration Supabase
│   │   ├── client.ts      # Client côté navigateur
│   │   └── server.ts      # Client côté serveur
│   ├── utils/             # Fonctions utilitaires
│   └── validations/       # Schémas Zod
└── types/                 # Types TypeScript
```

### Technologies clés

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **shadcn/ui** : Composants UI réutilisables
- **Supabase** : Backend-as-a-Service (BaaS)
- **Zod** : Validation de schémas
- **React Hook Form** : Gestion des formulaires

## 🔐 Authentification

L'authentification utilise Supabase Auth avec :

- **Middleware Next.js** : Protection des routes automatique
- **Row Level Security** : Sécurité au niveau base de données
- **Validation Zod** : Validation côté client et serveur

### Flux d'authentification

1. Utilisateur soumet le formulaire
2. Validation côté client (Zod)
3. Appel API Supabase Auth
4. Middleware redirige selon l'état
5. RLS applique les politiques

## 🎨 Système de design

### Couleurs principales

- **Primary** : Vert (sécurité, confiance)
- **Secondary** : Bleu (professionnalisme)
- **Accent** : Variables selon le contexte

### Composants UI

Tous les composants suivent le pattern shadcn/ui :
- Variants avec `class-variance-authority`
- Théming avec CSS variables
- Accessibilité intégrée

## 📱 Responsive Design

L'application suit une approche mobile-first :

```css
/* Mobile par défaut */
.container { /* styles mobile */ }

/* Tablette et plus */
@media (min-width: 768px) { /* styles md: */ }

/* Desktop */
@media (min-width: 1024px) { /* styles lg: */ }
```

## 🛠 Développement

### Scripts utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Vérification types
npm run type-check

# Linting
npm run lint
```

### Workflow recommandé

1. **Créer une branche** pour chaque fonctionnalité
2. **Suivre les conventions** de nommage
3. **Valider les types** avant commit
4. **Tester sur mobile** et desktop

## 🔍 Debugging

### Variables d'environnement

Vérifiez que toutes les variables sont définies :

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Logs Supabase

Consultez les logs dans le dashboard Supabase pour débugger les requêtes.

### DevTools Next.js

Utilisez les DevTools Next.js pour analyser les performances.

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter ma fonctionnalité'`)
4. Push la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

---

🎉 **Félicitations !** Vous êtes prêt à développer sur DocVault. 