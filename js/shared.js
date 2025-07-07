// Shared utilities and Google Analytics setup
(function() {
    'use strict';

    // Google Analytics setup
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-74WXTDJ616');

    // Utility functions
    window.utils = {
        // Debounce function for performance optimization
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Safe element selector
        getElement: function(selector) {
            return document.querySelector(selector);
        },

        // Safe element creation
        createElement: function(tag, className, textContent) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (textContent) element.textContent = textContent;
            return element;
        },

        // Responsive breakpoint checker
        isMobile: function() {
            return window.innerWidth <= 768;
        },

        // Smooth scroll utility
        smoothScroll: function(target, duration = 800) {
            const targetElement = typeof target === 'string' ? this.getElement(target) : target;
            if (!targetElement) return;

            const targetPosition = targetElement.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        }
    };
})();