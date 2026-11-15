"use strict";

/**
 * Registers the service worker (sw.js) so the web build can be installed as a Progressive Web
 * App and keeps working offline. Skipped inside the NW.js desktop shell, which is already an
 * installed app, and wherever service workers are unavailable (file://, plain http on a
 * non-localhost host, older browsers).
 *
 * The page and its assets have already loaded by the time the worker is registered, so they
 * did not pass through it. Once the worker is active, the URLs of everything loaded so far are
 * sent to it to cache, so the app works offline straight after the first online visit.
 *
 * Must be loaded after js/browser_compat.js, which defines window.isNWjs().
 */
(function () {
    if (window.isNWjs() || !('serviceWorker' in navigator) || !window.isSecureContext) {
        return;
    }

    function loadedUrls() {
        var urls = [location.href.split('#')[0]];
        if (window.performance && performance.getEntriesByType) {
            performance.getEntriesByType('resource').forEach(function (entry) {
                if (entry.name.indexOf(location.origin + '/') === 0) {
                    urls.push(entry.name);
                }
            });
        }
        return urls;
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function () {
            return navigator.serviceWorker.ready;
        }).then(function (registration) {
            registration.active.postMessage({ type: 'cache-urls', urls: loadedUrls() });
        }).catch(function (e) {
            console.warn('Service worker registration failed', e);
        });
    });
})();
