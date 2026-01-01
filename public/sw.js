
const CACHE_NAME = 'klas-plus-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isStatic = url.includes('/_next/static/');
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url);
  const isFont = /\.(woff|woff2|ttf|otf|eot)$/i.test(url);

  if ((isStatic || isImage || isFont) && event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('Cache hit:', url);
          return response;
        }

        console.log('Cache miss, fetching:', url);
        return fetch(event.request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          return caches.match(event.request);
        });
      })
    );
  }
});