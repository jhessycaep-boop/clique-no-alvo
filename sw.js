const CACHE_NAME = "clique-no-alvo-v30";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./hit.mp3",
  "./miss.mp3",
  "./powerup.mp3",
  "./rare.mp3",
  "./scare.mp3",
  "./ice.mp3",
  "./portal.mp3",
  "./electric.mp3"
  "./magnet.mp3"
  "./invisible.mp3"
  "./bonus.mp3"
  "./troll.mp3"
];

self.addEventListener("install", e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k=>{
        if(k!==CACHE_NAME) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
