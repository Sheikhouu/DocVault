'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  Calendar,
  Eye,
  Bell,
  CheckCircle
} from 'lucide-react'
import { useReminders, useNotifications } from '@/lib/hooks/use-reminders'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RemindersWidgetProps {
  onViewAll?: () => void
}

export function RemindersWidget({ onViewAll }: RemindersWidgetProps) {
  const { reminders, stats, loading, error, refreshReminders } = useReminders()
  const { permission, requestPermission, showReminderNotification } = useNotifications()

  const topPriorityReminders = reminders.slice(0, 3) // Show only top 3

  const handleNotificationTest = async () => {
    if (permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }
    
    if (topPriorityReminders.length > 0) {
      showReminderNotification(topPriorityReminders[0])
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return 'destructive'
      case 'urgent':
        return 'warning'
      case 'warning':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />
      case 'urgent':
        return <Clock className="h-4 w-4" />
      case 'warning':
        return <Calendar className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return 'Expiré'
      case 'urgent':
        return 'Urgent'
      case 'warning':
        return 'Attention'
      default:
        return 'Normal'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Rappels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Rappels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshReminders}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Rappels
            {stats.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.total}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {permission === 'default' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={requestPermission}
                className="text-xs"
              >
                Activer notifications
              </Button>
            )}
            {topPriorityReminders.length > 0 && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                <Eye className="h-4 w-4 mr-1" />
                Tout voir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Aucun rappel urgent
            </p>
            <p className="text-xs text-muted-foreground">
              Tous vos documents sont à jour !
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {stats.expired > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {stats.expired}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expirés
                  </div>
                </div>
              )}
              {stats.urgent > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {stats.urgent}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Urgents
                  </div>
                </div>
              )}
              {stats.warning > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.warning}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    À surveiller
                  </div>
                </div>
              )}
            </div>

            {/* Top Priority Reminders */}
            <div className="space-y-3">
              {topPriorityReminders.map((reminder) => (
                <div 
                  key={reminder.document.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getUrgencyIcon(reminder.urgencyLevel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {reminder.document.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.daysUntilExpiry < 0 
                            ? `Expiré depuis ${Math.abs(reminder.daysUntilExpiry)} jour(s)`
                            : `Expire dans ${reminder.daysUntilExpiry} jour(s)`
                          }
                        </p>
                      </div>
                      <Badge 
                        variant={getUrgencyColor(reminder.urgencyLevel)}
                        className="text-xs flex-shrink-0"
                      >
                        {getUrgencyLabel(reminder.urgencyLevel)}
                      </Badge>
                    </div>
                    {reminder.document.expiry_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Échéance : {new Date(reminder.document.expiry_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {reminders.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  Voir {reminders.length - 3} rappel(s) de plus
                </Button>
              </div>
            )}

            {/* Notification Test */}
            {permission === 'granted' && topPriorityReminders.length > 0 && (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNotificationTest}
                  className="w-full text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Tester notification
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}