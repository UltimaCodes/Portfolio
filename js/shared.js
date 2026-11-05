// Shared utilities and Google Analytics setup
(function() {
    'use strict';

    // Site root, worked out from where this file was loaded from, so asset
    // paths resolve the same on ryaan.org, a github.io subpath, or a local
    // server, no matter how deep the current page is.
    const scriptSrc = document.currentScript ? document.currentScript.src : location.href;
    const siteRoot = scriptSrc.replace(/js\/shared\.js(\?.*)?$/, '');

    // Old links ending in .html still work, the address bar just shouldn't show it
    const cleanPath = location.pathname.replace(/(^|\/)index(\.html)?$/, '$1').replace(/\.html$/, '');
    if (cleanPath !== location.pathname && location.protocol.startsWith('http')) {
        history.replaceState(null, '', cleanPath + location.search + location.hash);
    }

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

    // The settings page writes to these and everything else reads from them.
    // Asking for less motion in your OS turns the moving stuff off by default.
    const DEFAULTS = { theme: 'dark', bg: 'on', motion: 'on', sound: 'on' };
    const calmByDefault = ['bg', 'motion'];

    window.siteSettings = {
        get: function(key) {
            try {
                const saved = localStorage.getItem(key);
                if (saved) return saved;
            } catch (e) { /* private window, fall through to the default */ }
            if (calmByDefault.includes(key) && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';
            return DEFAULTS[key];
        },

        set: function(key, value) {
            try { localStorage.setItem(key, value); } catch (e) { /* just won't persist */ }
            document.dispatchEvent(new CustomEvent('settingchange', { detail: { key, value } }));
        }
    };

    function applyMotion() {
        document.documentElement.dataset.motion = siteSettings.get('motion');
    }
    applyMotion();

    // Years old, worked out here so the number can't quietly go stale
    function stampAge() {
        const born = new Date('2008-08-15T00:00:00');
        const now = new Date();
        let years = now.getFullYear() - born.getFullYear();
        if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) years--;
        document.querySelectorAll('.age-years').forEach(el => { el.textContent = String(years); });
    }

    // Time in Karachi, for the footer
    function stampLocalTime() {
        const time = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit'
        }).format(new Date());
        document.querySelectorAll('.local-time').forEach(el => { el.textContent = time; });
    }

    // The saved choice itself gets applied by the inline script in each head,
    // so the page doesn't flash the wrong theme before this file loads.
    function initThemeButton() {
        const button = document.querySelector('.theme-btn');
        const root = document.documentElement;
        const label = () => {
            if (button) button.textContent = root.dataset.theme === 'light' ? 'dark' : 'light';
        };
        label();

        if (button) {
            button.addEventListener('click', () => {
                siteSettings.set('theme', root.dataset.theme === 'light' ? 'dark' : 'light');
            });
        }

        document.addEventListener('settingchange', e => {
            if (e.detail.key === 'theme') {
                root.dataset.theme = e.detail.value;
                label();
            }
            if (e.detail.key === 'motion') applyMotion();
        });
    }

    function init() {
        document.querySelectorAll('.footer-year').forEach(el => { el.textContent = String(new Date().getFullYear()); });
        stampAge();
        stampLocalTime();
        setInterval(stampLocalTime, 30000);
        initThemeButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
