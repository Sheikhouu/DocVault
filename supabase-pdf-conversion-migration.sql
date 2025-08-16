-- Migration Supabase pour la conversion PDF - DocVault
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes pour la conversion PDF à la table documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS converted_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'converting', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS conversion_error TEXT,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- 2. Supprimer les colonnes d'expiration si elles existent (optionnel)
-- ALTER TABLE documents DROP COLUMN IF EXISTS expiry_date;
-- ALTER TABLE documents DROP COLUMN IF EXISTS reminder_date;

-- 3. Ajouter des index pour optimiser les requêtes de conversion
CREATE INDEX IF NOT EXISTS idx_documents_conversion_status ON documents(conversion_status);
CREATE INDEX IF NOT EXISTS idx_documents_user_conversion ON documents(user_id, conversion_status);

-- 4. Créer une fonction pour mettre à jour le statut de conversion
CREATE OR REPLACE FUNCTION update_conversion_status(
  document_id UUID,
  new_status TEXT,
  pdf_url TEXT DEFAULT NULL,
  error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE documents 
  SET 
    conversion_status = new_status,
    converted_pdf_url = CASE WHEN pdf_url IS NOT NULL THEN pdf_url ELSE converted_pdf_url END,
    conversion_error = error_message,
    converted_at = CASE WHEN new_status = 'completed' THEN NOW() ELSE converted_at END,
    updated_at = NOW()
  WHERE id = document_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer une vue pour les documents avec métadonnées de conversion
CREATE OR REPLACE VIEW documents_with_conversion AS
SELECT 
  d.*,
  CASE 
    WHEN d.conversion_status = 'completed' AND d.converted_pdf_url IS NOT NULL THEN true 
    ELSE false 
  END as has_pdf_conversion,
  CASE 
    WHEN d.conversion_status = 'pending' THEN 'En attente'
    WHEN d.conversion_status = 'converting' THEN 'Conversion en cours'
    WHEN d.conversion_status = 'completed' THEN 'Terminé'
    WHEN d.conversion_status = 'failed' THEN 'Échec'
    ELSE 'Inconnu'
  END as conversion_status_label
FROM documents d;

-- 6. Trigger pour déclencher la conversion automatiquement après l'insertion
CREATE OR REPLACE FUNCTION trigger_pdf_conversion()
RETURNS TRIGGER AS $$
BEGIN
  -- Déclencher la conversion seulement pour les nouveaux documents
  IF TG_OP = 'INSERT' THEN
    -- Ici on pourrait appeler un webhook n8n ou une fonction edge
    -- Pour l'instant on met juste le statut à 'pending'
    NEW.conversion_status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger
DROP TRIGGER IF EXISTS trigger_pdf_conversion_on_insert ON documents;
CREATE TRIGGER trigger_pdf_conversion_on_insert
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_pdf_conversion();

-- 8. Politique RLS pour la vue
CREATE POLICY "Users can view own documents with conversion" 
ON documents_with_conversion FOR SELECT 
USING (auth.uid() = user_id);

-- 9. Fonction pour obtenir les statistiques de conversion par utilisateur
CREATE OR REPLACE FUNCTION get_user_conversion_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_documents', COUNT(*),
    'pending_conversions', COUNT(*) FILTER (WHERE conversion_status = 'pending'),
    'converting', COUNT(*) FILTER (WHERE conversion_status = 'converting'),
    'completed_conversions', COUNT(*) FILTER (WHERE conversion_status = 'completed'),
    'failed_conversions', COUNT(*) FILTER (WHERE conversion_status = 'failed'),
    'success_rate', 
      CASE 
        WHEN COUNT(*) FILTER (WHERE conversion_status IN ('completed', 'failed')) > 0 
        THEN ROUND(
          (COUNT(*) FILTER (WHERE conversion_status = 'completed')::FLOAT / 
           COUNT(*) FILTER (WHERE conversion_status IN ('completed', 'failed'))::FLOAT) * 100, 2
        )
        ELSE 0 
      END
  ) INTO result
  FROM documents 
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Mettre à jour les documents existants pour initialiser le statut de conversion
UPDATE documents 
SET conversion_status = 'pending' 
WHERE conversion_status IS NULL;

-- Afficher un résumé des modifications
SELECT 
  'Migration PDF conversion terminée' as status,
  COUNT(*) as total_documents,
  COUNT(*) FILTER (WHERE conversion_status = 'pending') as pending_conversions
FROM documents;