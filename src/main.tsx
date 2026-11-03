import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// 1. Vite Chunk Loading Self-Healing (bei neuen Builds und geänderten Asset-Hashes)
window.addEventListener('vite:preloadError', async (event) => {
  console.warn('Vite Preload-Fehler erkannt, leere Caches und lade neu:', event);
  event.preventDefault();
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    // ignore
  }
  window.location.reload();
});

// 2. Globaler Fallback für dynamische Import-Fehler
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('dynamically imported module') || msg.includes('Failed to fetch module') || msg.includes('Loading chunk')) {
    console.warn('Chunk-Ladefehler abgefangen, lade Seite neu...');
    window.location.reload();
  }
});

// 3. PWA Service Worker Registration mit automatischer Cache-Aktualisierung
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Prüfe ob ein neuer Service Worker wartet
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Neuer HBS Almanach Stand verfügbar.');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('ServiceWorker Registrierung fehlgeschlagen:', err);
      });
  });
}

// 4. React Root mit robuster ErrorBoundary
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
