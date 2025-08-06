'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Folder, 
  Settings, 
  Menu,
  X,
  Upload,
  Shield,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFreemium } from '@/lib/hooks/use-freemium'

interface MobileSidebarProps {
  onUploadClick?: () => void
}

export function MobileSidebar({ onUploadClick }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const freemium = useFreemium()

  // Fermer le menu lors du changement de route
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Accueil',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      href: '/documents',
      label: 'Mes Documents',
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
    <>
      {/* Bouton Menu Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-background border shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Ouvrir le menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">DocVault</h2>
                  <p className="text-xs text-muted-foreground">Documents sécurisés</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Freemium Status */}
          {freemium.subscriptionTier === 'free' && (
            <div className="p-4 border-b border-border">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Gratuit
                  </Badge>
                  <span className="text-sm font-medium text-orange-700">
                    {freemium.documentsCount}/{freemium.maxDocuments}
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(freemium.documentsCount / freemium.maxDocuments) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-orange-600">
                  {freemium.maxDocuments - freemium.documentsCount} documents restants
                </p>
                <Button size="sm" className="w-full mt-2" variant="outline">
                  Passer à Premium
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${item.active 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border space-y-3">
            <Button
              onClick={() => {
                onUploadClick?.()
                setIsOpen(false)
              }}
              disabled={!freemium.canUpload}
              className="w-full"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {freemium.canUpload ? 'Ajouter un document' : 'Limite atteinte'}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                DocVault v1.0 - Sécurisé
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}