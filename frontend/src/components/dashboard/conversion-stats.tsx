'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { documentsAPI } from '@/services/api'
import { Clock, CheckCircle, AlertCircle, FileText, TrendingUp } from 'lucide-react'

interface ConversionStats {
  total: number
  pending: number
  converting: number
  completed: number
  failed: number
  success_rate: number
}

export function ConversionStats() {
  const [stats, setStats] = useState<ConversionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await documentsAPI.getConversionStats()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Actualiser les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conversion PDF
          </CardTitle>
          <CardDescription>Statistiques de conversion de vos documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conversion PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchStats}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conversion PDF
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {stats.success_rate}% succès
          </Badge>
        </CardTitle>
        <CardDescription>
          Conversion automatique de vos documents en PDF
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-green-600">Terminés</div>
          </div>
          
          {stats.pending > 0 && (
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-yellow-600">En attente</div>
            </div>
          )}
          
          {stats.converting > 0 && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.converting}</div>
              <div className="text-xs text-blue-600">Conversion...</div>
            </div>
          )}
          
          {stats.failed > 0 && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-red-600">Échecs</div>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        {stats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Messages informatifs */}
        {stats.total === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Aucun document uploadé pour le moment
          </div>
        )}

        {stats.converting > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
            <Clock className="h-4 w-4 animate-spin" />
            {stats.converting} conversion{stats.converting > 1 ? 's' : ''} en cours...
          </div>
        )}

        {stats.failed > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            {stats.failed} conversion{stats.failed > 1 ? 's' : ''} échouée{stats.failed > 1 ? 's' : ''}
          </div>
        )}

        {stats.completed > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <CheckCircle className="h-4 w-4" />
            {stats.completed} PDF disponible{stats.completed > 1 ? 's' : ''} au téléchargement
          </div>
        )}
      </CardContent>
    </Card>
  )
}