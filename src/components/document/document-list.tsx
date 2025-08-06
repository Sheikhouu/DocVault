'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { DocumentPreview } from './document-preview'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

type Document = Database['public']['Tables']['documents']['Row']

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

const categoryIcons: Record<string, string> = {
  identity: '🆔',
  education: '🎓',
  employment: '💼',
  housing: '🏠',
  financial: '💰',
  health: '🏥',
  legal: '⚖️',
  other: '📄'
}

interface DocumentListProps {
  searchQuery?: string
  selectedCategory?: string
}

export function DocumentList({ searchQuery = '', selectedCategory = '' }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utilisateur non authentifié')
      }

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      let filteredDocuments = data || []

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.title.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        )
      }

      setDocuments(filteredDocuments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [searchQuery, selectedCategory])

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const documentToDelete = documents.find(doc => doc.id === documentId)
      if (!documentToDelete) return

      // Delete file from storage
      if (documentToDelete.file_path) {
        await supabase.storage
          .from('documents')
          .remove([documentToDelete.file_path])
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (deleteError) {
        throw deleteError
      }

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      
      if (selectedDocument?.id === documentId) {
        setPreviewOpen(false)
        setSelectedDocument(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const openPreview = (document: Document) => {
    setSelectedDocument(document)
    setPreviewOpen(true)
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiry < today
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDocuments} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || selectedCategory ? 'Aucun document trouvé' : 'Aucun document pour le moment'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory 
                ? 'Essayez de modifier vos critères de recherche ou de filtrage.'
                : 'Commencez par ajouter votre premier document pour commencer à organiser vos fichiers importants.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card 
            key={document.id} 
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openPreview(document)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-2xl flex-shrink-0">
                    {categoryIcons[document.category || 'other']}
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">
                      {document.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {categoryLabels[document.category || 'other']}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Expiry Status */}
                {document.expiry_date && (
                  <div className="flex-shrink-0">
                    {isExpired(document.expiry_date) ? (
                      <Badge variant="destructive" className="text-xs">
                        Expiré
                      </Badge>
                    ) : isExpiringSoon(document.expiry_date) ? (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        Expire bientôt
                      </Badge>
                    ) : null}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Description */}
              {document.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}
              
              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {document.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{document.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* File Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {document.file_size 
                    ? `${(document.file_size / 1024 / 1024).toFixed(1)} MB`
                    : 'Taille inconnue'
                  }
                </span>
                <span>
                  {document.created_at 
                    ? formatDistanceToNow(new Date(document.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })
                    : ''
                  }
                </span>
              </div>
              
              {/* Expiry Date */}
              {document.expiry_date && (
                <div className="text-xs text-gray-500 mt-1">
                  Expire le {new Date(document.expiry_date).toLocaleDateString('fr-FR')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          onDelete={() => handleDeleteDocument(selectedDocument.id)}
        />
      )}
    </>
  )
}