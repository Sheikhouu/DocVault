'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  Menu, 
  Search, 
  ShoppingCart, 
  User, 
  FileText, 
  Settings, 
  LogOut, 
  Crown,
  X,
  HelpCircle,
  Sun,
  Moon,
  FolderOpen
} from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Simuler si l'utilisateur est connecté (à remplacer par vraie logique auth)
  const isLoggedIn = false
  const userName = "Jean Dupont"

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      // Focus sur l'input de recherche
      setTimeout(() => {
        const searchInput = document.getElementById('global-search')
        searchInput?.focus()
      }, 100)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Fonctionnalité de recherche globale (comme Ctrl+F)
      const searchText = searchQuery.toLowerCase()
      const bodyText = document.body.innerText.toLowerCase()
      
      if (bodyText.includes(searchText)) {
        // Highlight le texte trouvé
        window.find(searchQuery, false, false, true, false, true, false)
      }
    }
  }

  return (
    <>
      {/* Header fixe en haut */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16">
        <div className="w-full px-1 h-full">
          <div className="flex items-center justify-between h-full w-full">
            
            {/* Section Gauche : Menu + Recherche - Collée à l'extrémité */}
            <div className="flex items-center gap-1 flex-1">
              {/* Menu Hamburger */}
              <Tooltip content="Ouvrir le menu" side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="hover:bg-muted"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </Tooltip>

              {/* Loupe de Recherche */}
              <Tooltip content="Rechercher sur la page" side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                  className="hover:bg-muted"
                  aria-label="Recherche"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </Tooltip>
            </div>

            {/* Section Centre : Logo DocVault - Centré parfaitement */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <FolderOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DocVault
                </span>
              </Link>
            </div>

            {/* Section Droite : Panier + Compte - Collée à l'extrémité */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              {/* Panier (Offres) */}
              <Tooltip content="Voir les offres et tarifs" side="bottom">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted relative"
                  aria-label="Voir les offres"
                  asChild
                >
                  <Link href="/pricing">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      !
                    </span>
                  </Link>
                </Button>
              </Tooltip>

              {/* Compte Utilisateur */}
              <div className="relative">
                <Tooltip content="Compte utilisateur" side="bottom">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hover:bg-muted"
                    aria-label="Compte utilisateur"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </Tooltip>

                {/* Menu déroulant utilisateur */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-2">
                    {isLoggedIn ? (
                      <>
                        {/* Utilisateur connecté */}
                        <div className="px-4 py-2 border-b border-border">
                          <p className="font-medium">{userName}</p>
                          <p className="text-sm text-muted-foreground">Premium</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                          <FileText className="w-4 h-4" />
                          Mes Documents
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                          <Crown className="w-4 h-4" />
                          Upgrade Premium
                        </Link>
                        <hr className="my-2" />
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-destructive">
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Utilisateur non connecté */}
                        <Link href="/signin" className="block px-4 py-2 hover:bg-muted">
                          Se connecter
                        </Link>
                        <Link href="/signup" className="block px-4 py-2 hover:bg-muted">
                          Créer un compte
                        </Link>
                        <hr className="my-2" />
                        <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 hover:bg-muted">
                          <Crown className="w-4 h-4" />
                          Voir les offres
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Hamburger Slide-out */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMenu} />
          <div className="fixed left-0 top-0 h-full w-72 bg-background border-r border-border p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <nav className="space-y-1">
              {/* Navigation principale */}
              <div className="space-y-1 mb-4">
                <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <span className="text-lg">🏠</span>
                  Accueil
                </Link>
                <Link href="/features" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <span className="text-lg">⭐</span>
                  Fonctionnalités
                </Link>
                <Link href="/pricing" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <span className="text-lg">💎</span>
                  Tarifs
                </Link>
                <Link href="/about" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <span className="text-lg">ℹ️</span>
                  À propos
                </Link>
                <Link href="/contact" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <span className="text-lg">📧</span>
                  Contact
                </Link>
              </div>

              <hr className="border-border" />

              {/* Utilitaires */}
              <div className="space-y-1 mt-4">
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted w-full text-left"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
                </button>
                
                <Link href="/help" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-muted">
                  <HelpCircle className="w-5 h-5" />
                  Aide & Assistance
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Barre de recherche overlay */}
      {isSearchOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border p-4">
          <form onSubmit={handleSearch} className="container mx-auto">
            <div className="relative max-w-2xl mx-auto">
              <Input
                id="global-search"
                type="text"
                placeholder="Rechercher sur la page (comme Ctrl+F)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Button type="submit" size="sm" variant="ghost">
                  Chercher
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={toggleSearch}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Overlay pour fermer les menus */}
      {(isUserMenuOpen || isSearchOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsSearchOpen(false)
          }} 
        />
      )}
    </>
  )
}
