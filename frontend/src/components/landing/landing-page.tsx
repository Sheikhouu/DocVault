'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FeaturesSection } from './features-section'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="text-6xl font-bold">🗂️</div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DocVault
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Gérez vos documents importants en toute sécurité avec le chiffrement de bout en bout
            </p>
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
            
            {/* Freemium Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                🎁 Gratuit jusqu'à 5 documents • Pas de carte de crédit requise
              </Badge>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm font-semibold">Chiffrement AES-256</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🇪🇺</div>
                <div className="text-sm font-semibold">Données en Europe</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-sm font-semibold">Démarrage instantané</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-semibold">Mobile & Desktop</div>
              </CardContent>
            </Card>
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