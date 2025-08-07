'use client'

import { CardStat } from '@/components/ui/card-stat'
import { 
  FileText, 
  HardDrive, 
  AlertTriangle,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

interface StatsData {
  totalDocuments: number
  usedSpace: number // en bytes
  expiringDocuments: number
  totalUsers?: number
  recentUploads?: number
}

interface StatsSectionProps {
  data: StatsData
  className?: string
}

export function StatsSection({ data, className = "" }: StatsSectionProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const stats = [
    {
      title: 'Documents totaux',
      value: data.totalDocuments.toLocaleString(),
      icon: <FileText className="w-6 h-6" />,
      description: 'Tous vos documents',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Espace utilisé',
      value: formatFileSize(data.usedSpace),
      icon: <HardDrive className="w-6 h-6" />,
      description: 'Stockage consommé',
      trend: { value: 8, isPositive: false }
    },
    {
      title: 'Expirent bientôt',
      value: data.expiringDocuments,
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'Documents à renouveler',
      trend: data.expiringDocuments > 0 ? { value: data.expiringDocuments, isPositive: false } : undefined
    },
    {
      title: 'Utilisateurs',
      value: data.totalUsers || 1,
      icon: <Users className="w-6 h-6" />,
      description: 'Membres de l\'équipe',
      trend: { value: 5, isPositive: true }
    }
  ]

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Statistiques
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos documents et de l'utilisation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <CardStat
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  )
}
