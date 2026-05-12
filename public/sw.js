// public/sw.js
// Service Worker — ReservaFácil PWA
// Cache-first para assets estáticos, network-first para API

const CACHE_NAME = 'reservafacil-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Instala e pré-cacheia assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Supabase e Z-API — sempre network (nunca cacheia dados sensíveis)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('z-api.io')) {
    event.respondWith(fetch(request))
    return
  }

  // Assets estáticos — cache-first
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        }).catch(() => caches.match('/index.html')) // fallback offline
      })
    )
  }
})
