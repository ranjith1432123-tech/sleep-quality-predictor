const CACHE_NAME = 'sleep-predictor-v1';
const ASSETS = [
    './',
    './index.html',
    './predictor.html',
    './styles.css',
    './script.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install: cache all core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS.filter(url => !url.startsWith('https://')));
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache-first for local assets, network-first for CDN
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isLocal = url.origin === self.location.origin;

    if (isLocal) {
        // Cache-first strategy for local files
        event.respondWith(
            caches.match(event.request).then((cached) => {
                return cached || fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                });
            })
        );
    } else {
        // Network-first for CDN (fonts, icons)
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});
