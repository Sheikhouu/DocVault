import { ReactNode } from 'react'
import { Card, CardContent } from './card'

interface CardStatProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function CardStat({ 
  title, 
  value, 
  icon, 
  trend, 
  description, 
  className = "" 
}: CardStatProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">
                {value}
              </p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
