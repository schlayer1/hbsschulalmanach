// Service Worker für HBS Schulalmanach (Offline-Support auf iPads)
const CACHE_NAME = 'hbs-almanach-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Sofort aktivieren ohne auf Schließen der Tabs zu warten
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Lösche alle alten Cache-Versionen (z. B. hbs-almanach-v1)
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Keine Caches für API-Routen (/api/gemini)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Navigations-Anfragen (HTML / index.html): IMMER NETWORK-FIRST!
  // Verhindert das "Stale index.html pointing to dead hashed assets"-Problem nach neuen Builds
  const isNavigation = event.request.mode === 'navigate' || 
                       (event.request.headers.get('accept') || '').includes('text/html') ||
                       url.pathname === '/' || 
                       url.pathname === '/index.html';

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
          // Offline-Fallback wenn kein Netz vorhanden ist
          return caches.match('/index.html') || caches.match('/');
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

      return fetch(event.request).then((networkResponse) => {
        // Nicht cachen bei Fehlern (404, 500) oder Nicht-Standard-Antworten
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((fetchError) => {
        // Bei Netzwerkabbruch
        return cachedResponse || Promise.reject(fetchError);
      });
    })
  );
});
