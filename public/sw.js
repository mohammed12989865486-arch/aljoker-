/**
 * Progressive Web App (PWA) Service Worker - AlJoker App
 * Designed for reliable installation on mobile and desktop devices.
 * Integrates an intelligent split caching model:
 * - Dynamic caching for static assets
 * - Safe bypass for live developer servers to prevent dynamic compilation/module 404s.
 */

const CACHE_NAME = 'joker-pwa-v5';

// Pre-cache core shell resources
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching core assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // Only handle standard HTTP/HTTPS requests
  if (!requestUrl.startsWith('http')) {
    return;
  }

  // Bypass cache completely for POST, PUT, DELETE, etc.
  if (event.request.method !== 'GET') {
    return;
  }

  const urlObj = new URL(requestUrl);

  // CRITICAL BYPASS: Skip service worker cache for any Vite development/HMR or AI Studio Dev environment components
  const isDevAsset = 
    urlObj.port === '3000' ||
    urlObj.hostname === 'localhost' ||
    urlObj.hostname === '127.0.0.1' ||
    urlObj.hostname.includes('ais-dev-') ||
    urlObj.pathname.includes('@vite') ||
    urlObj.pathname.includes('@id') ||
    urlObj.pathname.includes('/src/') ||
    urlObj.pathname.includes('/node_modules/') ||
    urlObj.pathname.endsWith('.ts') ||
    urlObj.pathname.endsWith('.tsx');

  if (isDevAsset) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network First with Cache Fallback strategy for normal assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, clone and save to cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is down/offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is main page, return index root
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
