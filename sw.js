const CACHE_NAME = 'neon-business-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './inventory.html',
    './treasury.html',
    './settings.html',
    './about.html',
    './database.js',
    './style.css',
    './manifest.json',
    'https://unpkg.com/@phosphor-icons/web',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Install silently to prevent one bad asset breaking the whole PWA caching.
            return Promise.allSettled(ASSETS_TO_CACHE.map(url => {
                const req = new Request(url, { mode: url.startsWith('http') ? 'no-cors' : 'cors' });
                return fetch(req).then(response => {
                    if (response.status < 400 || response.type === 'opaque') {
                        return cache.put(req, response);
                    }
                }).catch(err => console.log('SW Install Fetch Error', url, err));
            }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    // Stale-While-Revalidate with dynamic caching for CDN resources (fonts, etc.)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                }
                return networkResponse;
            }).catch(() => {
                // Offline scenario : silently ignore network error and rely on cachedResponse
            });

            return cachedResponse || fetchPromise;
        })
    );
});