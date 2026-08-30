// Interactive easter-egg system. Click/drag/hover/key-sequence triggers,
// plus a sitewide discovery tracker that also counts the original
// keyword-typed eggs from homepage-effects.js (via markFound()).
(function() {
    'use strict';

    // Which eggs have fired this visit, kept in memory only — no tracker,
    // no badge, no localStorage. Just enough bookkeeping so re-triggering
    // the same egg doesn't re-award a ring every time it's clicked.
    const foundThisSession = new Set();

    window.easterEggs = {
        _registered: [],
        onFound: null, // set by initRingFixture; called after every new discovery
        markFound: function(name) {
            if (foundThisSession.has(name)) return;
            foundThisSession.add(name);
            if (typeof this.onFound === 'function') this.onFound(name);
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
    // Referential fixtures. Five sitewide, always-visible interactions built
    // around specific game mechanics rather than a typed keyword and a text
    // popup — same idea as the homepage dog (Devourer of Gods), applied to a
    // few more of the things Ryaan actually likes. All shapes below are
    // drawn in CSS, nothing is a copied sprite or asset from the source games.
    // Real pixel-grid icons (SVG rects on an integer grid, crisp-edged),
    // not smooth CSS shapes. Each is drawn from scratch, not traced from
    // any existing sprite — reads as the idea (a save star, a ring, a
    // parry orb) rather than a copy of one.
    function pixelIcon(layers, viewSize, renderSize) {
        const rects = layers.map(layer =>
            layer.cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${layer.color}"/>`).join('')
        ).join('');
        return `<svg viewBox="0 0 ${viewSize} ${viewSize}" width="${renderSize}" height="${renderSize}" shape-rendering="crispEdges">${rects}</svg>`;
    }

    const ICON_EYE = [
        { color: '#4da6ff', cells: [
            [3,2],[4,2],[5,2],[6,2],[7,2],
            [1,3],[2,3],[8,3],[9,3],
            [0,4],[10,4],
            [0,5],[10,5],
            [1,6],[2,6],[8,6],[9,6],
            [3,7],[4,7],[5,7],[6,7],[7,7]
        ] },
        { color: '#1a3a5c', cells: [[4,4],[5,4],[6,4],[4,5],[6,5]] },
        { color: '#e8f6ff', cells: [[5,5]] }
    ];
    const ICON_SNOWFLAKE = [
        { color: '#8fd9ff', cells: [
            [4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],
            [0,4],[1,4],[2,4],[3,4],[5,4],[6,4],[7,4],[8,4],
            [1,1],[2,2],[3,3],[5,5],[6,6],[7,7],
            [7,1],[6,2],[5,3],[3,5],[2,6],[1,7]
        ] }
    ];

    let ultrakillAudio;
    function getUltrakillAudio() {
        if (!ultrakillAudio) { ultrakillAudio = new Audio('/res/ultrakillsfx.mp3'); ultrakillAudio.volume = 0.5; }
        return ultrakillAudio;
    }

    // Real, CC0-licensed icons where one was actually found (Kenney.nl),
    // self-hosted in images/ the same way every other site image is.
    // The rest (ring, eye, skull, snowflake, the parry starburst) are still
    // the hand-drawn pixel-grid versions above pending a source for those.
    function assetIcon(file, alt, size) {
        return `<img src="/images/${file}" alt="${alt}" width="${size}" height="${size}">`;
    }

    // Undertale/Deltarune: a real save point, not a typed line. Lives in
    // the footer of every page rather than a floating corner button, and
    // actually remembers where you were, not just a flash and a sentence.
    const SAVE_KEY = 'ryaan-savepoint';
    const SAVE_PENDING_KEY = 'ryaan-savepoint-pending';

    function initSavePoint() {
        const footer = document.querySelector('footer');
        if (!footer || document.querySelector('.fixture-savepoint')) return;

        const btn = document.createElement('span');
        btn.className = 'game-fixture fixture-savepoint fixture-footer';
        btn.title = 'Save Point';
        btn.innerHTML = assetIcon('icon-savepoint.png', '', 18);
        footer.appendChild(btn);

        const lines = [
            '* The site remembers you were here.',
            '* A save point hums quietly at the bottom of the page.',
            '* Something about this feels familiar, in a good way.',
            '* Your progress, such as it is, has been noted.'
        ];

        btn.addEventListener('click', () => {
            try {
                localStorage.setItem(SAVE_KEY, JSON.stringify({ page: location.pathname, scroll: window.scrollY }));
            } catch (e) { /* private browsing etc, save just won't persist */ }

            const flash = document.createElement('div');
            flash.className = 'savepoint-flash';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 700);

            const ghost = document.createElement('div');
            ghost.className = 'savepoint-ghost';
            ghost.innerHTML = assetIcon('icon-savepoint-ghost.png', '', 40);
            document.body.appendChild(ghost);
            requestAnimationFrame(() => ghost.classList.add('show'));
            setTimeout(() => {
                ghost.classList.remove('show');
                setTimeout(() => ghost.remove(), 400);
            }, 2200);

            const line = document.createElement('div');
            line.className = 'savepoint-line glitch';
            line.textContent = lines[Math.floor(Math.random() * lines.length)];
            document.body.appendChild(line);
            requestAnimationFrame(() => line.classList.add('show'));
            setTimeout(() => {
                line.classList.remove('show');
                setTimeout(() => line.remove(), 400);
            }, 2200);

            window.easterEggs.markFound('save-point');
        });

        offerContinueFromSave();
    }

    function offerContinueFromSave() {
        // Just arrived here from a cross-page continue click — finish the
        // job by scrolling to the saved spot, no prompt needed twice.
        let pending;
        try { pending = JSON.parse(sessionStorage.getItem(SAVE_PENDING_KEY)); } catch (e) {}
        if (pending && pending.page === location.pathname) {
            try { sessionStorage.removeItem(SAVE_PENDING_KEY); } catch (e) {}
            requestAnimationFrame(() => window.scrollTo({ top: pending.scroll, behavior: 'smooth' }));
            return;
        }

        let saved;
        try { saved = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return; }
        if (!saved) return;
        const samePage = saved.page === location.pathname;
        if (samePage && Math.abs(saved.scroll - window.scrollY) < 100) return; // already there

        const prompt = document.createElement('div');
        prompt.className = 'savepoint-continue glitch';
        prompt.textContent = '* Continue from your save point?';
        document.body.appendChild(prompt);
        requestAnimationFrame(() => prompt.classList.add('show'));

        const dismiss = () => {
            prompt.classList.remove('show');
            setTimeout(() => prompt.remove(), 400);
        };
        prompt.addEventListener('click', () => {
            if (samePage) {
                window.scrollTo({ top: saved.scroll, behavior: 'smooth' });
            } else {
                try { sessionStorage.setItem(SAVE_PENDING_KEY, JSON.stringify(saved)); } catch (e) {}
                location.href = saved.page;
            }
            dismiss();
        });
        setTimeout(dismiss, 6000);
    }

    // Cuphead: parry a pink object on a real timing window, not a click count.
    function scheduleParry() {
        setTimeout(spawnParryObject, 20000 + Math.random() * 20000);
    }

    function spawnParryObject() {
        const obj = document.createElement('div');
        obj.className = 'parry-object';
        obj.innerHTML = assetIcon('icon-parry.png', '', 26);
        const margin = 90;
        const x = margin + Math.random() * Math.max(0, window.innerWidth - margin * 2);
        const y = margin + Math.random() * Math.max(0, window.innerHeight - margin * 2);
        obj.style.left = `${x}px`;
        obj.style.top = `${y}px`;
        document.body.appendChild(obj);

        let parried = false;
        const flashDelay = 900;
        const flashDuration = 450;

        setTimeout(() => { if (obj.parentNode) obj.classList.add('flashing'); }, flashDelay);

        const expireTimer = setTimeout(() => {
            if (!parried && obj.parentNode) {
                obj.remove();
                scatterRings();
            }
            scheduleParry();
        }, flashDelay + flashDuration);

        obj.addEventListener('click', () => {
            if (parried || !obj.classList.contains('flashing')) return;
            parried = true;
            clearTimeout(expireTimer);
            const rect = obj.getBoundingClientRect();
            const star = document.createElement('div');
            star.className = 'parry-success';
            star.innerHTML = assetIcon('icon-parry-star.png', '', 60);
            star.style.left = `${rect.left + rect.width / 2}px`;
            star.style.top = `${rect.top + rect.height / 2}px`;
            document.body.appendChild(star);
            setTimeout(() => star.remove(), 600);
            obj.remove();
            window.easterEggs.markFound('cuphead-parry');
            scheduleParry();
        });
    }

    // Sonic: a persistent ring count. Every discovery anywhere on the site
    // earns a ring (see markFound's onFound hook below); a missed parry
    // scatters them, same grace period the games give you to grab them back.
    let ringCount = 0;
    let ringCountEl;

    function addRings(n) {
        ringCount = Math.max(0, ringCount + n);
        if (ringCountEl) ringCountEl.textContent = String(ringCount);
    }

    function scatterRings() {
        if (!ringCountEl || ringCount === 0) { window.easterEggs.markFound('sonic-rings'); return; }
        const rect = ringCountEl.getBoundingClientRect();
        const lost = Math.min(ringCount, 6);
        addRings(-lost);

        for (let i = 0; i < lost; i++) {
            const particle = document.createElement('div');
            particle.className = 'ring-particle';
            const angle = (Math.PI * 2 * i) / lost + Math.random() * 0.4;
            const dist = 60 + Math.random() * 40;
            particle.style.setProperty('--rx', `${Math.cos(angle) * dist}px`);
            particle.style.setProperty('--ry', `${Math.sin(angle) * dist}px`);
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            document.body.appendChild(particle);
            particle.addEventListener('click', () => {
                addRings(1);
                particle.remove();
            });
            setTimeout(() => { if (particle.parentNode) particle.remove(); }, 1500);
        }
        window.easterEggs.markFound('sonic-rings');
    }

    // Sonic and the Batman/Assassin's Creed/Spider-Man vision toggle both
    // live in the nav now, real fixtures of the site chrome on every page,
    // instead of a floating corner cluster.
    function initNavFixtures() {
        const navRight = document.querySelector('nav .right');
        if (!navRight || document.querySelector('.fixture-vision')) return;

        const visionBtn = document.createElement('span');
        visionBtn.className = 'game-fixture fixture-vision fixture-nav';
        visionBtn.title = 'Vision Mode';
        visionBtn.innerHTML = pixelIcon(ICON_EYE, 11, 18);
        navRight.insertBefore(visionBtn, navRight.firstChild);
        visionBtn.addEventListener('click', () => {
            const on = document.body.classList.toggle('vision-mode');
            if (on) window.easterEggs.markFound('vision-mode');
        });

        const ringEl = document.createElement('span');
        ringEl.className = 'game-fixture fixture-rings fixture-nav';
        ringEl.title = 'Rings';
        ringEl.innerHTML = assetIcon('icon-ring.png', '', 16) + '<span class="ring-count">0</span>';
        navRight.insertBefore(ringEl, navRight.firstChild);
        ringCountEl = ringEl.querySelector('.ring-count');
        window.easterEggs.onFound = function(name) {
            if (name !== 'sonic-rings') addRings(1);
        };

        buildVisionOnlyGlyphs();
    }

    function buildVisionOnlyGlyphs() {
        if (document.querySelector('.vision-glyph-cs2')) return;

        const cs2 = document.createElement('div');
        cs2.className = 'vision-hidden vision-glyph vision-glyph-cs2';
        cs2.title = 'clutch or kick';
        cs2.innerHTML = assetIcon('icon-vision-cs2.png', '', 26);
        document.body.appendChild(cs2);
        cs2.addEventListener('click', () => window.easterEggs.markFound('vision-cs2'));

        const luna = document.createElement('div');
        luna.className = 'vision-hidden vision-glyph vision-glyph-luna';
        luna.title = 'eternal winter';
        luna.innerHTML = pixelIcon(ICON_SNOWFLAKE, 9, 26);
        document.body.appendChild(luna);
        luna.addEventListener('click', () => window.easterEggs.markFound('vision-luna'));
    }

    // Ultrakill: same typed payload and sound as before, now a button
    // instead of a keyword, and placed specifically rather than sitewide —
    // the Gorilla Warfare project page (whose own design philosophy cites
    // Ultrakill directly) and the About page, next to where Ultrakill is
    // actually named among the games Ryaan plays.
    function initUltrakillFixture() {
        const onGorillaWarfare = location.pathname.includes('gorilla-warfare.html');
        const onAbout = location.pathname.includes('about.html');
        if (!onGorillaWarfare && !onAbout) return;
        if (document.querySelector('.fixture-ultrakill')) return;

        let anchor = null;
        if (onGorillaWarfare) {
            anchor = document.querySelector('.proj-side .card-body');
        } else {
            const hobbies = [...document.querySelectorAll('.about-section h2')].find(h => h.textContent.includes('Hobbies'));
            anchor = hobbies ? hobbies.closest('.about-section') : document.querySelector('.about-terminal');
        }
        if (!anchor) return;

        const btn = document.createElement('div');
        btn.className = 'game-fixture fixture-ultrakill fixture-inline';
        btn.innerHTML = assetIcon('icon-ultrakill.png', '', 18) + '<span class="fixture-label">Trigger warning</span>';
        anchor.appendChild(btn);

        btn.addEventListener('click', triggerUltrakillMessage);
    }

    // Repeat clicks in a short window escalate the effect instead of just
    // replaying the same three lines identically every time.
    let ultrakillStreak = 0;
    let ultrakillStreakTimer;

    function triggerUltrakillMessage() {
        ultrakillStreak++;
        clearTimeout(ultrakillStreakTimer);
        ultrakillStreakTimer = setTimeout(() => { ultrakillStreak = 0; }, 12000);
        const intensity = Math.min(ultrakillStreak - 1, 4);

        const lines = ['MANKIND IS DEAD', 'BLOOD IS FUEL', 'HELL IS FULL'];
        const overlay = document.createElement('div');
        overlay.className = 'ultrakill-overlay';
        const msg = document.createElement('div');
        msg.id = 'ultrakill-message';
        msg.style.textShadow = `2px 2px 0 #f00, 0 0 ${intensity * 4}px #ff0000`;
        overlay.appendChild(msg);
        document.body.appendChild(overlay);

        window.easterEggs.markFound('ultrakill');
        const audio = getUltrakillAudio();
        audio.currentTime = 0;
        audio.playbackRate = 1 + intensity * 0.08;
        audio.play().catch(() => {});

        let currentLine = 0;
        let currentChar = 0;
        const typeSpeed = Math.max(24, 50 - intensity * 6);
        const shakeChance = 0.7 + intensity * 0.06;
        const shakeAmount = 4 + intensity * 2;
        function typeNextChar() {
            if (currentLine < lines.length) {
                msg.textContent += lines[currentLine][currentChar] || '';
                currentChar++;
                if (Math.random() > shakeChance) {
                    const s = shakeAmount;
                    document.body.style.transform = `translate(${Math.random() * s - s / 2}px, ${Math.random() * s - s / 2}px)`;
                    setTimeout(() => { document.body.style.transform = ''; }, 50);
                }
                if (currentChar >= lines[currentLine].length) {
                    msg.textContent += '\n';
                    currentLine++;
                    currentChar = 0;
                }
                setTimeout(typeNextChar, typeSpeed);
            } else {
                setTimeout(() => overlay.remove(), 2000);
            }
        }
        typeNextChar();
    }

    function initReferenceFixtures() {
        initSavePoint();
        initNavFixtures();
        initUltrakillFixture();
        scheduleParry();
    }

    function init() {
        initHomepageOnlyEggs();
        initSitewideEggs();
        initFooterEggs();
        initReferenceFixtures();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
