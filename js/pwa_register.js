"use strict";

/**
 * Registers the service worker (sw.js) so the web build can be installed as a Progressive Web
 * App and keeps working offline. Skipped inside the NW.js desktop shell, which is already an
 * installed app, and wherever service workers are unavailable (file://, plain http on a
 * non-localhost host, older browsers).
 *
 * Must be loaded after js/browser_compat.js, which defines window.isNWjs().
 */
(function () {
    if (window.isNWjs() || !('serviceWorker' in navigator) || !window.isSecureContext) {
        return;
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function (e) {
            console.warn('Service worker registration failed', e);
        });
    });
})();
