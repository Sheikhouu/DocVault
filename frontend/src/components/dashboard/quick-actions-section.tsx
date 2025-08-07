'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QuickAction } from '@/components/ui/quick-action'
import { 
  Upload, 
  Search, 
  Clock, 
  FolderOpen,
  Plus,
  Share2
} from 'lucide-react'

interface QuickActionsSectionProps {
  onUpload?: (files: FileList) => void
  onSearch?: () => void
  className?: string
}

export function QuickActionsSection({ 
  onUpload, 
  onSearch, 
  className = "" 
}: QuickActionsSectionProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onUpload?.(files)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const actions = [
    {
      title: 'Uploader un document',
      description: 'Ajouter un nouveau fichier',
      icon: <Upload className="w-8 h-8" />,
      onClick: handleUploadClick
    },
    {
      title: 'Recherche globale',
      description: 'Trouver rapidement vos documents',
      icon: <Search className="w-8 h-8" />,
      onClick: onSearch || (() => router.push('/dashboard/search'))
    },
    {
      title: 'Documents récents',
      description: 'Voir vos derniers fichiers',
      icon: <Clock className="w-8 h-8" />,
      onClick: () => router.push('/dashboard/documents?filter=recent')
    },
    {
      title: 'Créer un dossier',
      description: 'Organiser vos documents',
      icon: <FolderOpen className="w-8 h-8" />,
      onClick: () => console.log('Créer un dossier')
    },
    {
      title: 'Partager',
      description: 'Partager des documents',
      icon: <Share2 className="w-8 h-8" />,
      onClick: () => console.log('Partager')
    },
    {
      title: 'Nouveau document',
      description: 'Créer un document texte',
      icon: <Plus className="w-8 h-8" />,
      onClick: () => console.log('Nouveau document')
    }
  ]

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Actions rapides
        </h2>
        <p className="text-muted-foreground">
          Accédez rapidement aux fonctionnalités principales
        </p>
      </div>

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <QuickAction
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={action.onClick}
          />
        ))}
      </div>
    </section>
  )
}
