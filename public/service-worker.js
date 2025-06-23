const CACHE_NAME = 'aliq-cache-v2';
const urls = [
  '/',
  '/index.html',
  '/services.html',
  '/schedule.html',
  '/faq.html',
  '/styles.css',
  '/main.js',
  '/offline.html',
  '/logo.png',
  '/manifest.json',
  '/services/mvp.html',
  '/services/integration.html',
  '/services/websites.html',
  '/services/consulting.html',
  '/services/automation.html',
  '/services/security.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      if (resp) return resp;
      return fetch(e.request).catch(() => caches.match('/offline.html'));
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'AliQ Group';
  const options = {
    body: data.body || 'У нас есть обновления!',
    icon: '/logo.png'
  };
  e.waitUntil(self.registration.showNotification(title, options));
});
