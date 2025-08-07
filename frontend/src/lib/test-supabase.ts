import { createClient } from './supabase/client'

const supabase = createClient()

export async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...')
  
  try {
    // Test 1: Vérifier les variables d'environnement
    console.log('📋 Variables d\'environnement:')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurée' : '❌ Manquante')
    console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante')
    
    // Test 2: Tenter une requête sur la table documents
    console.log('📄 Test de requête sur la table documents...')
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Erreur Supabase:', error.message)
      console.error('Code:', error.code)
      console.error('Détails:', error.details)
      return false
    }
    
    console.log('✅ Connexion Supabase réussie!')
    console.log('📊 Données récupérées:', data?.length || 0, 'documents')
    console.log('📋 Premiers documents:', data?.slice(0, 2))
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors du test Supabase:', error)
    return false
  }
}

// Fonction pour tester d'autres tables si documents n'existe pas
export async function testAlternativeTables() {
  const tables = ['users', 'profiles', 'documents', 'files', 'uploads']
  
  for (const table of tables) {
    try {
      console.log(`🔍 Test de la table ${table}...`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ Table ${table} accessible!`)
        console.log(`📊 Données:`, data)
        return { success: true, table, data }
      } else {
        console.log(`❌ Table ${table} non accessible:`, error.message)
      }
    } catch (error) {
      console.log(`❌ Erreur avec la table ${table}:`, error)
    }
  }
  
  return { success: false, message: 'Aucune table accessible trouvée' }
}
