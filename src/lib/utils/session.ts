import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }
  
  return user
}

/**
 * Récupère l'utilisateur actuel sans redirection
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Déconnecte l'utilisateur
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/signin')
}

/**
 * Récupère les informations de session
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Vérifie si la session est valide
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession()
  return !!session && (!session.expires_at || new Date(session.expires_at * 1000) > new Date())
} 