'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { documentCategories } from '@/lib/validations/document'
import { Search, Filter, X } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  identity: 'Identité',
  education: 'Éducation',
  employment: 'Emploi',
  housing: 'Logement',
  financial: 'Financier',
  health: 'Santé',
  legal: 'Juridique',
  other: 'Autre'
}

interface DocumentFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  documentCount: number
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  documentCount
}: DocumentFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const clearFilters = () => {
    onSearchChange('')
    onCategoryChange('')
  }

  const hasActiveFilters = searchQuery || selectedCategory

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher dans vos documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Toggle and Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {(searchQuery ? 1 : 0) + (selectedCategory ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {documentCount} document{documentCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Recherche: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Catégorie: {categoryLabels[selectedCategory]}
              <button
                onClick={() => onCategoryChange('')}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Expandable Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Catégories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange('')}
                  className="justify-start"
                >
                  Toutes
                </Button>
                {documentCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(category)}
                    className="justify-start"
                  >
                    {categoryLabels[category]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filtres rapides</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement expiring soon filter
                    console.log('Filter: Expiring soon')
                  }}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Expire bientôt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement expired filter
                    console.log('Filter: Expired')
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Expirés
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement recent filter
                    console.log('Filter: Recent')
                  }}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Récents
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}