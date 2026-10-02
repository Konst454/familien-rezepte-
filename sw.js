// Service Worker: hält die App-Dateien offline bereit.
// Beim Ändern von Dateien VERSION erhöhen, damit alle Geräte die neue Version laden.
const VERSION = 'v9';
const CACHE = 'creative-recipes-' + VERSION;
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/store.js', 'js/store-local.js', 'js/store-firebase.js', 'js/firebase-config.js',
  'js/timers.js', 'js/examples.js', 'js/theme.js',
  'js/lib/format.js', 'js/lib/parse.js', 'js/lib/aisles.js', 'js/lib/symbols.js', 'js/lib/icons.js', 'js/lib/shop.js', 'js/lib/family.js', 'js/lib/photo.js', 'js/lib/motion.js',
  'js/views/library.js', 'js/views/recipe.js', 'js/views/editor.js', 'js/views/cook.js', 'js/views/timers.js',
  'js/views/planner.js', 'js/views/shopping.js', 'js/views/account.js', 'js/views/login.js', 'js/views/wishes.js', 'js/views/lab.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Eigene Dateien: erst Netz (damit Updates sofort ankommen), sonst Zwischenspeicher.
// Firebase und Schriften laufen direkt übers Netz bzw. über den Firebase-eigenen Offline-Speicher.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
