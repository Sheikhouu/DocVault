'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Search, 
  FolderOpen,
  Plus,
  Zap,
  Clock,
  Filter,
  Download
} from 'lucide-react'

interface QuickActionsProps {
  onUploadClick?: () => void
  onSearchClick?: () => void
  onViewAllClick?: () => void
  totalDocuments?: number
}

export function QuickActions({ 
  onUploadClick, 
  onSearchClick, 
  onViewAllClick,
  totalDocuments = 0 
}: QuickActionsProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const actions = [
    {
      id: 'upload',
      title: 'Ajouter Document',
      description: 'Téléverser un nouveau fichier',
      icon: Upload,
      onClick: onUploadClick,
      primary: true,
      shortcut: '⌘ + U'
    },
    {
      id: 'search',
      title: 'Rechercher',
      description: 'Trouver dans vos documents',
      icon: Search,
      onClick: onSearchClick,
      shortcut: '⌘ + F'
    },
    {
      id: 'browse',
      title: 'Parcourir',
      description: `Voir tous les documents (${totalDocuments})`,
      icon: FolderOpen,
      onClick: onViewAllClick,
      badge: totalDocuments > 0 ? totalDocuments.toString() : undefined
    }
  ]

  const quickFilters = [
    {
      id: 'recent',
      title: 'Récents',
      icon: Clock,
      description: 'Documents ajoutés récemment'
    },
    {
      id: 'conversions',
      title: 'Conversions PDF',
      icon: Download,
      description: 'Statut des conversions'
    },
    {
      id: 'categories',
      title: 'Par Catégorie',
      icon: Filter,
      description: 'Filtrer par type'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.primary ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-3 group relative transition-all ${
                    action.primary ? 'hover:scale-105' : ''
                  }`}
                  onClick={action.onClick}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div className="flex items-center justify-center relative">
                    <Icon className={`h-8 w-8 ${action.primary ? 'text-primary-foreground' : 'text-primary'}`} />
                    {action.badge && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 p-0 flex items-center justify-center"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${action.primary ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {action.title}
                    </div>
                    <div className={`text-xs mt-1 ${action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {action.description}
                    </div>
                    {hoveredAction === action.id && action.shortcut && (
                      <div className="text-xs mt-2 opacity-70">
                        {action.shortcut}
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres Rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <Button
                  key={filter.id}
                  variant="ghost"
                  className="h-auto p-3 flex items-center gap-3 justify-start group hover:bg-accent/50"
                  onMouseEnter={() => setHoveredAction(filter.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {filter.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {filter.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                💡 Conseil Pro
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Glissez-déposez vos fichiers directement sur cette page pour les téléverser rapidement !
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Drag & Drop
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Raccourcis Clavier
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}