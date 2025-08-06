'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReminders } from '@/lib/hooks/use-reminders'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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

interface RemindersWidgetProps {
  className?: string
}

export function RemindersWidget({ className = '' }: RemindersWidgetProps) {
  const { reminders, stats, loading, hasUrgentReminders } = useReminders()

  // Get top 3 most urgent reminders for the widget
  const topReminders = reminders.slice(0, 3)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Rappels
          </CardTitle>
          <CardDescription>
            Vos documents sont à jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm text-gray-600">
              Aucun document n'expire prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} ${hasUrgentReminders() ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {hasUrgentReminders() ? (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              ) : (
                <Bell className="h-5 w-5 text-blue-600" />
              )}
              Rappels
              {hasUrgentReminders() && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {stats.expired + stats.urgent}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {stats.total} document{stats.total > 1 ? 's' : ''} à surveiller
            </CardDescription>
          </div>
          
          <Link href="/dashboard/reminders">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {topReminders.map(({ document, daysUntilExpiry, urgencyLevel }) => {
            const isExpired = urgencyLevel === 'expired'
            const isUrgent = urgencyLevel === 'urgent'
            
            return (
              <div
                key={document.id}
                className={`p-3 rounded-lg border ${
                  isExpired 
                    ? 'bg-red-50 border-red-200' 
                    : isUrgent 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isExpired ? (
                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      ) : isUrgent ? (
                        <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      ) : (
                        <Bell className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      )}
                      <h4 className="font-medium text-sm truncate">
                        {document.title}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1">
                      {categoryLabels[document.category || 'other']}
                    </p>
                    
                    <p className={`text-xs font-medium ${
                      isExpired 
                        ? 'text-red-700' 
                        : isUrgent 
                        ? 'text-orange-700' 
                        : 'text-yellow-700'
                    }`}>
                      {isExpired 
                        ? `Expiré depuis ${Math.abs(daysUntilExpiry)} jour${Math.abs(daysUntilExpiry) > 1 ? 's' : ''}`
                        : daysUntilExpiry === 0
                        ? 'Expire aujourd\'hui'
                        : `Expire dans ${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                  
                  <Badge 
                    variant={isExpired ? 'destructive' : isUrgent ? 'secondary' : 'secondary'}
                    className="flex-shrink-0 text-xs"
                  >
                    {isExpired ? 'Expiré' : isUrgent ? 'Urgent' : 'Bientôt'}
                  </Badge>
                </div>
              </div>
            )
          })}
          
          {stats.total > 3 && (
            <div className="text-center pt-2">
              <Link href="/dashboard/reminders">
                <Button variant="outline" size="sm" className="text-xs">
                  Voir {stats.total - 3} autre{stats.total - 3 > 1 ? 's' : ''} rappel{stats.total - 3 > 1 ? 's' : ''}
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Stats */}
        {hasUrgentReminders() && (
          <div className="mt-4 pt-3 border-t border-orange-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {stats.expired > 0 && (
                  <span className="text-red-600 font-medium">
                    {stats.expired} expiré{stats.expired > 1 ? 's' : ''}
                  </span>
                )}
                {stats.urgent > 0 && (
                  <span className="text-orange-600 font-medium">
                    {stats.urgent} urgent{stats.urgent > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Link href="/dashboard/reminders">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Gérer →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}