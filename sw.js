"use strict";

/**
 * Service worker for the web (PWA) build of the Blackbox Explorer.
 *
 * Strategy: network-first for every same-origin GET. A successful response is stored in the
 * cache and returned; if the network is unavailable the cached copy is served instead. This
 * means an online user always gets the latest deployment (no stale-version problems), and an
 * installed app keeps working offline once it has been opened online at least once.
 *
 * Caches are per-origin, and several deployments (latest/, pr/<n>/, ...) share the GitHub Pages
 * origin, so the cache name includes this worker's scope to keep them apart.
 *
 * Registered by js/pwa_register.js; not used by the NW.js desktop build.
 */

var CACHE_NAME = 'rf-blackbox:' + self.registration.scope;

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    var request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    var url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        return; // e.g. the GitHub releases API used by the update checker
    }

    event.respondWith(
        fetch(request).then(function (response) {
            if (response.ok && response.type === 'basic') {
                var copy = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    return cache.put(request, copy);
                });
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
