'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight, Download, Shield, Sparkles, Briefcase } from 'lucide-react'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    title: "Nos Services Complets",
    subtitle: "Gestion de documents • Rappels • Partage sécurisé",
    description: "DocVault vous accompagne dans la gestion de tous vos documents importants avec des outils professionnels.",
    cta: "Découvrir nos services",
    ctaLink: "/features",
    background: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500",
    icon: <Briefcase className="w-12 h-12 text-white" />,
    features: ["📁 Stockage illimité", "⚡ Synchronisation rapide", "🔄 Sauvegarde auto", "📊 Analytics avancées"]
  },
  {
    id: 2,
    title: "Nouvelles Fonctionnalités",
    subtitle: "IA • Reconnaissance de texte • Recherche intelligente",
    description: "Découvrez nos dernières innovations : reconnaissance automatique de texte, IA pour organiser vos documents et bien plus !",
    cta: "Voir les nouveautés",
    ctaLink: "/features#new",
    background: "bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500",
    icon: <Sparkles className="w-12 h-12 text-white" />,
    features: ["🤖 IA intégrée", "📝 OCR avancé", "🔍 Recherche intelligente", "🎯 Auto-catégorisation"]
  },
  {
    id: 3,
    title: "App Mobile DocVault",
    subtitle: "Disponible sur iOS et Android",
    description: "Accédez à vos documents partout avec notre application mobile. Scan, upload et partage en un clic !",
    cta: "Télécharger l'app",
    ctaLink: "/download",
    background: "bg-gradient-to-br from-green-600 via-green-500 to-emerald-500",
    icon: <Download className="w-12 h-12 text-white" />,
    features: ["📱 iOS & Android", "📷 Scan intégré", "☁️ Sync temps réel", "🔒 Touch/Face ID"]
  },
  {
    id: 4,
    title: "Sécurité Enterprise",
    subtitle: "Protection utilisée par Netflix, Google, Amazon, Microsoft",
    description: "Vos documents sont protégés par le même niveau de chiffrement que les plus grandes entreprises technologiques mondiales.",
    cta: "En savoir plus",
    ctaLink: "/security",
    background: "bg-gradient-to-br from-red-600 via-red-500 to-orange-500",
    icon: <Shield className="w-12 h-12 text-white" />,
    features: ["🔐 AES-256", "🏢 Standards Enterprise", "🇪🇺 RGPD compliant", "🛡️ Zero-knowledge"]
  },
  {
    id: 5,
    title: "Offre Gratuite",
    subtitle: "Jusqu'à 5 documents • Aucune carte de crédit requise",
    description: "Découvrez DocVault sans engagement ! Stockage sécurisé, rappels intelligents et toutes les fonctionnalités essentielles incluses dans votre compte gratuit.",
    cta: "Commencer gratuitement",
    ctaLink: "/signup",
    background: "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500",
    icon: <Sparkles className="w-12 h-12 text-white" />,
    features: ["🎁 5 documents gratuits", "☁️ Stockage sécurisé", "📱 Multi-appareils", "⚡ Activation instantanée"]
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change toutes les 5 secondes

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false) // Arrêter l'auto-play quand l'utilisateur interagit
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="relative h-[20rem] w-full overflow-hidden">
      {/* Slide Container */}
      <div 
        className={`relative w-full h-full transition-all duration-700 ease-in-out ${currentSlideData.background}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto w-full px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Texte à gauche */}
              <div className="text-white space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  {currentSlideData.icon}
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Slide {currentSlide + 1}/5
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl lg:text-4xl font-bold">
                    {currentSlideData.title}
                  </h2>
                  <p className="text-base lg:text-lg text-white/90">
                    {currentSlideData.subtitle}
                  </p>
                  <p className="text-white/80 text-sm lg:text-base max-w-lg">
                    {currentSlideData.description}
                  </p>
                </div>

                <Button 
                  asChild 
                  size="default" 
                  className="bg-white text-gray-900 hover:bg-white/90 font-medium text-sm"
                >
                  <Link href={currentSlideData.ctaLink}>
                    {currentSlideData.cta}
                  </Link>
                </Button>
              </div>

              {/* Features à droite */}
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-base mb-4">Points clés :</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentSlideData.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-white/90 text-xs"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-sm">{feature.split(' ')[0]}</span>
                        <span>{feature.split(' ').slice(1).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation centrée en bas avec flèches et dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          {/* Flèche gauche */}
          <Tooltip content="Slide précédent" side="top">
            <button
              onClick={prevSlide}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 transition-all"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          </Tooltip>

          {/* Dots Indicator */}
          <div className="flex gap-1.5">
            {slides.map((_, index) => (
              <Tooltip key={index} content={`${slides[index].title}`} side="top">
                <button
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Aller au slide ${index + 1}`}
                />
              </Tooltip>
            ))}
          </div>

          {/* Flèche droite */}
          <Tooltip content="Slide suivant" side="top">
            <button
              onClick={nextSlide}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 transition-all"
              aria-label="Slide suivant"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </Tooltip>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: isAutoPlaying ? `${((Date.now() % 5000) / 5000) * 100}%` : '0%'
            }}
          />
        </div>
      </div>

      {/* Famous Companies Badge (pour le slide sécurité) */}
      {currentSlide === 3 && (
        <div className="absolute top-4 right-4 z-20 animate-slide-down">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg">
            <p className="text-[10px] text-gray-600 mb-1">Même protection que :</p>
            <div className="flex gap-1 text-sm">
              <span title="Netflix">🎬</span>
              <span title="Google">🔍</span>
              <span title="Amazon">📦</span>
              <span title="Microsoft">💻</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
