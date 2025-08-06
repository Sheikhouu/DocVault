import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

/**
 * Crée automatiquement un profil utilisateur après l'inscription
 */
export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        subscription_tier: 'free'
      })

    if (error) {
      console.error('Erreur création profil:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur inattendue création profil:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Récupère le profil utilisateur courant
 */
export async function getCurrentUserProfile(): Promise<{ 
  profile: Profile | null; 
  error?: string 
}> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { profile: null, error: 'Utilisateur non connecté' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Erreur récupération profil:', error)
      return { profile: null, error: error.message }
    }

    return { profile }
  } catch (error) {
    console.error('Erreur inattendue récupération profil:', error)
    return { 
      profile: null, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour profil:', error)
      return { success: false, error: error.message }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Erreur inattendue mise à jour profil:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Vérifie si un profil existe pour l'utilisateur courant
 * et le crée si nécessaire (fallback pour les inscriptions ratées)
 */
export async function ensureUserProfile(): Promise<{
  success: boolean;
  profile?: Profile;
  created?: boolean;
  error?: string;
}> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' }
    }

    // Vérifier si le profil existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return { success: true, profile: existingProfile, created: false }
    }

    // Si le profil n'existe pas, le créer
    if (fetchError && fetchError.code === 'PGRST116') { // No rows returned
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
          subscription_tier: 'free'
        })
        .select()
        .single()

      if (createError) {
        console.error('Erreur création profil automatique:', createError)
        return { success: false, error: createError.message }
      }

      return { success: true, profile: newProfile, created: true }
    }

    // Autre erreur
    console.error('Erreur récupération profil:', fetchError)
    return { success: false, error: fetchError?.message || 'Erreur inconnue' }

  } catch (error) {
    console.error('Erreur inattendue ensureUserProfile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
} 