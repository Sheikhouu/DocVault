'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { Copy, Share2, Clock, Eye, Download, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

type Document = Database['public']['Tables']['documents']['Row']

interface ShareLink {
  id: string
  document_id: string
  token: string
  expires_at: string
  max_views: number | null
  views_count: number
  password_protected: boolean
  created_at: string
}

interface DocumentShareProps {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentShare({ document, open, onOpenChange }: DocumentShareProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [shareConfig, setShareConfig] = useState({
    expiresIn: '7', // days
    maxViews: '',
    password: '',
    allowDownload: true
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadShareLinks = async () => {
    try {
      setLoading(true)
      // TODO: Implement share links table and fetch existing links
      // For now, we'll simulate with an empty array
      setShareLinks([])
    } catch (error) {
      console.error('Error loading share links:', error)
    } finally {
      setLoading(false)
    }
  }

  const createShareLink = async () => {
    try {
      setCreating(true)
      
      // Generate secure token
      const token = crypto.randomUUID() + '-' + Date.now().toString(36)
      
      // Calculate expiry date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(shareConfig.expiresIn))
      
      // TODO: Create share link in database
      const newShareLink: ShareLink = {
        id: crypto.randomUUID(),
        document_id: document.id,
        token,
        expires_at: expiresAt.toISOString(),
        max_views: shareConfig.maxViews ? parseInt(shareConfig.maxViews) : null,
        views_count: 0,
        password_protected: !!shareConfig.password,
        created_at: new Date().toISOString()
      }
      
      setShareLinks(prev => [newShareLink, ...prev])
      
      // Reset form
      setShareConfig({
        expiresIn: '7',
        maxViews: '',
        password: '',
        allowDownload: true
      })
      
    } catch (error) {
      console.error('Error creating share link:', error)
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      // TODO: Show success toast
      console.log('Link copied to clipboard')
    } catch (error) {
      // Fallback for older browsers
      const textArea = globalThis.document.createElement('textarea')
      textArea.value = shareUrl
      globalThis.document.body.appendChild(textArea)
      textArea.select()
      globalThis.document.execCommand('copy')
      globalThis.document.body.removeChild(textArea)
    }
  }

  const deleteShareLink = async (linkId: string) => {
    try {
      // TODO: Delete from database
      setShareLinks(prev => prev.filter(link => link.id !== linkId))
    } catch (error) {
      console.error('Error deleting share link:', error)
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isViewLimitReached = (link: ShareLink) => {
    return link.max_views !== null && link.views_count >= link.max_views
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Partager le document
            </h2>
            <p className="text-sm text-gray-600 mt-1">{document.title}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            ✕
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Create New Share Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Créer un lien de partage</CardTitle>
              <CardDescription>
                Générez un lien sécurisé pour partager ce document temporairement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires">Expire dans</Label>
                  <select
                    id="expires"
                    value={shareConfig.expiresIn}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, expiresIn: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="1">1 jour</option>
                    <option value="3">3 jours</option>
                    <option value="7">1 semaine</option>
                    <option value="14">2 semaines</option>
                    <option value="30">1 mois</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxViews">Nombre de vues max</Label>
                  <Input
                    id="maxViews"
                    type="number"
                    placeholder="Illimité"
                    value={shareConfig.maxViews}
                    onChange={(e) => setShareConfig(prev => ({ ...prev, maxViews: e.target.value }))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              {/* Password Protection */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe (optionnel)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Laisser vide pour un accès libre"
                  value={shareConfig.password}
                  onChange={(e) => setShareConfig(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={shareConfig.allowDownload}
                  onChange={(e) => setShareConfig(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="allowDownload" className="text-sm">
                  Autoriser le téléchargement
                </Label>
              </div>

              <Button
                onClick={createShareLink}
                disabled={creating}
                className="w-full"
              >
                {creating ? 'Création...' : 'Créer le lien de partage'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Share Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens de partage actifs</h3>
            
            {shareLinks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun lien de partage actif</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Créez votre premier lien de partage ci-dessus
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link) => {
                  const expired = isExpired(link.expires_at)
                  const viewLimitReached = isViewLimitReached(link)
                  const isActive = !expired && !viewLimitReached
                  const shareUrl = `${window.location.origin}/share/${link.token}`

                  return (
                    <Card key={link.id} className={!isActive ? 'bg-gray-50' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            {/* Status */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={isActive ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {expired ? 'Expiré' : viewLimitReached ? 'Limite atteinte' : 'Actif'}
                              </Badge>
                              {link.password_protected && (
                                <Badge variant="outline" className="text-xs">
                                  🔒 Protégé
                                </Badge>
                              )}
                            </div>

                            {/* Link URL */}
                            <div className="bg-gray-100 rounded p-2 mb-3">
                              <code className="text-sm text-gray-800 break-all">
                                {shareUrl}
                              </code>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {link.views_count}
                                {link.max_views && ` / ${link.max_views}`} vues
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Expire {formatDistanceToNow(new Date(link.expires_at), { addSuffix: true, locale: fr })}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {isActive && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(link.token)}
                                  title="Copier le lien"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(shareUrl, '_blank')}
                                  title="Ouvrir le lien"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteShareLink(link.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer le lien"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5">🔒</div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Sécurité et confidentialité</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Les liens de partage sont chiffrés et sécurisés</p>
                    <p>• Vous pouvez révoquer l'accès à tout moment</p>
                    <p>• Les documents ne sont jamais stockés sur des serveurs tiers</p>
                    <p>• L'accès est automatiquement révoqué à l'expiration</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}