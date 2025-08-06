'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FreemiumStatus {
  documentsCount: number
  maxDocuments: number
  canUpload: boolean
  subscriptionTier: 'free' | 'premium' | 'pro'
  isLoading: boolean
  error: string | null
}

/**
 * Hook pour gérer les limites freemium
 * - Utilisateurs gratuits : 5 documents max
 * - Premium/Pro : illimité
 */
export function useFreemium() {
  const [status, setStatus] = useState<FreemiumStatus>({
    documentsCount: 0,
    maxDocuments: 5,
    canUpload: false,
    subscriptionTier: 'free',
    isLoading: true,
    error: null
  })

  const supabase = createClient()

  const checkFreemiumStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }))

      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié')
      }

      // Récupérer le profil avec le tier d'abonnement
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw new Error('Erreur lors de la récupération du profil')
      }

      // Compter les documents de l'utilisateur
      const { count: documentsCount, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        throw new Error('Erreur lors du comptage des documents')
      }

      const tier = profile.subscription_tier as 'free' | 'premium' | 'pro'
      const maxDocs = tier === 'free' ? 5 : Infinity
      const canUpload = tier !== 'free' || (documentsCount || 0) < maxDocs

      setStatus({
        documentsCount: documentsCount || 0,
        maxDocuments: maxDocs,
        canUpload,
        subscriptionTier: tier,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error('Erreur freemium check:', error)
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }

  useEffect(() => {
    checkFreemiumStatus()
  }, [])

  const refreshStatus = () => {
    checkFreemiumStatus()
  }

  const getUpgradeMessage = () => {
    if (status.subscriptionTier !== 'free') return null
    
    const remaining = status.maxDocuments - status.documentsCount
    
    if (remaining <= 0) {
      return {
        type: 'error' as const,
        title: 'Limite atteinte',
        message: 'Vous avez atteint la limite de 5 documents gratuits. Passez à Premium pour un stockage illimité.'
      }
    }
    
    if (remaining <= 2) {
      return {
        type: 'warning' as const,
        title: 'Limite proche',
        message: `Plus que ${remaining} document${remaining > 1 ? 's' : ''} avant d'atteindre votre limite gratuite.`
      }
    }
    
    return null
  }

  return {
    ...status,
    refreshStatus,
    upgradeMessage: getUpgradeMessage()
  }
}