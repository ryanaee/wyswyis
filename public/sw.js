/**
 * WYSWYIS Service Worker
 *
 * Strategy:
 * - App shell (HTML, hashed JS/CSS) → network-first, cache as fallback
 * - Static assets (images, fonts) → cache-first, refresh in background
 * - External APIs (Sheets, Nominatim, Google Fonts) → network-only
 */

const CACHE_NAME = 'wyswyis-v1'

// Seed the cache with the bare minimum on install
const PRECACHE = ['/', '/manifest.json']

// Origins we should never try to cache (external APIs & CDNs)
const EXTERNAL_ORIGINS = [
  'https://sheets.googleapis.com',
  'https://nominatim.openstreetmap.org',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]

function isExternal(url) {
  return EXTERNAL_ORIGINS.some((o) => url.startsWith(o))
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  )
  // Activate immediately without waiting for old clients to close
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  // Take control of all open clients immediately
  self.clients.claim()
})

// ── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Let external API calls go straight to the network
  if (isExternal(request.url)) return

  const url = new URL(request.url)

  if (request.destination === 'document') {
    // ── HTML navigations: network-first so the app always updates ──────────
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match('/'))
        )
    )
  } else if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|svg|jpg|jpeg|webp|ico|woff2?)$/)
  ) {
    // ── Hashed assets & images: cache-first (they never change) ────────────
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
  } else {
    // ── Everything else: network with cache fallback ────────────────────────
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
  }
})
