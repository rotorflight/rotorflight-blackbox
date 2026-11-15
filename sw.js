"use strict";

/**
 * Service worker for the web (PWA) build of the Blackbox Explorer.
 *
 * Strategy: network-first for every same-origin GET. A successful response is stored in the
 * cache and returned; if the network is unavailable the cached copy is served instead. This
 * means an online user always gets the latest deployment (no stale-version problems), and an
 * installed app keeps working offline once it has been opened online at least once.
 *
 * On the first visit the page and its assets load before this worker is registered, so they
 * never pass through the fetch handler. To cover that, install precaches the start URL, and
 * js/pwa_register.js posts the URLs the page has already loaded ('cache-urls' message) so they
 * are cached too.
 *
 * Caches are per-origin, and several deployments (latest/, pr/<n>/, ...) share the GitHub Pages
 * origin, so the cache name includes this worker's scope to keep them apart.
 *
 * Registered by js/pwa_register.js; not used by the NW.js desktop build.
 */

var CACHE_NAME = 'rf-blackbox:' + self.registration.scope;

function isSameOrigin(url) {
    return new URL(url, self.location.href).origin === self.location.origin;
}

// Cache each URL independently, so one failed asset does not stop the rest being cached.
function cacheUrls(urls) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return Promise.all(urls.filter(isSameOrigin).map(function (url) {
            return cache.add(url).catch(function (e) {
                console.warn('Service worker could not cache', url, e);
            });
        }));
    });
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.add('./');
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'cache-urls' && Array.isArray(data.urls)) {
        event.waitUntil(cacheUrls(data.urls));
    }
});

self.addEventListener('fetch', function (event) {
    var request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    if (!isSameOrigin(request.url)) {
        return; // e.g. the GitHub releases API used by the update checker
    }

    event.respondWith(
        fetch(request).then(function (response) {
            if (response.ok && response.type === 'basic') {
                var copy = response.clone();
                // Keep the worker alive until the write finishes; a failed write must not
                // affect the response that is already on its way to the page.
                event.waitUntil(
                    caches.open(CACHE_NAME).then(function (cache) {
                        return cache.put(request, copy);
                    }).catch(function (e) {
                        console.warn('Service worker could not cache', request.url, e);
                    })
                );
            }
            return response;
        }).catch(function () {
            return caches.open(CACHE_NAME).then(function (cache) {
                return cache.match(request, { ignoreSearch: request.mode === 'navigate' });
            }).then(function (cached) {
                return cached || Response.error();
            });
        })
    );
});
