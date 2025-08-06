'use client'

import { useState } from 'react'
import { 
  Search, 
  UserPlus, 
  Grid3X3, 
  Monitor, 
  HelpCircle, 
  Bell,
  Settings,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <div>
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Rechercher" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter
            </Button>
            <Button variant="ghost" size="sm">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Monitor className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                5
              </span>
            </Button>
            
            {/* User Menu */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                  FP
                </div>
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => router.push('/settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="gradient" size="sm">
              Upgrade Pro
            </Button>
          </div>
        </div>
      </header>
      
      {/* Page Title Section */}
      {(title || subtitle) && (
        <div className="bg-muted/50 border-b px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  )
}