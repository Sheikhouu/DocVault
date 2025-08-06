'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { DocumentShare } from './document-share'
import { X, Download, Trash2, Edit, Eye, Share2 } from 'lucide-react'
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

interface DocumentPreviewProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  onEdit?: () => void
}

export function DocumentPreview({ 
  document, 
  open, 
  onOpenChange, 
  onDelete,
  onEdit 
}: DocumentPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShare, setShowShare] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (open && document.file_path) {
      loadFileUrl()
    }
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [open, document.file_path])

  const loadFileUrl = async () => {
    if (!document.file_path) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) {
        throw error
      }

      const url = URL.createObjectURL(data)
      setFileUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du fichier')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document.file_path) return
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = globalThis.document.createElement('a')
      a.href = url
      a.download = document.title
      globalThis.document.body.appendChild(a)
      a.click()
      globalThis.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(false)
    onDelete()
    onOpenChange(false)
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiry < today
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow && !isExpired(expiryDate)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold truncate">{document.title}</h2>
              <p className="text-sm text-gray-600">
                {categoryLabels[document.category || 'other']}
              </p>
            </div>
            
            {/* Status Badges */}
            <div className="flex gap-2">
              {document.expiry_date && (
                <>
                  {isExpired(document.expiry_date) ? (
                    <Badge variant="destructive">Expiré</Badge>
                  ) : isExpiringSoon(document.expiry_date) ? (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Expire bientôt
                    </Badge>
                  ) : (
                    <Badge variant="outline">Valide</Badge>
                  )}
                </>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with document info */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Description */}
              {document.description && (
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{document.description}</p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* File Info */}
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">Informations du fichier</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Taille:</span>{' '}
                    {document.file_size 
                      ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB`
                      : 'Inconnue'
                    }
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    {document.mime_type || 'Inconnu'}
                  </div>
                  <div>
                    <span className="font-medium">Ajouté:</span>{' '}
                    {document.created_at 
                      ? formatDistanceToNow(new Date(document.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })
                      : 'Date inconnue'
                    }
                  </div>
                  {document.expiry_date && (
                    <div>
                      <span className="font-medium">Expire:</span>{' '}
                      {new Date(document.expiry_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShare(true)}
                  className="w-full justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Chargement...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="text-4xl mb-4">❌</div>
                <p className="text-red-600 mb-2">Erreur de chargement</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            ) : fileUrl ? (
              <div className="w-full h-full">
                {document.mime_type?.startsWith('image/') ? (
                  <img
                    src={fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                ) : document.mime_type === 'application/pdf' ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={document.title}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg font-medium mb-2">Prévisualisation non disponible</p>
                    <p className="text-gray-600 mb-4">
                      Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger pour ouvrir
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-medium mb-2">Aucun fichier</p>
                <p className="text-gray-600">Ce document n'a pas de fichier associé.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Confirmer la suppression</CardTitle>
              <CardDescription>
                Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      <DocumentShare
        document={document}
        open={showShare}
        onOpenChange={setShowShare}
      />
    </div>
  )
}