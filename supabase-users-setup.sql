-- =====================================================
-- Configuration de la table users pour Supabase Auth
-- =====================================================

-- 1. Création de la table users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Activation de Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Politiques de sécurité pour l'accès aux données
-- Politique pour permettre la lecture de ses propres données
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre l'insertion automatique via trigger
CREATE POLICY "Allow insert via trigger" ON users
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour de ses propres données
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Fonction pour le trigger automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour automatiquement créer un profil utilisateur
-- lors de l'inscription via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

-- 7. Commentaires pour la documentation
COMMENT ON TABLE users IS 'Table des profils utilisateurs liée à Supabase Auth';
COMMENT ON COLUMN users.id IS 'ID unique de l''utilisateur (lié à auth.users)';
COMMENT ON COLUMN users.full_name IS 'Nom complet de l''utilisateur';
COMMENT ON COLUMN users.email IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN users.created_at IS 'Date de création du profil';

-- =====================================================
-- Vérification de la configuration
-- =====================================================

-- Afficher les informations de la table créée
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Afficher les politiques RLS créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Afficher les triggers créés
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users';
