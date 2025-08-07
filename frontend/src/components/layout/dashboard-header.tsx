'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  ChevronDown,
  LogOut
} from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
  userEmail: string
  onLogout: () => void
  onSearch: () => void
  onNotifications: () => void
  onSettings: () => void
}

export function DashboardHeader({ 
  userName, 
  userEmail, 
  onLogout, 
  onSearch, 
  onNotifications, 
  onSettings 
}: DashboardHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSearch}
            className="hidden sm:flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher...</span>
          </Button>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* Action buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotifications}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
          >
            <Settings className="w-5 h-5" />
            <span className="sr-only">Paramètres</span>
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={onSettings}
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mt-4 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onSearch}
          className="w-full justify-start"
        >
          <Search className="w-4 h-4 mr-2" />
          Rechercher...
        </Button>
      </div>
    </header>
  )
}