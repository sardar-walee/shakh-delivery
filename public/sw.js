const CACHE_NAME = 'shakh-shell-v1';
const APP_SHELL = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache Supabase/Auth/Realtime requests or non-GET requests.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) {
    return;
  }

  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok && (request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'font')) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
