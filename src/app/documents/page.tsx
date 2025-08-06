'use client'

import { useState } from 'react'
import { 
  Upload,
  Plus,
  FolderPlus,
  Download,
  ArrowRight,
  Share2,
  Settings,
  Star,
  Grid,
  List,
  ChevronUp,
  FileText,
  Image,
  File,
  Calendar,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

// Mock data for demonstration
const mockDocuments = [
  {
    id: '1',
    name: 'Carte d&apos;identité.pdf',
    type: 'pdf',
    size: '2.3 MB',
    modified: '2024-01-15',
    category: 'Identité'
  },
  {
    id: '2',
    name: 'Diplôme universitaire.jpg',
    type: 'image',
    size: '1.8 MB',
    modified: '2024-01-10',
    category: 'Éducation'
  },
  {
    id: '3',
    name: 'Contrat de location.pdf',
    type: 'pdf',
    size: '3.1 MB',
    modified: '2024-01-08',
    category: 'Logement'
  },
  {
    id: '4',
    name: 'Facture électricité.pdf',
    type: 'pdf',
    size: '0.9 MB',
    modified: '2024-01-05',
    category: 'Factures'
  }
]

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />
      default:
        return <File className="w-6 h-6 text-blue-500" />
    }
  }

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Action Buttons */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Téléverser ou d...
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <FolderPlus className="w-4 h-4 mr-2" />
                Créer un dossier
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Obtenir l&apos;applic...
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Transférer une ...
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>

            {selectedDocuments.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {selectedDocuments.length} sélectionné(s)
                </span>
                <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold">Mes Documents</h1>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1">
                <Button 
                  variant={activeTab === 'recent' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('recent')}
                  className={activeTab === 'recent' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                >
                  Récents
                </Button>
                <Button 
                  variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('favorites')}
                  className={activeTab === 'favorites' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Favoris
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  FP
                </div>
                <span className="text-sm text-gray-400">Vous uniquement</span>
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="flex-1 p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    selectedDocuments.includes(doc.id) 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    {getFileIcon(doc.type)}
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-medium text-white mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{doc.size}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                      {doc.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(doc.modified).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                    selectedDocuments.includes(doc.id) 
                      ? 'bg-blue-900/20 border-blue-500' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  } border`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  <div className="flex items-center flex-1">
                    {getFileIcon(doc.type)}
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-white">{doc.name}</h3>
                      <p className="text-sm text-gray-400">{doc.category} • {doc.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-400">
                      {new Date(doc.modified).toLocaleDateString('fr-FR')}
                    </span>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}