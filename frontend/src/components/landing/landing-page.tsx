'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { HeroSlider } from './hero-slider'
import { FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { FeaturesSection } from './features-section'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-secondary/20">
      {/* Header avec navbar moderne */}
      <Header />
      
      {/* Hero Slider - 20cm juste après la navbar */}
      <div className="mt-16">
        <HeroSlider />
      </div>
      
      {/* Hero Section - avec espacement pour header + slider */}
      <div className="container mx-auto px-4 pt-16 pb-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Title & Description */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DocVault
            </h1>
            <div className="space-y-4 max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-muted-foreground">
                La plateforme de gestion documentaire nouvelle génération pour les professionnels et particuliers exigeants
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Centralisez, organisez et sécurisez tous vos documents importants avec notre solution cloud intelligente. 
                Rappels automatiques, partage sécurisé, recherche avancée et synchronisation multi-appareils pour une productivité maximale.
              </p>
              <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
                <span className="font-medium text-primary">Sécurité militaire :</span> Chiffrement AES-256 avec clés RSA-4096, 
                architecture zero-knowledge et stockage distribué conforme SOC 2 Type II.
              </p>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                  🚀 Créer un compte gratuit
                </Button>
              </Link>
              <Link href="/signin" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Indicators - Version compacte */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🔒</span>
                <span className="font-medium">AES-256</span>
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">🇪🇺</span>
                <span className="font-medium">Données EU</span>
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">⚡</span>
                <span className="font-medium">Instantané</span>
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">📱</span>
                <span className="font-medium">Multi-appareils</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Version Pro avec tableau comparatif */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section Pro */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                🚀 Passez au niveau supérieur
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Procurez-vous DocVault Pro
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Débloquez toutes les fonctionnalités avancées et profitez d'une expérience premium sans limites
              </p>
            </div>

            {/* Tableau de comparaison */}
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-6 font-semibold text-lg">Caractéristiques</th>
                      <th className="text-center p-6 min-w-[120px]">
                        <div className="space-y-2">
                          <div className="text-lg font-bold text-primary">Pro</div>
                          <div className="text-sm text-muted-foreground">€9.99/mois</div>
                        </div>
                      </th>
                      <th className="text-center p-6 min-w-[120px]">
                        <div className="space-y-2">
                          <div className="text-lg font-bold text-green-600">Gratuit</div>
                          <div className="text-sm text-muted-foreground">€0/mois</div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="p-4">
                        <div className="font-medium">Nombre de documents</div>
                        <div className="text-sm text-muted-foreground">Stockez vos fichiers importants</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                          <span className="text-xs font-bold">∞</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Illimité</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
                          <span className="text-xs font-bold">5</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">5 documents</div>
                      </td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-4">
                        <div className="font-medium">Stockage cloud</div>
                        <div className="text-sm text-muted-foreground">Espace de stockage sécurisé</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">100 GB</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">1 GB</div>
                      </td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-4">
                        <div className="font-medium">Rappels avancés</div>
                        <div className="text-sm text-muted-foreground">Notifications intelligentes</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">SMS + Email</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Email uniquement</div>
                      </td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-4">
                        <div className="font-medium">Support prioritaire</div>
                        <div className="text-sm text-muted-foreground">Assistance dédiée</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">24/7</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-gray-600 text-xs">✗</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Email standard</div>
                      </td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-4">
                        <div className="font-medium">Recherche IA</div>
                        <div className="text-sm text-muted-foreground">Trouvez vos documents instantanément</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">IA avancée</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-gray-600 text-xs">✗</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Recherche simple</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <div className="font-medium">Intégrations tierces</div>
                        <div className="text-sm text-muted-foreground">Connectez vos outils favoris</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">50+ apps</div>
                      </td>
                      <td className="text-center p-4">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-gray-600 text-xs">✗</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Aucune</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* CTA Section */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-t border-border/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="font-semibold text-lg">Prêt à passer Pro ?</div>
                    <div className="text-sm text-muted-foreground">Essai gratuit de 14 jours • Annulation à tout moment</div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/pricing">
                        Voir tous les tarifs
                      </Link>
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90" asChild>
                      <Link href="/signup?plan=pro">
                        <span className="mr-2">🚀</span>
                        Essayer Pro gratuitement
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/30 py-16">
        <FeaturesSection />
      </div>

      {/* CTA Final */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Prêt à sécuriser vos documents ?</h2>
          <p className="text-lg text-muted-foreground">
            Rejoignez les milliers d'utilisateurs qui font confiance à DocVault pour protéger leurs documents importants.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Commencer gratuitement maintenant
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ? <Link href="/signin" className="text-primary hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}