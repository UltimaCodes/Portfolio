// Interactive easter eggs: click, hover, key-sequence and scroll triggers.
// The typed keyword eggs live in homepage-effects.js.
(function() {
    'use strict';

    window.easterEggs = {
        register: function(name, config) {
            if (config.type === 'keydown-sequence') this._armKeySequence(config);
            if (config.type === 'click-target') this._armClickTarget(config);
            if (config.type === 'hover-hold') this._armHoverHold(config);
            if (config.type === 'modifier-click') this._armModifierClick(config);
            if (config.type === 'scroll-rush') this._armScrollRush(config);
        },
        _armKeySequence: function(config) {
            let buffer = [];
            document.addEventListener('keydown', (e) => {
                buffer.push(e.key);
                if (buffer.length > config.sequence.length) buffer.shift();
                if (buffer.join(',') === config.sequence.join(',')) {
                    buffer = [];
                    config.onTrigger();
                }
            });
        },
        _armClickTarget: function(config) {
            const el = document.querySelector(config.selector);
            if (!el) return;
            let count = 0;
            let resetTimer;
            el.addEventListener('click', () => {
                count++;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => { count = 0; }, config.resetMs || 1500);
                if (count >= config.clicksRequired) {
                    count = 0;
                    config.onTrigger();
                }
            });
        },
        _armHoverHold: function(config) {
            const el = document.querySelector(config.selector);
            if (!el) return;
            let holdTimer;
            el.addEventListener('mouseenter', () => {
                holdTimer = setTimeout(config.onTrigger, config.holdMs || 2000);
            });
            el.addEventListener('mouseleave', () => clearTimeout(holdTimer));
        },
        _armModifierClick: function(config) {
            document.addEventListener('click', (e) => {
                if (config.modifier === 'shift' && e.shiftKey) config.onTrigger(e);
            });
        },
        _armScrollRush: function(config) {
            let hitBottom = false;
            let bottomTime = 0;
            window.addEventListener('scroll', () => {
                const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
                const atTop = window.scrollY < 10;
                if (atBottom) { hitBottom = true; bottomTime = Date.now(); }
                if (atTop && hitBottom && Date.now() - bottomTime < (config.windowMs || 2000)) {
                    hitBottom = false;
                    config.onTrigger();
                }
            });
        }
    };

    function initHomepageOnlyEggs() {
        if (!document.querySelector('.title-container')) return;

        window.easterEggs.register('dog-devour', {
            type: 'click-target',
            selector: '.dog',
            clicksRequired: 1,
            onTrigger: function() {
                if (typeof window.triggerDevourerSequence === 'function') window.triggerDevourerSequence();
            }
        });

        window.easterEggs.register('cat-frenzy', {
            type: 'click-target',
            selector: '#cat-img',
            clicksRequired: 5,
            resetMs: 1500,
            onTrigger: function() {
                const img = document.querySelector('#cat-img');
                if (!img) return;
                img.classList.add('cat-frenzy-spin');
                let spins = 0;
                const cats = ['images/cat1.png', 'images/cat2.png', 'images/cat3.png', 'images/cat4.png', 'images/cat5.png'];
                const spinInterval = setInterval(() => {
                    img.src = cats[spins % cats.length];
                    img.alt = `Pixel cat ${spins % cats.length + 1}`;
                    spins++;
                    if (spins > 10) {
                        clearInterval(spinInterval);
                        img.classList.remove('cat-frenzy-spin');
                    }
                }, 100);
            }
        });
    }

    // Sitewide eggs. Every page, since the elements they use (nav logo,
    // footer, page body) exist everywhere.
    function initSitewideEggs() {
        window.easterEggs.register('konami-glitch', {
            type: 'keydown-sequence',
            sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
            onTrigger: function() {
                document.body.classList.add('konami-active');
                setTimeout(() => document.body.classList.remove('konami-active'), 4000);
            }
        });

        window.easterEggs.register('wgat-hover-reveal', {
            type: 'hover-hold',
            selector: '.nav-home',
            holdMs: 2000,
            onTrigger: function() {
                const el = document.querySelector('.nav-home');
                if (!el) return;
                const original = el.textContent;
                el.textContent = '"wait, genuinely?"';
                el.classList.add('glitch');
                setTimeout(() => {
                    el.textContent = original;
                    el.classList.remove('glitch');
                }, 2500);
            }
        });

        window.easterEggs.register('shift-click-static', {
            type: 'modifier-click',
            modifier: 'shift',
            onTrigger: function() {
                const flash = document.createElement('div');
                flash.className = 'static-flash';
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 250);
            }
        });

        window.easterEggs.register('scroll-rush', {
            type: 'scroll-rush',
            windowMs: 2000,
            onTrigger: function() {
                const el = document.createElement('div');
                el.className = 'scroll-rush-msg glitch';
                el.textContent = 'WHERE\'S THE FIRE';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }
        });
    }

    // Hidden clickable element in the footer, plus a triple-click on the
    // copyright text itself, both sitewide since every page has a footer.
    function initFooterEggs() {
        const footer = document.querySelector('footer');
        if (!footer || document.querySelector('#hidden-secret')) return;

        const dot = document.createElement('span');
        dot.id = 'hidden-secret';
        dot.textContent = '•';
        dot.setAttribute('aria-hidden', 'true');
        footer.appendChild(dot);
        window.easterEggs.register('hidden-footer-dot', {
            type: 'click-target',
            selector: '#hidden-secret',
            clicksRequired: 1,
            onTrigger: function() {
                dot.classList.add('found');
                dot.textContent = 'you found it. there is nothing else here.';
            }
        });

        footer.id = footer.id || 'site-footer';
        window.easterEggs.register('footer-triple-click', {
            type: 'click-target',
            selector: 'footer',
            clicksRequired: 3,
            resetMs: 1200,
            onTrigger: function() {
                const note = document.createElement('div');
                note.className = 'footer-note glitch';
                note.textContent = 'TERMS: THERE ARE NO TERMS';
                footer.appendChild(note);
                setTimeout(() => note.remove(), 2500);
            }
        });
    }

    function init() {
        initHomepageOnlyEggs();
        initSitewideEggs();
        initFooterEggs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
