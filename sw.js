const CACHE_NAME = 'ob-calculator-v15';
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

// Fetch Event: Stale-While-Revalidate Strategy with Background Update
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // 1. Trigger background network fetch to update cache for next time
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failure is expected when offline; safe to ignore here
          });

        // 2. Return cached response instantly if available, otherwise wait on the network
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetchPromise.catch(() => {
          // Fallback to index.html if navigating offline and asset isn't in cache
          if (event.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
        });
      });
    }),
  );
});
