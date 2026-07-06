const CACHE_NAME = "fitness-lite-v5.1";
const FILES = [
  "/",
  "/index.html",
  "/history.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/assets/db192.png",
  "/assets/db512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
