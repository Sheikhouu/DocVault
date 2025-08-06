'use client'

import { DocumentReminders } from '@/components/document/document-reminders'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Settings, Calendar, AlertTriangle } from 'lucide-react'

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Rappels et Notifications" 
        subtitle="Gérez vos rappels d'expiration et configurez vos notifications" 
      />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Settings Button */}
        <div className="flex justify-end mb-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </Button>
        </div>

        {/* Notification Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres de notification
            </CardTitle>
            <CardDescription>
              Configurez quand et comment vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-medium">Documents expirant dans 30 jours</h3>
                    <p className="text-sm text-gray-600">Recevez un rappel un mois avant expiration</p>
                  </div>
                </div>
                <Badge variant="secondary">Activé</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="font-medium">Documents expirant dans 7 jours</h3>
                    <p className="text-sm text-gray-600">Rappel urgent une semaine avant expiration</p>
                  </div>
                </div>
                <Badge variant="secondary">Activé</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Rappels hebdomadaires</h3>
                    <p className="text-sm text-gray-600">Résumé hebdomadaire des documents à surveiller</p>
                  </div>
                </div>
                <Badge variant="outline">Désactivé</Badge>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Notifications par email</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Les notifications sont actuellement envoyées à votre adresse email. 
                    Vous pouvez modifier vos préférences dans les paramètres de votre compte.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Reminders */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Rappels actifs</h2>
          </div>
          
          <DocumentReminders showAll={true} />
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Conseils pour une meilleure gestion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">•</span>
                <p>Ajoutez toujours une date d'expiration à vos documents importants (carte d'identité, passeport, permis de conduire, etc.)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">•</span>
                <p>Utilisez des tags comme "à renouveler" ou "urgent" pour mieux organiser vos documents</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">•</span>
                <p>Prenez une photo de vos nouveaux documents dès que vous les recevez</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-blue-600">•</span>
                <p>Configurez des rappels personnalisés selon l'importance du document</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}