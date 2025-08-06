'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, AlertTriangle, Clock, X } from 'lucide-react'

type Document = Database['public']['Tables']['documents']['Row']

interface DocumentReminderProps {
  document: Document
  daysUntilExpiry: number
  onDismiss: (documentId: string) => void
  onRenew: (document: Document) => void
}

const categoryLabels: Record<string, string> = {
  identity: 'Identité',
  education: 'Éducation',
  employment: 'Emploi',
  housing: 'Logement',
  financial: 'Financier',
  health: 'Santé',
  legal: 'Juridique',
  other: 'Autre'
}

function DocumentReminder({ document, daysUntilExpiry, onDismiss, onRenew }: DocumentReminderProps) {
  const isExpired = daysUntilExpiry < 0
  const isUrgent = daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  
  return (
    <Card className={`relative ${
      isExpired ? 'border-red-500 bg-red-50' : 
      isUrgent ? 'border-orange-500 bg-orange-50' : 
      'border-yellow-500 bg-yellow-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {isExpired ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : isUrgent ? (
                <Clock className="h-5 w-5 text-orange-600" />
              ) : (
                <Bell className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{document.title}</CardTitle>
              <CardDescription className="text-sm">
                {categoryLabels[document.category || 'other']}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isExpired ? 'destructive' : isUrgent ? 'secondary' : 'secondary'}>
              {isExpired ? 'Expiré' : isUrgent ? 'Urgent' : 'Bientôt'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(document.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm">
            <p className={`font-medium ${
              isExpired ? 'text-red-700' : 
              isUrgent ? 'text-orange-700' : 
              'text-yellow-700'
            }`}>
              {isExpired 
                ? `Expiré depuis ${Math.abs(daysUntilExpiry)} jour${Math.abs(daysUntilExpiry) > 1 ? 's' : ''}`
                : daysUntilExpiry === 0
                ? 'Expire aujourd\'hui'
                : `Expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`
              }
            </p>
            {document.expiry_date && (
              <p className="text-gray-600 mt-1">
                Date d'expiration : {new Date(document.expiry_date).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
          
          {document.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {document.description}
            </p>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onRenew(document)}
              className={
                isExpired ? 'bg-red-600 hover:bg-red-700' :
                isUrgent ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              }
            >
              {isExpired ? 'Renouveler maintenant' : 'Programmer renouvellement'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Open document preview
                console.log('View document:', document.id)
              }}
            >
              Voir le document
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DocumentRemindersProps {
  className?: string
  showAll?: boolean
}

export function DocumentReminders({ className = '', showAll = false }: DocumentRemindersProps) {
  const [reminders, setReminders] = useState<Array<{ document: Document; daysUntilExpiry: number }>>([])
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })

      if (error) throw error

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const documentReminders = (data || [])
        .map(document => ({
          document,
          daysUntilExpiry: differenceInDays(new Date(document.expiry_date!), today)
        }))
        .filter(({ daysUntilExpiry }) => {
          // Show expired documents and documents expiring in the next 30 days
          return daysUntilExpiry <= 30
        })
        .filter(({ document }) => !Array.from(dismissedReminders).includes(document.id))

      // Sort by urgency: expired first, then by days until expiry
      documentReminders.sort((a, b) => {
        if (a.daysUntilExpiry < 0 && b.daysUntilExpiry >= 0) return -1
        if (a.daysUntilExpiry >= 0 && b.daysUntilExpiry < 0) return 1
        return a.daysUntilExpiry - b.daysUntilExpiry
      })

      setReminders(showAll ? documentReminders : documentReminders.slice(0, 5))
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()

    // Listen for changes in documents
    const channel = supabase
      .channel('reminders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'documents' },
        () => {
          fetchReminders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [showAll, dismissedReminders])

  const handleDismissReminder = (documentId: string) => {
    setDismissedReminders(prev => new Set([...Array.from(prev), documentId]))
  }

  const handleRenewDocument = (document: Document) => {
    // TODO: Implement renewal flow
    console.log('Renew document:', document.id)
    // For now, just open a modal or redirect to edit page
    alert(`Fonctionnalité de renouvellement à implémenter pour: ${document.title}`)
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold mb-2">Aucun rappel en cours</h3>
            <p className="text-gray-600">
              Tous vos documents sont à jour ou n'ont pas de date d'expiration.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reminders.map(({ document, daysUntilExpiry }) => (
        <DocumentReminder
          key={document.id}
          document={document}
          daysUntilExpiry={daysUntilExpiry}
          onDismiss={handleDismissReminder}
          onRenew={handleRenewDocument}
        />
      ))}
      
      {!showAll && reminders.length >= 5 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Et {reminders.length - 5} autre{reminders.length - 5 > 1 ? 's' : ''} rappel{reminders.length - 5 > 1 ? 's' : ''}...
              </p>
              <Button variant="outline" size="sm">
                Voir tous les rappels
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}