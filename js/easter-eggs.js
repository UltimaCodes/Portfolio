// Interactive easter-egg system. Click/drag/hover/key-sequence triggers,
// plus a sitewide discovery tracker that also counts the original
// keyword-typed eggs from homepage-effects.js (via markFound()).
(function() {
    'use strict';

    const STORAGE_KEY = 'ryaan-secrets-found';

    // Every secret on the site, keyword-typed ones included, so the
    // tracker covers the whole site, not just the new interaction-based ones.
    const ALL_EGGS = [
        { name: 'dogger', label: 'Type "dogger"' },
        { name: 'ultrakill', label: 'Type "ultrakill"' },
        { name: 'nanomachines', label: 'Type "nanomachines"' },
        { name: 'determination', label: 'Type "determination"' },
        { name: 'spamton', label: 'Type "spamton"' },
        { name: 'jonkler', label: 'Type "jonkler"' },
        { name: 'matrix', label: 'Type "matrix"' },
        { name: 'konami-glitch', label: 'The classic 8-key sequence' },
        { name: 'dog-devour', label: 'Drag the dog somewhere it shouldn’t go' },
        { name: 'dog-double-click', label: 'Double-click the dog' },
        { name: 'cat-frenzy', label: 'Click the cat like you mean it' },
        { name: 'wgat-hover-reveal', label: 'Hold still on the logo' },
        { name: 'hidden-footer-dot', label: 'Something’s hiding in the footer' },
        { name: 'footer-triple-click', label: 'The copyright notice has opinions' },
        { name: 'shift-click-static', label: 'Shift + click anywhere' },
        { name: 'scroll-rush', label: 'Scroll like you’re late for something' }
    ];

    function loadFound() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveFound(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
        catch (e) { /* private browsing etc, tracker just won't persist */ }
    }

    function showToast(label) {
        const toast = document.createElement('div');
        toast.className = 'secret-toast';
        toast.textContent = `SECRET FOUND: ${label.toUpperCase()}`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    function updateBadge() {
        const badge = document.querySelector('#secrets-badge-count');
        if (badge) badge.textContent = `${loadFound().length}/${ALL_EGGS.length}`;
    }

    window.easterEggs = {
        _registered: [],
        markFound: function(name) {
            const found = loadFound();
            if (found.includes(name)) return; // already known, no toast spam
            found.push(name);
            saveFound(found);
            const entry = ALL_EGGS.find(e => e.name === name);
            showToast(entry ? entry.label : name);
            updateBadge();
        },
        register: function(name, config) {
            this._registered.push({ name, ...config });
            const wrappedTrigger = () => { config.onTrigger(); this.markFound(name); };
            const armed = { ...config, onTrigger: wrappedTrigger };
            if (config.type === 'keydown-sequence') this._armKeySequence(armed);
            if (config.type === 'click-target') this._armClickTarget(armed);
            if (config.type === 'hover-hold') this._armHoverHold(armed);
            if (config.type === 'drag-target') this._armDragTarget(armed);
            if (config.type === 'double-click') this._armDoubleClick(armed);
            if (config.type === 'modifier-click') this._armModifierClick(armed);
            if (config.type === 'scroll-rush') this._armScrollRush(armed);
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
        },
        _armDoubleClick: function(config) {
            const el = document.querySelector(config.selector);
            if (!el) return;
            el.addEventListener('dblclick', config.onTrigger);
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
            type: 'drag-target',
            sourceSelector: '.dog',
            targetSelector: '.title',
            onTrigger: function() {
                if (typeof window.triggerDevourerSequence === 'function') window.triggerDevourerSequence();
            }
        });

        window.easterEggs.register('dog-double-click', {
            type: 'double-click',
            selector: '.dog',
            onTrigger: function() {
                const dog = document.querySelector('.dog');
                if (!dog) return;
                dog.style.transition = 'transform 0.15s ease';
                dog.style.transform = 'translateY(-50%) scale(1.15) rotate(-3deg)';
                setTimeout(() => { dog.style.transform = 'translateY(-50%) scale(1.15) rotate(3deg)'; }, 150);
                setTimeout(() => { dog.style.transform = 'translateY(-50%)'; dog.style.transition = ''; }, 300);
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

    // Small progress badge, bottom-right, every page. Click to see the checklist.
    function initSecretsBadge() {
        if (document.querySelector('#secrets-badge')) return;
        const badge = document.createElement('div');
        badge.id = 'secrets-badge';
        badge.innerHTML = `<span id="secrets-badge-count">0/0</span> secrets`;
        document.body.appendChild(badge);
        updateBadge();

        const overlay = document.createElement('div');
        overlay.id = 'secrets-overlay';
        overlay.innerHTML = `
            <div class="secrets-overlay-panel card-shell">
                <div class="card-titlebar">SECRETS <span id="secrets-overlay-count"></span></div>
                <div class="card-body" id="secrets-overlay-list"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        function renderChecklist() {
            const found = loadFound();
            document.querySelector('#secrets-overlay-count').textContent = `${found.length}/${ALL_EGGS.length}`;
            document.querySelector('#secrets-overlay-list').innerHTML = ALL_EGGS.map(egg => {
                const isFound = found.includes(egg.name);
                return `<div class="secret-row ${isFound ? 'found' : ''}">${isFound ? '✓' : '?'} ${isFound ? egg.label : '???'}</div>`;
            }).join('');
        }

        badge.addEventListener('click', () => {
            renderChecklist();
            overlay.classList.add('open');
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    }

    function init() {
        initHomepageOnlyEggs();
        initSitewideEggs();
        initFooterEggs();
        initSecretsBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
