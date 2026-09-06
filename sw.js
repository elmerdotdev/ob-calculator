const CACHE_NAME = 'ob-calculator-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './lmp-calculator.html',
  './ultrasound-calculator.html',
  './bmi-calculator.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/lmp-script.js',
  './assets/js/ultrasound-script.js',
  './assets/js/bmi-script.js',
  './assets/icons/icon.svg',
];

// Install Event: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache:', key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event: Cache First Strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback to index.html if navigating offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    }),
  );
});
