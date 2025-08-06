'use client'

import { useState, useEffect } from 'react'

/**
 * Utilitaires PWA pour DocVault
 * Gestion de l'installation, mise à jour et fonctionnalités offline
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null
  private serviceWorker: ServiceWorkerRegistration | null = null
  private isOnline = true
  private updateAvailable = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPWA()
    }
  }

  private async initPWA() {
    // Écouter l'événement d'installation
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as BeforeInstallPromptEvent
      this.dispatchEvent('pwa-installable', { canInstall: true })
    })

    // Écouter l'installation réussie
    window.addEventListener('appinstalled', () => {
      console.log('✅ DocVault PWA installée avec succès')
      this.deferredPrompt = null
      this.dispatchEvent('pwa-installed', {})
    })

    // Statut réseau
    this.isOnline = navigator.onLine
    window.addEventListener('online', () => {
      this.isOnline = true
      this.dispatchEvent('pwa-online', { isOnline: true })
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.dispatchEvent('pwa-offline', { isOnline: false })
    })

    // Enregistrer le Service Worker
    await this.registerServiceWorker()
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        this.serviceWorker = registration

        console.log('🔧 DocVault SW enregistré:', registration.scope)

        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Mise à jour disponible
                  console.log('🔄 DocVault SW: Mise à jour disponible')
                  this.updateAvailable = true
                  this.dispatchEvent('pwa-update-available', {})
                } else {
                  // Premier cache terminé
                  console.log('✅ DocVault SW: Contenu mis en cache pour utilisation offline')
                  this.dispatchEvent('pwa-cached', {})
                }
              }
            })
          }
        })

        // Service Worker contrôleur actif
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          window.location.reload()
          refreshing = true
        })

      } catch (error) {
        console.error('❌ DocVault SW: Erreur enregistrement:', error)
      }
    }
  }

  private dispatchEvent(type: string, detail: any) {
    window.dispatchEvent(new CustomEvent(type, { detail }))
  }

  // API publique

  /**
   * Vérifier si l'app peut être installée
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null
  }

  /**
   * Déclencher l'installation de la PWA
   */
  async install(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string } | null> {
    if (!this.deferredPrompt) {
      return null
    }

    this.deferredPrompt.prompt()
    const choiceResult = await this.deferredPrompt.userChoice
    this.deferredPrompt = null

    return choiceResult
  }

  /**
   * Vérifier si l'app est déjà installée
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  /**
   * Statut de connexion
   */
  getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Forcer la mise à jour du Service Worker
   */
  async updateServiceWorker(): Promise<boolean> {
    if (this.serviceWorker) {
      try {
        await this.serviceWorker.update()
        if (this.serviceWorker.waiting) {
          this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' })
          return true
        }
      } catch (error) {
        console.error('❌ DocVault SW: Erreur mise à jour:', error)
      }
    }
    return false
  }

  /**
   * Vérifier s'il y a une mise à jour disponible
   */
  hasUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  /**
   * Informations PWA
   */
  getPWAInfo() {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled(),
      isOnline: this.isOnline,
      hasUpdate: this.updateAvailable,
      serviceWorkerReady: !!this.serviceWorker
    }
  }

  /**
   * Partager du contenu (Web Share API)
   */
  async share(data: { title?: string; text?: string; url?: string }) {
    if (navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (error) {
        console.error('❌ Erreur partage:', error)
      }
    }
    return false
  }

  /**
   * Informations sur l'appareil
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      connection: (navigator as any).connection || null
    }
  }
}

// Instance globale
export const pwaManager = new PWAManager()

// Hook React pour utiliser PWA
export function usePWA() {
  const [pwaState, setPwaState] = useState({
    canInstall: false,
    isInstalled: false,
    isOnline: true,
    hasUpdate: false,
    showInstallPrompt: false
  })

  useEffect(() => {
    // État initial
    setPwaState(prevState => ({
      ...prevState,
      ...pwaManager.getPWAInfo()
    }))

    // Écouteurs d'événements PWA
    const handleInstallable = () => {
      setPwaState(prev => ({ ...prev, canInstall: true, showInstallPrompt: true }))
    }

    const handleInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, canInstall: false, showInstallPrompt: false }))
    }

    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
    }

    const handleUpdateAvailable = () => {
      setPwaState(prev => ({ ...prev, hasUpdate: true }))
    }

    window.addEventListener('pwa-installable', handleInstallable)
    window.addEventListener('pwa-installed', handleInstalled)
    window.addEventListener('pwa-online', handleOnline)
    window.addEventListener('pwa-offline', handleOffline)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('pwa-online', handleOnline)
      window.removeEventListener('pwa-offline', handleOffline)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const installPWA = async () => {
    const result = await pwaManager.install()
    if (result?.outcome === 'accepted') {
      setPwaState(prev => ({ ...prev, showInstallPrompt: false }))
    }
    return result
  }

  const dismissInstallPrompt = () => {
    setPwaState(prev => ({ ...prev, showInstallPrompt: false }))
  }

  const updateApp = async () => {
    const updated = await pwaManager.updateServiceWorker()
    if (updated) {
      setPwaState(prev => ({ ...prev, hasUpdate: false }))
    }
    return updated
  }

  return {
    ...pwaState,
    installPWA,
    dismissInstallPrompt,
    updateApp,
    share: pwaManager.share.bind(pwaManager),
    deviceInfo: pwaManager.getDeviceInfo()
  }
}

