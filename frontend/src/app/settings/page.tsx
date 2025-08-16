'use client'

import { useState } from 'react'
import { 
  User,
  Shield,
  CreditCard,
  Download,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: 'François Pierre',
    email: 'francois.pierre@email.com',
    phone: '+33 6 12 34 56 78'
  })

  const handleSave = () => {
    setIsEditing(false)
    // Ici on sauvegarderait les données
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        {/* Settings Content */}
        <div className="flex-1 flex">
          {/* Settings Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-6">Paramètres</h2>
            
            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'profile' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 mr-3" />
                Profil
              </Button>
              
              <Button 
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'security' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield className="w-4 h-4 mr-3" />
                Sécurité
              </Button>
              
              
              <Button 
                variant={activeTab === 'billing' ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === 'billing' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('billing')}
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Facturation
              </Button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-8">
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold">Profil utilisateur</h1>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      FP
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">François Pierre</h3>
                      <p className="text-gray-400">Membre depuis janvier 2024</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Plan actuel</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Plan Gratuit</h4>
                          <p className="text-sm text-gray-400">5 documents • 100 MB de stockage</p>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Passer au plan supérieur
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold mb-6">Sécurité</h1>
                
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Changer le mot de passe</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="mt-1 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Changer le mot de passe
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Authentification à deux facteurs</h3>
                    <p className="text-gray-400 mb-4">
                      Ajoutez une couche de sécurité supplémentaire à votre compte.
                    </p>
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      Activer l'authentification à deux facteurs
                    </Button>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'billing' && (
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold mb-6">Facturation</h1>
                
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Plan actuel</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Plan Gratuit</h4>
                        <p className="text-sm text-gray-400">0€/mois</p>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Passer au plan supérieur
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Documents inclus</span>
                        <span>5 / 5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stockage inclus</span>
                        <span>100 MB / 100 MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Méthodes de paiement</h3>
                    <p className="text-gray-400 mb-4">
                      Aucune méthode de paiement configurée
                    </p>
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      Ajouter une méthode de paiement
                    </Button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium mb-4">Historique des factures</h3>
                    <p className="text-gray-400">
                      Aucune facture disponible
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}