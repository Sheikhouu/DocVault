'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  HardDrive, 
  AlertTriangle 
} from 'lucide-react'

interface StatsOverviewProps {
  className?: string
}

export function StatsOverview({ className = "" }: StatsOverviewProps) {
  const stats = [
    {
      title: 'Documents totaux',
      value: '12',
      icon: FileText,
      description: 'Tous vos documents',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Stockage utilisé',
      value: '240 Mo',
      icon: HardDrive,
      description: 'Espace consommé',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Expirent bientôt',
      value: '3',
      icon: AlertTriangle,
      description: 'À renouveler',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <section className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Statistiques utilisateur
        </h2>
        <p className="text-gray-600">
          Vue d'ensemble de vos documents et stockage
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}