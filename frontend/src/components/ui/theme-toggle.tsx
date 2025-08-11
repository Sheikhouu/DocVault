'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Récupérer le thème depuis localStorage au chargement
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // Détecter la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Appliquer le thème au DOM
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
      title={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
      </span>
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