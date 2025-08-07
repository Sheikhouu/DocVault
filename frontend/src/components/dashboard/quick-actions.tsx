'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Upload, 
  Search, 
  Clock,
  FileText
} from 'lucide-react'

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className = "" }: QuickActionsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      console.log('📁 Fichiers sélectionnés:', files)
      alert(`${files.length} fichier(s) sélectionné(s) pour upload`)
      // Ici vous pouvez implémenter la logique d'upload
    }
  }

  const handleSearchFocus = () => {
    searchInputRef.current?.focus()
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const searchTerm = searchInputRef.current?.value
    if (searchTerm) {
      console.log('🔍 Recherche:', searchTerm)
      // Ici vous pouvez implémenter la logique de recherche
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleViewRecentDocuments = () => {
    router.push('/dashboard/documents')
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Actions rapides
        </h2>
        <p className="text-gray-600">
          Accédez rapidement aux fonctionnalités principales
        </p>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Actions disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload Document */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Uploader un document
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ajouter un nouveau fichier à votre bibliothèque
                </p>
                <Button 
                  onClick={handleUploadClick}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir un fichier
                </Button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
            </div>

            {/* Search */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Rechercher
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Trouver rapidement vos documents
                </p>
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <Input
                    ref={searchInputRef}
                    placeholder="Rechercher un document..."
                    className="w-full"
                  />
                  <Button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </form>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Documents récents
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Voir vos derniers fichiers uploadés
                </p>
                <Button 
                  onClick={handleViewRecentDocuments}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Voir les documents
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}