'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { differenceInDays } from 'date-fns'

type Document = Database['public']['Tables']['documents']['Row']

export interface ReminderDocument {
  document: Document
  daysUntilExpiry: number
  urgencyLevel: 'expired' | 'urgent' | 'warning' | 'normal'
}

export interface ReminderStats {
  total: number
  expired: number
  urgent: number
  warning: number
}

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderDocument[]>([])
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    expired: 0,
    urgent: 0,
    warning: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getUrgencyLevel = (daysUntilExpiry: number): ReminderDocument['urgencyLevel'] => {
    if (daysUntilExpiry < 0) return 'expired'
    if (daysUntilExpiry <= 7) return 'urgent'
    if (daysUntilExpiry <= 30) return 'warning'
    return 'normal'
  }

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non authentifié')
      }

      // Fetch documents with expiry dates
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Process documents into reminders
      const reminderDocuments: ReminderDocument[] = (data || [])
        .map(document => {
          const daysUntilExpiry = differenceInDays(new Date(document.expiry_date!), today)
          return {
            document,
            daysUntilExpiry,
            urgencyLevel: getUrgencyLevel(daysUntilExpiry)
          }
        })
        .filter(({ daysUntilExpiry }) => {
          // Only show documents that are expired or expiring within 90 days
          return daysUntilExpiry <= 90
        })
        .sort((a, b) => {
          // Sort by urgency first, then by days until expiry
          const urgencyOrder = { expired: 0, urgent: 1, warning: 2, normal: 3 }
          if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
            return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
          }
          return a.daysUntilExpiry - b.daysUntilExpiry
        })

      // Calculate stats
      const reminderStats: ReminderStats = {
        total: reminderDocuments.length,
        expired: reminderDocuments.filter(r => r.urgencyLevel === 'expired').length,
        urgent: reminderDocuments.filter(r => r.urgencyLevel === 'urgent').length,
        warning: reminderDocuments.filter(r => r.urgencyLevel === 'warning').length
      }

      setReminders(reminderDocuments)
      setStats(reminderStats)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des rappels')
      console.error('Error fetching reminders:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchReminders()

    // Listen for changes in documents table
    const channel = supabase
      .channel('reminders_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents'
        },
        () => {
          // Refetch reminders when documents change
          fetchReminders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReminders, supabase])

  // Get reminders by urgency level
  const getRemindersByUrgency = (urgencyLevel: ReminderDocument['urgencyLevel']) => {
    return reminders.filter(reminder => reminder.urgencyLevel === urgencyLevel)
  }

  // Get top priority reminders (expired and urgent)
  const getTopPriorityReminders = () => {
    return reminders.filter(reminder => 
      reminder.urgencyLevel === 'expired' || reminder.urgencyLevel === 'urgent'
    )
  }

  // Check if there are any urgent reminders
  const hasUrgentReminders = () => {
    return stats.expired > 0 || stats.urgent > 0
  }

  // Mark reminder as dismissed (local state only)
  const dismissReminder = (documentId: string) => {
    setReminders(prev => prev.filter(r => r.document.id !== documentId))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      // Note: This is a simplified update. In a real app, you'd track the specific urgency level
    }))
  }

  // Refresh reminders manually
  const refreshReminders = () => {
    fetchReminders()
  }

  return {
    reminders,
    stats,
    loading,
    error,
    getRemindersByUrgency,
    getTopPriorityReminders,
    hasUrgentReminders,
    dismissReminder,
    refreshReminders
  }
}

// Hook for browser notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!supported) {
      return 'denied'
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') {
      return null
    }

    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
  }

  const showReminderNotification = (reminder: ReminderDocument) => {
    const { document, daysUntilExpiry, urgencyLevel } = reminder
    
    let title = ''
    let body = ''
    const icon = '/favicon.ico'

    switch (urgencyLevel) {
      case 'expired':
        title = '🚨 Document expiré'
        body = `${document.title} a expiré depuis ${Math.abs(daysUntilExpiry)} jour(s)`
        break
      case 'urgent':
        title = '⚠️ Document expire bientôt'
        body = `${document.title} expire dans ${daysUntilExpiry} jour(s)`
        break
      case 'warning':
        title = '📅 Rappel d\'expiration'
        body = `${document.title} expire dans ${daysUntilExpiry} jours`
        break
      default:
        return null
    }

    return showNotification(title, {
      body,
      icon,
      tag: `reminder_${document.id}`,
      requireInteraction: urgencyLevel === 'expired' || urgencyLevel === 'urgent'
    })
  }

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    showReminderNotification
  }
}