
const CACHE_NAME = 'nauha-offline-v2';
const FILES = ['/index.html','/styles.css','/lyrics.json'];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(resp => resp || fetch(evt.request).then(r=> { return caches.open(CACHE_NAME).then(cache=>{ cache.put(evt.request, r.clone()); return r; }); }).catch(()=> caches.match('/index.html'))));
});
