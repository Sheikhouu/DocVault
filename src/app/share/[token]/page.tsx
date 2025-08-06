'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { Download, Eye, Lock, AlertTriangle, FileText, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

type Document = Database['public']['Tables']['documents']['Row']

interface ShareData {
  document: Document
  shareLink: {
    id: string
    token: string
    expires_at: string
    max_views: number | null
    views_count: number
    password_protected: boolean
    allow_download: boolean
  }
}

export default function SharedDocumentPage() {
  const params = useParams()
  const token = params.token as string
  
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loadingFile, setLoadingFile] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadSharedDocument = async (providedPassword?: string) => {
    try {
      setLoading(true)
      setError(null)
      setPasswordError('')

      // TODO: Implement actual share link validation
      // For demo purposes, we'll simulate a shared document
      
      // Check if token exists and is valid
      if (!token || token.length < 10) {
        throw new Error('Lien de partage invalide')
      }

      // Simulate password check
      const isPasswordProtected = token.includes('protected')
      if (isPasswordProtected && !providedPassword) {
        setPasswordRequired(true)
        setLoading(false)
        return
      }

      if (isPasswordProtected && providedPassword !== 'demo123') {
        setPasswordError('Mot de passe incorrect')
        setLoading(false)
        return
      }

      // Simulate expired link
      if (token.includes('expired')) {
        throw new Error('Ce lien de partage a expiré')
      }

      // Simulate view limit reached
      if (token.includes('limit')) {
        throw new Error('Ce lien de partage a atteint sa limite de vues')
      }

      // Simulate loading share data
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock share data
      const mockShareData: ShareData = {
        document: {
          id: 'demo-doc-id',
          user_id: 'demo-user',
          title: 'Document Partagé - Carte d\'Identité',
          description: 'Copie de ma carte d\'identité pour vérification',
          category: 'identity',
          file_path: 'demo/path/carte-identite.pdf',
          file_size: 2485760, // 2.4MB
          mime_type: 'application/pdf',
          expiry_date: '2025-12-31',
          tags: ['identité', 'officiel'],
          is_encrypted: true,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        shareLink: {
          id: 'demo-share-id',
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          max_views: token.includes('limited') ? 5 : null,
          views_count: 1,
          password_protected: isPasswordProtected,
          allow_download: !token.includes('no-download')
        }
      }

      setShareData(mockShareData)
      setPasswordRequired(false)

      // TODO: Increment view count in database

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du document')
    } finally {
      setLoading(false)
    }
  }

  const loadFileContent = async () => {
    if (!shareData) return

    try {
      setLoadingFile(true)
      
      // TODO: Load actual file from Supabase Storage
      // For demo, we'll simulate file loading
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock PDF file URL (you would get this from Supabase Storage)
      const mockFileUrl = '/api/placeholder-pdf' // This would be the actual file URL
      setFileUrl(mockFileUrl)

    } catch (err) {
      setError('Erreur lors du chargement du fichier')
    } finally {
      setLoadingFile(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadSharedDocument(password)
  }

  const handleDownload = async () => {
    if (!shareData?.shareLink.allow_download) return
    
    try {
      // TODO: Implement actual download
      // For demo, we'll simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = shareData.document.title
      link.click()
      
      console.log('Download started for:', shareData.document.title)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  useEffect(() => {
    if (token) {
      loadSharedDocument()
    }
  }, [token])

  const isExpired = shareData && new Date(shareData.shareLink.expires_at) < new Date()
  const isViewLimitReached = shareData && 
    shareData.shareLink.max_views !== null && 
    shareData.shareLink.views_count >= shareData.shareLink.max_views

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du document partagé...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Accès impossible
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-gray-600">
                Vérifiez que le lien est correct et qu'il n'a pas expiré.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Lock className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>Document protégé</CardTitle>
            <CardDescription>
              Ce document est protégé par un mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Accéder au document
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Démo:</strong> Utilisez le mot de passe "demo123"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shareData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {shareData.document.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Document partagé
                  </Badge>
                  {shareData.shareLink.password_protected && (
                    <Badge variant="outline" className="text-xs">
                      🔒 Protégé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {shareData.shareLink.allow_download && (
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  {loadingFile ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement du document...</p>
                    </div>
                  ) : fileUrl ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-full rounded-lg"
                      title={shareData.document.title}
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Prévisualisation du document
                      </p>
                      <p className="text-gray-600 mb-4">
                        Cliquez pour charger le contenu du document
                      </p>
                      <Button onClick={loadFileContent} variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir le document
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Info */}
          <div className="space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shareData.document.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {shareData.document.description}
                    </p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Taille</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {shareData.document.file_size 
                      ? (shareData.document.file_size / 1024 / 1024).toFixed(2) + ' MB'
                      : 'Taille inconnue'
                    }
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {shareData.document.mime_type}
                  </p>
                </div>

                {shareData.document.tags && shareData.document.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {shareData.document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du partage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Expire</Label>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(shareData.shareLink.expires_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Vues</Label>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {shareData.shareLink.views_count}
                    {shareData.shareLink.max_views && ` / ${shareData.shareLink.max_views}`}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Téléchargement</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {shareData.shareLink.allow_download ? '✅ Autorisé' : '❌ Interdit'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">🔒</div>
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm mb-1">
                      Document sécurisé
                    </h4>
                    <p className="text-xs text-blue-800">
                      Ce document vous a été partagé de manière sécurisée. 
                      L'accès est temporaire et peut être révoqué à tout moment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}