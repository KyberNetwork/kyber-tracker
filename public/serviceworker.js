var CACHE_NAME = 'Kyber-cache-v3';
var urlsToCache = [
  'https://tracker.kyber.network/manifest.json',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache '+CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(function(e) {
        console.log('Error from caches open', e);
      })
  )
});

self.addEventListener('fetch', function(event) {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
          // Cache hit - return response
          if (response) {
            console.log('got it from cache', event.request);
            return response;
          }
          return fetch(event.request);
        }
      )
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
