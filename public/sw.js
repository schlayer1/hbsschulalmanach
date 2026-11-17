// Service Worker für HBS Schulalmanach (Volle PWA & Offline-Support)
const CACHE_NAME = 'hbs-almanach-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/app-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/Siegel_bunt.png',
];

const OFFLINE_CORPUS_ASSETS = [
  '/data/corpus-chunks.json',
  '/data/corpus-embeddings.bin',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(STATIC_ASSETS);
      // Korpus-Daten im Hintergrund für echte Offline-Suche vorhalten
      await Promise.all(
        OFFLINE_CORPUS_ASSETS.map((asset) => cache.add(asset).catch(() => null))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // 1. Keine Caches für API-Routen (/api/gemini, /api/embed)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Navigations-Anfragen & Korpus-Daten (/data/): NETWORK-FIRST mit Offline-Fallback
  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/data/');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches
            .match(event.request)
            .then((hit) => hit || caches.match('/index.html') || caches.match('/'));
        })
    );
    return;
  }

  // 3. Statische Assets (JS, CSS, Bilder, Fonts): Cache-First mit Netzwerk-Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((fetchError) => {
          return cachedResponse || Promise.reject(fetchError);
        });
    })
  );
});
