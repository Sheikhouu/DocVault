'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ensureUserProfile } from '@/lib/utils/profile'

/**
 * Composant de protection qui s'assure qu'un profil existe pour l'utilisateur connecté
 */
interface ProfileGuardProps {
  children: React.ReactNode
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAndCreateProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/signin')
          return
        }

        // S'assurer que le profil existe
        const result = await ensureUserProfile()
        
        if (!result.success) {
          console.error('Erreur profil:', result.error)
          setError(result.error || 'Erreur lors de la création du profil')
          return
        }

        if (result.created) {
          console.log('Profil créé automatiquement pour:', user.email)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Erreur ProfileGuard:', error)
        setError('Erreur de connexion')
      }
    }

    checkAndCreateProfile()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-destructive">Erreur de profil</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}