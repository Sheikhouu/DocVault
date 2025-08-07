'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertCircle, Calendar } from 'lucide-react'

interface RemindersWidgetProps {
  className?: string
}

export function RemindersWidget({ className = "" }: RemindersWidgetProps) {
  const reminders = [
    {
      id: 1,
      title: 'Renouveler le passeport',
      daysLeft: 10,
      priority: 'high' as const,
      category: 'Administratif'
    },
    {
      id: 2,
      title: 'Certificat médical expiré',
      daysLeft: 3,
      priority: 'urgent' as const,
      category: 'Santé'
    },
    {
      id: 3,
      title: 'Contrat d\'assurance auto',
      daysLeft: 15,
      priority: 'medium' as const,
      category: 'Assurance'
    },
    {
      id: 4,
      title: 'Permis de conduire',
      daysLeft: 25,
      priority: 'low' as const,
      category: 'Administratif'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <Calendar className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rappels importants
        </h2>
        <p className="text-gray-600">
          Documents à renouveler ou actions à effectuer
        </p>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Rappels en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getPriorityIcon(reminder.priority)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {reminder.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {reminder.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {reminder.daysLeft} jour{reminder.daysLeft > 1 ? 's' : ''} restant{reminder.daysLeft > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge 
                    className={`text-xs ${getPriorityColor(reminder.priority)}`}
                  >
                    {reminder.priority === 'urgent' && 'Urgent'}
                    {reminder.priority === 'high' && 'Important'}
                    {reminder.priority === 'medium' && 'Moyen'}
                    {reminder.priority === 'low' && 'Faible'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {reminders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun rappel en cours</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}