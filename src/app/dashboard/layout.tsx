import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileGuard } from '@/components/auth/profile-guard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileGuard>
        {children}
      </ProfileGuard>
    </div>
  )
}