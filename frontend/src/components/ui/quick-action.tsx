import { ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface QuickActionProps {
  title: string
  description: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'secondary'
  disabled?: boolean
  className?: string
}

export function QuickAction({
  title,
  description,
  icon,
  onClick,
  variant = 'default',
  disabled = false,
  className = ""
}: QuickActionProps) {
  return (
    <Card className={`hover:shadow-md transition-all cursor-pointer ${className}`}>
      <CardContent className="p-6">
        <Button
          variant="ghost"
          className="w-full h-auto p-0 flex flex-col items-center gap-4 hover:bg-transparent"
          onClick={onClick}
          disabled={disabled}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="text-primary text-2xl">
              {icon}
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  )
}
