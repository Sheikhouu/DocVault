'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Folder, 
  FileText, 
  Settings, 
  ChevronUp,
  ChevronDown,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

export function Sidebar() {
  const pathname = usePathname()
  const [isQuickStartExpanded, setIsQuickStartExpanded] = useState(false)

  const navigationItems: SidebarItem[] = [
    {
      href: '/dashboard',
      label: 'Accueil',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      href: '/documents',
      label: 'Dossiers',
      icon: Folder,
      active: pathname.startsWith('/documents')
    },
    {
      href: '/settings',
      label: 'Paramètres',
      icon: Settings,
      active: pathname.startsWith('/settings')
    }
  ]

  return (
    <div className="hidden md:flex w-64 bg-card border-r border-border flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center mb-4">
          <div className="w-6 h-6 text-white font-bold text-lg">D</div>
        </div>
        <h2 className="text-lg font-semibold">DocVault</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${
                  item.active 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Start */}
      <div className="p-6">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-sm font-medium">Découverte</span>
            </div>
            <span className="text-xs text-muted-foreground">0%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-0"></div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">Commencez par ajouter un document</p>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start mb-2"
          onClick={() => setIsQuickStartExpanded(!isQuickStartExpanded)}
        >
          {isQuickStartExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronUp className="w-4 h-4 mr-2" />
          )}
          Actions rapides
        </Button>
        
        {isQuickStartExpanded && (
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Upload className="w-3 h-3 mr-2" />
              Téléverser un fichier
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Folder className="w-3 h-3 mr-2" />
              Créer un dossier
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}