// DocVault Service Worker
// Version PWA avec cache intelligent et fonctionnalités offline

const CACHE_NAME = 'docvault-v1.0.0'
const STATIC_CACHE = 'docvault-static-v1.0.0'
const DYNAMIC_CACHE = 'docvault-dynamic-v1.0.0'

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/documents',
  '/settings',
  '/signin',
  '/signup',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Stratégies de cache par type de ressource
const CACHE_STRATEGIES = {
  // Cache First: Assets statiques
  CACHE_FIRST: [
    /\/_next\/static\//,
    /\/icons\//,
    /\/images\//,
    /\.woff2?$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.css$/,
    /\.js$/
  ],
  
  // Network First: API et données dynamiques
  NETWORK_FIRST: [
    /\/api\//,
    /supabase\.co/,
    /\/auth\//
  ],
  
  // Stale While Revalidate: Pages et contenu
  STALE_WHILE_REVALIDATE: [
    /\/dashboard/,
    /\/documents/,
    /\/settings/
  ]
}

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 DocVault SW: Installation')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 DocVault SW: Mise en cache des assets statiques')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ DocVault SW: Installation terminée')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('❌ DocVault SW: Erreur installation:', error)
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 DocVault SW: Activation')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer les anciens caches
            if (cacheName.startsWith('docvault-') && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ DocVault SW: Suppression ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ DocVault SW: Activation terminée')
        return self.clients.claim()
      })
  )
})

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return
  }
  
  // Ignorer les requêtes de mise à jour du SW
  if (url.pathname === '/sw.js') {
    return
  }
  
  event.respondWith(handleFetch(request))
})

// Gestionnaire principal des requêtes
async function handleFetch(request) {
  const url = new URL(request.url)
  
  try {
    // Stratégie Cache First (assets statiques)
    if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url.pathname + url.search))) {
      return await cacheFirst(request)
    }
    
    // Stratégie Network First (API)
    if (CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url.hostname + url.pathname))) {
      return await networkFirst(request)
    }
    
    // Stratégie Stale While Revalidate (pages)
    if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(url.pathname))) {
      return await staleWhileRevalidate(request)
    }
    
    // Par défaut: Network First
    return await networkFirst(request)
    
  } catch (error) {
    console.error('❌ DocVault SW: Erreur fetch:', error)
    return await getOfflineFallback(request)
  }
}

// Stratégie Cache First
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

// Stratégie Network First
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Mise à jour en arrière-plan
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Ignorer les erreurs réseau en arrière-plan
  })
  
  // Retourner le cache immédiatement s'il existe
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Sinon attendre la réponse réseau
  return await fetchPromise
}

// Page de fallback offline
async function getOfflineFallback(request) {
  const url = new URL(request.url)
  
  // Pour les pages de navigation
  if (request.mode === 'navigate') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DocVault - Mode Hors Ligne</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              max-width: 500px;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 2rem;
              margin: 0 0 1rem 0;
            }
            p {
              font-size: 1.1rem;
              opacity: 0.9;
              line-height: 1.6;
            }
            .retry-btn {
              background: rgba(255,255,255,0.2);
              border: 2px solid rgba(255,255,255,0.3);
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 1rem;
              cursor: pointer;
              margin-top: 1.5rem;
              transition: all 0.3s ease;
            }
            .retry-btn:hover {
              background: rgba(255,255,255,0.3);
              border-color: rgba(255,255,255,0.5);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🔐</div>
            <h1>DocVault</h1>
            <p>Vous êtes actuellement hors ligne.<br>
            Vérifiez votre connexion internet pour accéder à vos documents sécurisés.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Réessayer
            </button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })
  }
  
  // Pour les autres ressources
  return new Response('Ressource non disponible hors ligne', {
    status: 503,
    statusText: 'Service Unavailable'
  })
}

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      timestamp: new Date().toISOString()
    })
  }
})

// Nettoyage périodique du cache
self.addEventListener('sync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCaches())
  }
})

async function cleanupOldCaches() {
  const caches = await caches.keys()
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE]
  
  return Promise.all(
    caches.map(cacheName => {
      if (!cacheWhitelist.includes(cacheName) && cacheName.startsWith('docvault-')) {
        return caches.delete(cacheName)
      }
    })
  )
}

console.log('🛡️ DocVault Service Worker chargé - Version:', CACHE_NAME)