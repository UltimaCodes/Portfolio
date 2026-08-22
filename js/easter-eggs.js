// Interactive easter-egg system — click/drag/hover/key-sequence triggers,
// separate from the keyword-typing eggs in homepage-effects.js.
(function() {
    'use strict';

    window.easterEggs = {
        _registered: [],
        register: function(name, config) {
            this._registered.push({ name, ...config });
            if (config.type === 'keydown-sequence') this._armKeySequence(config);
            if (config.type === 'click-target') this._armClickTarget(config);
            if (config.type === 'hover-hold') this._armHoverHold(config);
            if (config.type === 'drag-target') this._armDragTarget(config);
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
        _armDragTarget: function(config) {
            const source = document.querySelector(config.sourceSelector);
            const target = document.querySelector(config.targetSelector);
            if (!source || !target) return;
            source.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', 'egg'));
            target.addEventListener('dragover', (e) => e.preventDefault());
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer.getData('text/plain') === 'egg') config.onTrigger();
            });
        }
    };

    function initInteractiveEggs() {
        // Only run on homepage
        if (!document.querySelector('.title-container')) return;

        // Konami-style arrow sequence — screen shake
        window.easterEggs.register('konami-glitch', {
            type: 'keydown-sequence',
            sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
            onTrigger: function() {
                document.body.classList.add('konami-active');
                setTimeout(() => document.body.classList.remove('konami-active'), 4000);
            }
        });

        // Drag the dog onto the title — fires the same devourer sequence
        // that also runs automatically every 45s
        window.easterEggs.register('dog-devour', {
            type: 'drag-target',
            sourceSelector: '.dog',
            targetSelector: '.title',
            onTrigger: function() {
                if (typeof window.triggerDevourerSequence === 'function') window.triggerDevourerSequence();
            }
        });

        // Rapid-click the cat — spins through the roulette fast
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

        // Hover-hold the "wgat" nav logo — reveals what it means, then reverts
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
    }

    // Hidden clickable element in the footer — present on every page, not
    // just the homepage, since the footer is shared across the whole site
    function initHiddenFooterEgg() {
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
    }

    function init() {
        initInteractiveEggs();
        initHiddenFooterEgg();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
