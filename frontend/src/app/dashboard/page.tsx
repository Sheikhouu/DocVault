'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RemindersWidget } from '@/components/dashboard/reminders-widget'
import { DocumentTable } from '@/components/ui/document-table'
import { testSupabaseConnection, testAlternativeTables } from '@/lib/test-supabase'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Test de connexion Supabase au chargement de la page
    const runSupabaseTest = async () => {
      console.log('🚀 Démarrage du test Supabase...')
      
      // Test principal sur la table documents
      const success = await testSupabaseConnection()
      
      // Si le test principal échoue, tester d'autres tables
      if (!success) {
        console.log('🔄 Test des tables alternatives...')
        await testAlternativeTables()
      }
    }
    
    runSupabaseTest()

    // Récupérer les informations de l'utilisateur
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        userName={user?.user_metadata?.full_name || "Utilisateur"}
        userEmail={user?.email || "user@example.com"}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader
          userName={user?.user_metadata?.full_name || "Utilisateur"}
          userEmail={user?.email || "user@example.com"}
          onLogout={handleLogout}
          onSearch={() => router.push('/dashboard/search')}
          onNotifications={() => router.push('/dashboard/reminders')}
          onSettings={() => router.push('/dashboard/settings')}
        />

        {/* Page content */}
        <main className="p-6 space-y-8">
          {/* Welcome section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Bonjour, {user?.user_metadata?.full_name || "Utilisateur"} 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Voici un aperçu de vos documents et activités récentes
            </p>
          </div>

          {/* Stats Overview Section */}
          <StatsOverview className="mt-8" />

          {/* Quick Actions Section */}
          <QuickActions className="mt-8" />

          {/* Reminders Widget Section */}
          <RemindersWidget className="mt-8" />

          {/* Document Table Section */}
          <DocumentTable className="mt-8" />
        </main>
      </div>
    </div>
  )
}