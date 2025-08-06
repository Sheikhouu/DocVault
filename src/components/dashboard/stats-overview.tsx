'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  FolderOpen
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

type Document = Database['public']['Tables']['documents']['Row']

interface StatsData {
  totalDocuments: number
  expiringDocuments: number
  expiredDocuments: number
  recentUploads: number
  storageUsed: number
  categoriesCount: Record<string, number>
}

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

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData>({
    totalDocuments: 0,
    expiringDocuments: 0,
    expiredDocuments: 0,
    recentUploads: 0,
    storageUsed: 0,
    categoriesCount: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error('Utilisateur non authentifié')
        }

        const { data: documents, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) {
          throw fetchError
        }

        const docs = documents || []
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Calculate statistics
        const totalDocuments = docs.length
        const expiringDocuments = docs.filter(doc => 
          doc.expiry_date && 
          new Date(doc.expiry_date) <= thirtyDaysFromNow &&
          new Date(doc.expiry_date) >= now
        ).length
        
        const expiredDocuments = docs.filter(doc => 
          doc.expiry_date && new Date(doc.expiry_date) < now
        ).length

        const recentUploads = docs.filter(doc => 
          new Date(doc.created_at) >= thirtyDaysAgo
        ).length

        const storageUsed = docs.reduce((total, doc) => 
          total + (doc.file_size || 0), 0
        ) / (1024 * 1024) // Convert to MB

        // Count documents by category
        const categoriesCount = docs.reduce((acc, doc) => {
          const category = doc.category || 'other'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        setStats({
          totalDocuments,
          expiringDocuments,
          expiredDocuments,
          recentUploads,
          storageUsed,
          categoriesCount
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topCategory = Object.entries(stats.categoriesCount)
    .sort(([,a], [,b]) => b - a)[0]

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Documents
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalDocuments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-sm text-success font-medium">
                +{stats.recentUploads}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                ce mois-ci
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expire Bientôt
                </p>
                <p className="text-3xl font-bold text-warning">
                  {stats.expiringDocuments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-sm text-muted-foreground">
                Dans les 30 jours
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expirés
                </p>
                <p className="text-3xl font-bold text-destructive">
                  {stats.expiredDocuments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {stats.expiredDocuments === 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success mr-1" />
                  <span className="text-sm text-success">Tout est à jour</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                  <span className="text-sm text-destructive">Action requise</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stockage Utilisé
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.storageUsed.toFixed(1)}
                  <span className="text-lg font-normal text-muted-foreground ml-1">
                    MB
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.storageUsed / 100) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                / 1GB
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      {Object.keys(stats.categoriesCount).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.categoriesCount)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {categoryLabels[category]}
                    </div>
                  </div>
                ))
              }
            </div>
            {topCategory && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="text-sm">
                    📊 Catégorie principale : {categoryLabels[topCategory[0]]} ({topCategory[1]} documents)
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}