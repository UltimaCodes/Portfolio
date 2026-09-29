// Shared utilities and Google Analytics setup
(function() {
    'use strict';

    // Site root, worked out from where this file was loaded from, so asset
    // paths resolve the same on ryaan.org, a github.io subpath, or a local
    // server, no matter how deep the current page is.
    const scriptSrc = document.currentScript ? document.currentScript.src : location.href;
    const siteRoot = scriptSrc.replace(/js\/shared\.js(\?.*)?$/, '');

    // Google Analytics, loaded once here so every page is actually counted
    // (the tag used to be pasted into only four of the thirteen pages).
    const GA_ID = 'G-74WXTDJ616';
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_ID);
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(gaScript);

    window.utils = {
        asset: function(path) {
            return siteRoot + path.replace(/^\//, '');
        },

        debounce: function(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        },

        getElement: function(selector) {
            return document.querySelector(selector);
        },

        createElement: function(tag, className, textContent) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = textContent;
            return element;
        }
    };

    function stampFooterYear() {
        document.querySelectorAll('.footer-year').forEach(el => {
            el.textContent = String(new Date().getFullYear());
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', stampFooterYear);
    } else {
        stampFooterYear();
    }
})();
