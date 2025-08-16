'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { documentSchema, fileUploadSchema, documentCategories } from '@/lib/validations/document'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { DocumentEncryption } from '@/lib/utils/encryption'
import { useFreemium } from '@/lib/hooks/use-freemium'
import { z } from 'zod'
import { AlertTriangle, Shield, Crown } from 'lucide-react'

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

interface DocumentUploadProps {
  onSuccess?: () => void
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expiryDate: '',
    tags: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const freemium = useFreemium()
  const supabase = createClient()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelection(droppedFile)
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    try {
      fileUploadSchema.parse({ file: selectedFile })
      setFile(selectedFile)
      setErrors(prev => ({ ...prev, file: '' }))
      
      // Auto-populate title if empty
      if (!formData.title) {
        const fileName = selectedFile.name.split('.')[0]
        setFormData(prev => ({ ...prev, title: fileName }))
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, file: error.errors[0].message }))
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelection(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setErrors({})
    setUploadProgress(0)

    try {
      // Vérifier la limite freemium
      if (!freemium.canUpload) {
        throw new Error('Limite de documents atteinte. Passez à Premium pour continuer.')
      }

      // Validate form data
      const documentData = documentSchema.parse({
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        expiryDate: formData.expiryDate || undefined
      })

      if (!file) {
        setErrors({ file: 'Veuillez sélectionner un fichier' })
        return
      }

      fileUploadSchema.parse({ file })

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non authentifié')
      }

      setUploadProgress(10)

      // Chiffrement côté client
      console.log('🔐 Chiffrement du fichier en cours...')
      const encryptionPassword = 'mvp-no-password'
      const documentEncryption = new DocumentEncryption()
      const encryptionResult = await documentEncryption.encryptFile(file, encryptionPassword)
      
      setUploadProgress(30)

      // Créer un blob chiffré pour l'upload
      const encryptedBlob = new Blob([encryptionResult.encryptedData], { 
        type: 'application/octet-stream' 
      })

      // Upload file chiffré to Supabase Storage
      const fileExt = 'encrypted'
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      setUploadProgress(50)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, encryptedBlob)

      if (uploadError) {
        throw new Error('Erreur lors du téléchargement du fichier')
      }

      setUploadProgress(70)

      // Préparer les métadonnées de chiffrement
      const encryptionMetadata = {
        password: encryptionPassword,
        salt: Array.from(encryptionResult.salt),
        iv: Array.from(encryptionResult.iv),
        metadata: encryptionResult.metadata
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: documentData.title,
          description: documentData.description || null,
          category: documentData.category,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          expiry_date: documentData.expiryDate || null,
          tags: documentData.tags || null,
          is_encrypted: true,
          encryption_metadata: JSON.stringify(encryptionMetadata)
        })

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([uploadData.path])
        throw new Error('Erreur lors de la sauvegarde du document')
      }

      setUploadProgress(100)

      // Actualiser le statut freemium
      freemium.refreshStatus()

      // Reset form and redirect
      setFile(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        expiryDate: '',
        tags: ''
      })
      
      if (onSuccess) {
        onSuccess()
      }
      
      router.refresh()
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ general: error instanceof Error ? error.message : 'Une erreur est survenue' })
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Ajouter un document
            </CardTitle>
            <CardDescription>
              Téléchargez et chiffrez vos documents importants en toute sécurité
            </CardDescription>
          </div>
          {freemium.subscriptionTier === 'free' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{freemium.documentsCount}/{freemium.maxDocuments}</span>
              <span>Gratuit</span>
            </Badge>
          )}
        </div>

        {/* Alerte freemium */}
        {freemium.upgradeMessage && (
          <div className={`p-3 rounded-lg border flex items-start gap-3 ${
            freemium.upgradeMessage.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
            {freemium.upgradeMessage.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Crown className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{freemium.upgradeMessage.title}</p>
              <p className="text-sm mt-1">{freemium.upgradeMessage.message}</p>
              {freemium.upgradeMessage.type === 'error' && (
                <Button size="sm" className="mt-2" variant="outline">
                  Passer à Premium
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>Fichier</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-2">
                  <div className="text-2xl">✅</div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer le fichier
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl">📁</div>
                  <div>
                    <p className="text-lg font-medium">
                      Glissez-déposez votre fichier ici
                    </p>
                    <p className="text-gray-500">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Sélectionner un fichier
                  </Button>
                  <p className="text-xs text-gray-500">
                    PDF, JPEG, PNG, WebP - Maximum 10MB
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nom du document"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description optionnelle du document"
              className="w-full px-3 py-2 border border-input rounded-md resize-none h-20"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-md"
            >
              <option value="">Sélectionner une catégorie</option>
              {documentCategories.map(category => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Date d'expiration</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              className={errors.expiryDate ? 'border-red-500' : ''}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Séparez les tags par des virgules"
              className={errors.tags ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">
              Exemple: personnel, important, à renouveler
            </p>
            {errors.tags && (
              <p className="text-sm text-red-600">{errors.tags}</p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {uploadProgress < 30 ? '🔐 Chiffrement...' :
                   uploadProgress < 70 ? '📤 Téléchargement...' :
                   uploadProgress < 100 ? '💾 Sauvegarde...' : '✅ Terminé !'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || !file || !freemium.canUpload}
            className="w-full"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Chiffrement et téléchargement...</span>
              </div>
            ) : !freemium.canUpload ? (
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span>Limite atteinte - Passer à Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Chiffrer et ajouter le document</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}