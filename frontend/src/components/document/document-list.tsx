'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { DocumentPreview } from './document-preview'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Download, FileText, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { webhooksAPI } from '@/services/api'

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
  
  const supabase = createClient()

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

  const getConversionStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />En attente</Badge>
      case 'converting':
        return <Badge variant="default" className="gap-1"><Clock className="h-3 w-3 animate-spin" />Conversion...</Badge>
      case 'completed':
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" />Terminé</Badge>
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Échec</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const downloadPdf = async (document: Document) => {
    if (!document.converted_pdf_url) return
    
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(document.converted_pdf_url)
      
      window.open(data.publicUrl, '_blank')
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error)
    }
  }

  const retryConversion = async (documentId: string) => {
    try {
      // Mettre à jour le statut local immédiatement
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, conversion_status: 'pending' as const, conversion_error: null }
          : doc
      ))
      
      await webhooksAPI.retryConversion(documentId)
      
      // Recharger les documents après un délai pour voir le nouveau statut
      setTimeout(fetchDocuments, 2000)
    } catch (error) {
      console.error('Erreur lors de la relance de conversion:', error)
      // Remettre le statut en failed en cas d'erreur
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, conversion_status: 'failed' as const }
          : doc
      ))
      setError('Impossible de relancer la conversion')
    }
  }

  const placeholder = (expiryDate: string | null) => {
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
                
                {/* Conversion Status */}
                <div className="flex-shrink-0">
                  {getConversionStatusBadge(document.conversion_status)}
                </div>
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
              
              {/* PDF Actions */}
              <div className="mt-3 flex gap-2">
                {document.conversion_status === 'completed' && document.converted_pdf_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadPdf(document)
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                )}
                {document.conversion_status === 'failed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs text-orange-600 border-orange-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      retryConversion(document.id)
                    }}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Réessayer
                  </Button>
                )}
                {document.conversion_status === 'converting' && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Clock className="h-3 w-3 animate-spin" />
                    Conversion en cours...
                  </div>
                )}
              </div>
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