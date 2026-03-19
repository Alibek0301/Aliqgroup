const CACHE_NAME = 'aliq-cache-v4';
const urls = [
  '/',
  '/index.html',
  '/services.html',
  '/schedule.html',
  '/faq.html',
  '/privacy.html',
  '/styles.css',
  '/main.js',
  '/config.js',
  '/offline.html',
  '/logo.png',
  '/manifest.json',
  '/services/mvp.html',
  '/services/integration.html',
  '/services/websites.html',
  '/services/consulting.html',
  '/services/automation.html',
  '/services/security.html',
  '/robots.txt',
  '/404.html'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const reqUrl = new URL(req.url);
  if (reqUrl.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('/offline.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
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
