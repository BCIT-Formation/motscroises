/**
 * Service worker — Mots Croisés (PWA).
 * Stratégie : « réseau d'abord » pour les navigations (les déploiements
 * atteignent ainsi les clients), « cache d'abord » au fil de l'eau pour les
 * ressources statiques. L'application est 100 % statique, tout peut être
 * servi hors ligne après la première visite.
 */

const CACHE_NAME = 'motscroises-v1';
const PRECACHE = ['/', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navigations : réseau d'abord, sinon les clients resteraient bloqués sur
  // l'ancienne version après un déploiement (le cache n'est jamais invalidé).
  // Hors ligne, repli sur la coquille en cache, avec ignoreSearch pour que
  // les liens de partage (/?s=…) fonctionnent aussi sans réseau.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});
