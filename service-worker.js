// pillO Service Worker v3
// Enables offline mode and installability

const CACHE_NAME = 'pillo-v3';
const ASSETS = [
  '/pillo-app/',
  '/pillo-app/pillo-v3-complete.html',
  '/pillo-app/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // Silent fail — app still works online
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notifications (future)
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'pillO', {
    body: data.body || "Time for your medication 💊",
    icon: '/pillo-app/icons/icon-192.png',
    badge: '/pillo-app/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/pillo-app/pillo-v3-complete.html' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/pillo-app/pillo-v3-complete.html'));
});
