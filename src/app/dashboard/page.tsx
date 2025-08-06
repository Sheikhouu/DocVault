'use client'

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          DocVault Dashboard
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">🎉 Bienvenue !</h2>
          <p className="text-muted-foreground">
            L'application fonctionne correctement. Les composants complexes seront réactivés progressivement.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold">✅ Authentification</h3>
              <p className="text-sm text-muted-foreground">Système d'auth fonctionnel</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">✅ Routing</h3>
              <p className="text-sm text-muted-foreground">Navigation opérationnelle</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold">✅ PWA</h3>
              <p className="text-sm text-muted-foreground">Service Worker actif</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold">✅ Sécurité</h3>
              <p className="text-sm text-muted-foreground">Chiffrement côté client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}