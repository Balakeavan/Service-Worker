// Define a cache name, which helps in versioning your cache
const CACHE_NAME = 'my-app-cache-v1';

// List of files to cache during installation
const urlsToCache = [
    '/', // Caches the root URL (index.html)
    '/index.html',
    '/style.css',
    '/app.js'
    // Add any other essential assets (images, fonts, etc.)
];

// Install event: Fired when the service worker is first installed
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activates the new service worker immediately
    );
});

// Activate event: Fired when the service worker is activated
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of existing clients immediately
    );
});

// Fetch event: Fired for every network request made by the controlled pages
self.addEventListener('fetch', (event) => {
    // Only intercept requests for assets within our origin
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // If a cached response is found, return it
                    if (response) {
                        console.log('[Service Worker] Serving from cache:', event.request.url);
                        return response;
                    }
                    // Otherwise, fetch from the network
                    return fetch(event.request)
                        .then((networkResponse) => {
                            // Cache the new response for future use
                            return caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse.clone());
                                console.log('[Service Worker] Caching new resource:', event.request.url);
                                return networkResponse;
                            });
                        })
                        .catch(() => {
                            // Fallback for offline if network fails and nothing in cache (e.g., for navigation)
                            // You might want to serve an offline page here
                            console.log('[Service Worker] Network request failed and no cache match for:', event.request.url);
                            // Example: return caches.match('/offline.html');
                        });
                })
        );
    }
});
