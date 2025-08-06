'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Mode clair'
      case 'dark':
        return 'Mode sombre'
      default:
        return 'Mode système'
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="relative"
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  )
}

export function ThemeToggleDetailed() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="flex items-center space-x-2"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Clair</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="flex items-center space-x-2"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Sombre</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="flex items-center space-x-2"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Auto</span>
      </Button>
    </div>
  )
}