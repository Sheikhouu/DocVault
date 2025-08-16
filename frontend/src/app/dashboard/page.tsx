'use client'

import { useState, lazy, Suspense } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
// MVP: Stats and Reminders removed
import { QuickActions } from '@/components/dashboard/quick-actions'
import { ConversionStats } from '@/components/dashboard/conversion-stats'

// Lazy loading des composants lourds
const DocumentList = lazy(() => import('@/components/document/document-list').then(mod => ({ default: mod.DocumentList })))
const DocumentUpload = lazy(() => import('@/components/document/document-upload').then(mod => ({ default: mod.DocumentUpload })))
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  X
} from 'lucide-react'

export default function DashboardPage() {
  const [showUpload, setShowUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showDocuments, setShowDocuments] = useState(false)

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'identity', label: 'Identité' },
    { value: 'education', label: 'Éducation' },
    { value: 'employment', label: 'Emploi' },
    { value: 'housing', label: 'Logement' },
    { value: 'financial', label: 'Financier' },
    { value: 'health', label: 'Santé' },
    { value: 'legal', label: 'Juridique' },
    { value: 'other', label: 'Autre' }
  ]

  const handleUploadSuccess = () => {
    setShowUpload(false)
    // Refresh will be handled by the DocumentList component
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar onUploadClick={() => setShowUpload(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <DashboardHeader />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto pt-16 md:pt-6">
          {showUpload && (
            <div className="animate-slide-down">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Ajouter un Document</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <DocumentUpload onSuccess={handleUploadSuccess} />
              </Suspense>
            </div>
          )}

          {!showUpload && !showDocuments && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold mb-2">
                  Bienvenue dans DocVault
                </h1>
                <p className="text-muted-foreground text-lg mb-6">
                  Gérez vos documents importants en toute sécurité
                </p>
              </div>

              {/* Quick Actions - MVP Simplified */}
              <div className="animate-slide-up space-y-6">
                <QuickActions 
                  onUploadClick={() => setShowUpload(true)}
                  onSearchClick={() => setShowDocuments(true)}
                  onViewAllClick={() => setShowDocuments(true)}
                />
                
                {/* Conversion Stats */}
                <ConversionStats />
              </div>
            </div>
          )}

          {showDocuments && !showUpload && (
            <div className="animate-slide-down space-y-6">
              {/* Documents Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">Mes Documents</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowDocuments(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Fermer
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setShowUpload(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher dans vos documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex border border-input rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-r-none border-0 ${viewMode === 'grid' ? '' : 'hover:bg-accent'}`}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`rounded-l-none border-0 ${viewMode === 'list' ? '' : 'hover:bg-accent'}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchQuery || selectedCategory) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Recherche: "{searchQuery}"
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {categories.find(c => c.value === selectedCategory)?.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSelectedCategory('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Documents List */}
              <Suspense fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <DocumentList 
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </Suspense>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}