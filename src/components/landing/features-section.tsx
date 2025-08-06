'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const features = [
  {
    icon: '🔐',
    title: 'Sécurité Maximale',
    description: 'Chiffrement AES-256 de bout en bout. Vos documents sont protégés selon les standards militaires.',
    benefits: ['Chiffrement AES-256', 'Zero-knowledge', 'Données en Europe'],
    color: 'success'
  },
  {
    icon: '⏰',
    title: 'Rappels Intelligents',
    description: 'Ne manquez plus jamais une échéance. Notifications push, email et SMS personnalisables.',
    benefits: ['Notifications multi-canaux', 'Rappels personnalisés', 'Calendrier intégré'],
    color: 'primary'
  },
  {
    icon: '📱',
    title: 'Mobile-First',
    description: 'Interface optimisée pour tous vos appareils. Synchronisation automatique en temps réel.',
    benefits: ['Responsive design', 'Synchronisation temps réel', 'Mode hors-ligne'],
    color: 'accent'
  },
  {
    icon: '🤝',
    title: 'Partage Sécurisé',
    description: 'Partagez vos documents en toute sécurité avec des liens temporaires et contrôle d\'accès.',
    benefits: ['Liens temporaires', 'Contrôle d\'accès', 'Historique des partages'],
    color: 'warning'
  },
  {
    icon: '📊',
    title: 'Tableau de Bord',
    description: 'Vue d\'ensemble complète de vos documents, rappels et statistiques d\'utilisation.',
    benefits: ['Analytics détaillés', 'Vue d\'ensemble', 'Rapports personnalisés'],
    color: 'secondary'
  },
  {
    icon: '🔍',
    title: 'Recherche Avancée',
    description: 'Trouvez instantanément vos documents grâce à la recherche intelligente et aux filtres.',
    benefits: ['Recherche full-text', 'Filtres avancés', 'Tags personnalisés'],
    color: 'primary'
  }
]

const colorClasses = {
  success: 'bg-success/10 text-success border-success/20',
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20'
}

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4">
            ✨ Fonctionnalités
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            DocVault combine sécurité, simplicité et fonctionnalités avancées pour une gestion de documents optimale
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover-lift border-0 shadow-lg bg-card/50 backdrop-blur-sm group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-background to-muted flex items-center justify-center text-3xl shadow-inner">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div 
                      key={benefitIndex}
                      className="flex items-center justify-center gap-2 text-sm"
                    >
                      <div className={`w-2 h-2 rounded-full ${colorClasses[feature.color as keyof typeof colorClasses].split(' ')[0]}`}></div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à sécuriser vos documents ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Rejoignez des milliers d'utilisateurs qui font confiance à DocVault pour protéger leurs documents importants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="gradient" size="lg">
                <Link href="/signup">
                  <span className="mr-2">🚀</span>
                  Commencer gratuitement
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signin">
                  J'ai déjà un compte
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}