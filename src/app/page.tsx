import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DocVault</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/signup">
              <Button>Inscription</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gérez vos documents en toute{' '}
            <span className="text-blue-600">sécurité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stockez, organisez et protégez vos documents importants avec des rappels automatiques 
            et un partage sécurisé. Votre coffre-fort numérique personnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Stockage sécurisé</h3>
            <p className="text-gray-600">
              Chiffrement des documents avant stockage pour une protection maximale
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Organisation intuitive</h3>
            <p className="text-gray-600">
              Catégories, tags et recherche avancée pour retrouver facilement vos documents
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2zM10 19h10v-2H10v2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rappels automatiques</h3>
            <p className="text-gray-600">
              Alertes pour les documents à renouveler, plus jamais d'oubli
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-32">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 DocVault. Tous droits réservés.</p>
          <p className="mt-2 text-gray-400">
            Développé avec ❤️ pour simplifier la gestion de documents personnels.
          </p>
        </div>
      </footer>
    </div>
  )
} 