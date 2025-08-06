'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReminders, useNotifications } from '@/lib/hooks/use-reminders'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, X, Settings, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'reminder' | 'system' | 'success'
    title: string
    message: string
    timestamp: Date
    read: boolean
    actionable?: boolean
  }>>([])

  const { reminders, stats, hasUrgentReminders } = useReminders()
  const { supported, permission, requestPermission, showReminderNotification } = useNotifications()

  // Generate notifications from reminders
  useEffect(() => {
    const reminderNotifications = reminders
      .filter(r => r.urgencyLevel === 'expired' || r.urgencyLevel === 'urgent')
      .slice(0, 5) // Limit to 5 most urgent
      .map(reminder => ({
        id: `reminder_${reminder.document.id}`,
        type: 'reminder' as const,
        title: reminder.urgencyLevel === 'expired' ? 'Document expiré' : 'Document expire bientôt',
        message: `${reminder.document.title} ${
          reminder.urgencyLevel === 'expired' 
            ? `a expiré depuis ${Math.abs(reminder.daysUntilExpiry)} jour(s)`
            : `expire dans ${reminder.daysUntilExpiry} jour(s)`
        }`,
        timestamp: new Date(),
        read: false,
        actionable: true
      }))

    // Add system notifications
    const systemNotifications = []
    
    if (stats.total === 0) {
      systemNotifications.push({
        id: 'welcome',
        type: 'system' as const,
        title: 'Bienvenue dans DocVault',
        message: 'Commencez par ajouter vos premiers documents pour une gestion sécurisée.',
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        read: false,
        actionable: true
      })
    }

    if (permission === 'default' && supported) {
      systemNotifications.push({
        id: 'notifications_permission',
        type: 'system' as const,
        title: 'Activer les notifications',
        message: 'Activez les notifications pour être alerté des documents qui expirent.',
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        read: false,
        actionable: true
      })
    }

    setNotifications([...reminderNotifications, ...systemNotifications])
  }, [reminders, stats, permission, supported])

  // Request browser notifications for urgent reminders
  useEffect(() => {
    if (permission === 'granted' && hasUrgentReminders()) {
      const urgentReminders = reminders.filter(r => 
        r.urgencyLevel === 'expired' || r.urgencyLevel === 'urgent'
      )
      
      // Show browser notification for the most urgent reminder
      if (urgentReminders.length > 0) {
        const mostUrgent = urgentReminders[0]
        showReminderNotification(mostUrgent)
      }
    }
  }, [reminders, permission, hasUrgentReminders, showReminderNotification])

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (notification.id === 'notifications_permission') {
      await requestPermission()
    }
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <CardDescription>
                      {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        Tout lire
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Aucune notification pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : notification.type === 'reminder'
                            ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === 'reminder' ? (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            ) : notification.type === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Bell className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(notification.id)
                                }}
                                className="text-gray-400 hover:text-gray-600 p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <p className={`text-xs mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(notification.timestamp, { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setIsOpen(false)
                        // TODO: Navigate to notifications page
                      }}
                    >
                      <Settings className="h-3 w-3 mr-2" />
                      Gérer les notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}