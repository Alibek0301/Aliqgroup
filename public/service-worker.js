const CACHE_NAME = 'aliq-cache-v1';
const urls = [
  '/',
  '/index.html',
  '/services.html',
  '/schedule.html',
  '/faq.html',
  '/styles.css',
  '/main.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
