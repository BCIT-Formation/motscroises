/**
 * Tests unitaires de public/sw.js : stratégie de cache du service worker.
 * Le script est évalué dans un environnement simulé (self, caches, fetch)
 * pour vérifier le routage des requêtes sans navigateur.
 */

import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';

const SW_SOURCE = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

const ORIGIN = 'https://example.com';

/** Supprime la partie recherche (?…) d'une URL. */
function stripSearch(url) {
  const u = new URL(url);
  u.search = '';
  return u.href;
}

/** Instancie le service worker avec un cache et un réseau simulés. */
function createSW({ cached = {}, fetchImpl } = {}) {
  const store = new Map(Object.entries(cached));
  const listeners = {};

  const cache = {
    addAll: vi.fn(async (urls) => {
      for (const u of urls) store.set(new URL(u, ORIGIN).href, { ok: true, url: u });
    }),
    put: vi.fn(async (request, response) => {
      store.set(request.url, response);
    }),
  };

  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => []),
    delete: vi.fn(async () => true),
    match: vi.fn(async (request, options) => {
      if (store.has(request.url)) return store.get(request.url);
      if (options?.ignoreSearch) {
        const target = stripSearch(request.url);
        for (const [key, value] of store) {
          if (stripSearch(key) === target) return value;
        }
      }
      return undefined;
    }),
  };

  const fetchMock = vi.fn(fetchImpl || (async () => ({ ok: true, clone: () => ({}) })));

  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    location: { origin: ORIGIN },
  };

  new Function('self', 'caches', 'fetch', SW_SOURCE)(self, caches, fetchMock);

  /** Déclenche l'événement fetch et retourne la réponse produite. */
  async function dispatchFetch(request) {
    let response;
    listeners.fetch({
      request,
      respondWith: (p) => { response = p; },
      waitUntil: () => {},
    });
    return response;
  }

  return { listeners, caches, cache, fetchMock, dispatchFetch, store };
}

function navRequest(url) {
  return { method: 'GET', url, mode: 'navigate' };
}

function assetRequest(url) {
  return { method: 'GET', url, mode: 'no-cors' };
}

describe('service worker : navigations', () => {
  it('sert la version réseau même si une copie est en cache (mises à jour)', async () => {
    const fresh = { ok: true, clone: () => ({}) };
    const { dispatchFetch, fetchMock } = createSW({
      cached: { [`${ORIGIN}/`]: { ok: true, stale: true } },
      fetchImpl: async () => fresh,
    });

    const response = await dispatchFetch(navRequest(`${ORIGIN}/`));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response).toBe(fresh);
  });

  it('hors ligne, sert la coquille en cache pour une URL de partage (?s=…)', async () => {
    const shell = { ok: true, shell: true };
    const { dispatchFetch } = createSW({
      cached: { [`${ORIGIN}/`]: shell },
      fetchImpl: async () => { throw new TypeError('réseau indisponible'); },
    });

    const response = await dispatchFetch(navRequest(`${ORIGIN}/?d=3&t=tous&l=fr&s=424242`));
    expect(response).toBe(shell);
  });
});

describe('service worker : ressources statiques', () => {
  it('sert le cache sans toucher au réseau quand la ressource est en cache', async () => {
    const asset = { ok: true };
    const { dispatchFetch, fetchMock } = createSW({
      cached: { [`${ORIGIN}/icon.svg`]: asset },
    });

    const response = await dispatchFetch(assetRequest(`${ORIGIN}/icon.svg`));
    expect(response).toBe(asset);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('récupère puis met en cache une ressource absente du cache', async () => {
    const fresh = { ok: true, clone: () => fresh };
    const { dispatchFetch, fetchMock, cache } = createSW({ fetchImpl: async () => fresh });

    const response = await dispatchFetch(assetRequest(`${ORIGIN}/autre.js`));
    expect(response).toBe(fresh);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(cache.put).toHaveBeenCalled();
  });

  it('ignore les requêtes vers une autre origine', async () => {
    const { dispatchFetch, fetchMock } = createSW();
    const response = await dispatchFetch(assetRequest('https://autre-site.test/lib.js'));
    expect(response).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
