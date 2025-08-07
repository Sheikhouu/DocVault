'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Badge } from './badge'
import { Checkbox } from './checkbox'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  Share2,
  FileText,
  FileImage,
  File,
  Calendar,
  MoreHorizontal,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  expiresAt?: string
  status: 'active' | 'expired' | 'expiring'
  category: string
}

interface DocumentTableProps {
  className?: string
}

export function DocumentTable({ className = "" }: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [sortField, setSortField] = useState<'name' | 'size' | 'uploadedAt' | 'expiresAt'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)

  // Données mockées
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Contrat_entreprise_2024.pdf',
      type: 'PDF',
      size: 2.5 * 1024 * 1024, // 2.5 MB
      uploadedAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      status: 'active',
      category: 'Contrats'
    },
    {
      id: '2',
      name: 'Facture_janvier_2024.docx',
      type: 'DOCX',
      size: 1.2 * 1024 * 1024, // 1.2 MB
      uploadedAt: '2024-01-10T14:20:00Z',
      expiresAt: '2024-02-15T23:59:59Z',
      status: 'expiring',
      category: 'Factures'
    },
    {
      id: '3',
      name: 'Photo_profil.jpg',
      type: 'JPG',
      size: 500 * 1024, // 500 KB
      uploadedAt: '2024-01-05T09:15:00Z',
      status: 'active',
      category: 'Images'
    },
    {
      id: '4',
      name: 'Rapport_annuel_2023.pdf',
      type: 'PDF',
      size: 5.8 * 1024 * 1024, // 5.8 MB
      uploadedAt: '2023-12-20T16:45:00Z',
      expiresAt: '2023-12-31T23:59:59Z',
      status: 'expired',
      category: 'Rapports'
    },
    {
      id: '5',
      name: 'Certificat_formation.pdf',
      type: 'PDF',
      size: 800 * 1024, // 800 KB
      uploadedAt: '2024-01-20T11:30:00Z',
      expiresAt: '2024-06-30T23:59:59Z',
      status: 'active',
      category: 'Certificats'
    }
  ]

  // Filtrage et tri des documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = mockDocuments.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'size') {
        aValue = a.size
        bValue = b.size
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [searchTerm, sortField, sortDirection])

  // Gestion de la sélection
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedDocuments(filteredAndSortedDocuments.map(doc => doc.id))
    } else {
      setSelectedDocuments([])
    }
  }

  const handleSelectDocument = (docId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedDocuments(prev => [...prev, docId])
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId))
    }
  }

  // Gestion du tri
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Utilitaires
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="w-4 h-4 text-green-500" />
      default:
        return <File className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      active: 'default',
      expired: 'destructive',
      expiring: 'secondary'
    } as const

    const labels = {
      active: 'Actif',
      expired: 'Expiré',
      expiring: 'Expire bientôt'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  // Actions sur les documents
  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
  }

  const handleDownload = (doc: Document) => {
    console.log('⬇️ Télécharger:', doc.name)
    // Ici vous pouvez implémenter la logique de téléchargement
    alert(`Téléchargement de ${doc.name}...`)
  }

  const handleDelete = (doc: Document) => {
    console.log('🗑️ Supprimer:', doc.name)
    // Ici vous pouvez implémenter la logique de suppression
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${doc.name}" ?`)) {
      alert(`${doc.name} a été supprimé`)
    }
  }

  const handleShare = (doc: Document) => {
    const shareUrl = `https://docvault.app/share/${doc.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`Lien de partage copié : ${shareUrl}`)
    }).catch(() => {
      alert('Erreur lors de la copie du lien')
    })
  }

  const handleBulkDelete = () => {
    if (selectedDocuments.length === 0) return
    if (confirm(`Supprimer ${selectedDocuments.length} document(s) sélectionné(s) ?`)) {
      console.log('🗑️ Suppression en masse:', selectedDocuments)
      setSelectedDocuments([])
      alert(`${selectedDocuments.length} document(s) supprimé(s)`)
    }
  }

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des documents
        </h2>
        <p className="text-gray-600">
          Gérez vos documents, triez-les et effectuez des actions en masse
        </p>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Documents ({filteredAndSortedDocuments.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Actions en masse */}
              {selectedDocuments.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer ({selectedDocuments.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedDocuments.length === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      Document
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('size')}
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      Taille
                      {sortField === 'size' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('uploadedAt')}
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      Date d'upload
                      {sortField === 'uploadedAt' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('expiresAt')}
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      Expiration
                      {sortField === 'expiresAt' && (
                        sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                      )}
                    </Button>
                  </th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                                         <td className="py-3 px-4">
                       <Checkbox
                         checked={selectedDocuments.includes(doc.id)}
                         onCheckedChange={(checked) => handleSelectDocument(doc.id, checked)}
                       />
                     </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(doc)}
                          title="Partager"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          title="Supprimer"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedDocuments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun document trouvé</p>
                {searchTerm && (
                  <p className="text-sm mt-2">
                    Essayez de modifier vos critères de recherche
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de prévisualisation */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Prévisualisation</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  {getFileIcon(previewDocument.type)}
                </div>
                <div>
                  <h4 className="font-medium">{previewDocument.name}</h4>
                  <p className="text-sm text-gray-500">{previewDocument.category}</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded p-4 text-center">
                <p className="text-gray-600">Aperçu du document</p>
                <p className="text-sm text-gray-500 mt-2">
                  La prévisualisation sera disponible ici
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Fermer
                </Button>
                <Button onClick={() => handleDownload(previewDocument)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
