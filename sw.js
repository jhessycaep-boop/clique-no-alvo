const CACHE_NAME = 'clique-no-alvo-cache-v11'; // altere a cada grande atualização
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sounds/hit.mp3',
  './sounds/miss.mp3',
  './sounds/powerup.mp3'
];

// Durante a instalação, adiciona todos os arquivos ao cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // força ativação imediata
});

// Durante a ativação, remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // remove cache antigo
          }
        })
      );
    })
  );
  self.clients.claim(); // assume o controle imediato
});

// Intercepta requisições e usa cache, mas sempre tenta buscar atualização
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cached); // se falhar, usa cache
      return cached || fetchPromise;
    })
  );
});