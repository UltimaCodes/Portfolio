// Small bits of game feel: things floating at different depths, game covers
// tilting toward the cursor, the cat bouncing, and stars getting dealt in.
// All of it can be turned off on the settings page.
(function() {
    'use strict';

    const motionOn = () => siteSettings.get('motion') === 'on';

    // Anything with data-depth drifts against the cursor, and the closer it
    // is the more it moves. data-scroll makes it fall behind while scrolling.
    function initParallax() {
        const layers = [...document.querySelectorAll('[data-depth]')].map(el => ({
            el,
            depth: parseFloat(el.dataset.depth),
            scroll: parseFloat(el.dataset.scroll || 0)
        }));
        if (!layers.length) return;

        let targetX = 0, targetY = 0, x = 0, y = 0;

        window.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            targetX = e.clientX / window.innerWidth - 0.5;
            targetY = e.clientY / window.innerHeight - 0.5;
        }, { passive: true });

        function tick() {
            requestAnimationFrame(tick);
            const active = motionOn() && window.innerWidth > 860;
            // Nothing with depth is on screen this far down
            if (active && window.scrollY > window.innerHeight * 1.6) return;

            x += (targetX - x) * 0.08;
            y += (targetY - y) * 0.08;
            layers.forEach(layer => {
                layer.el.style.translate = active
                    ? `${(-x * layer.depth * 16).toFixed(1)}px ${(-y * layer.depth * 16 + window.scrollY * layer.scroll).toFixed(1)}px`
                    : '';
            });
        }
        tick();
    }

    function initTilt() {
        document.querySelectorAll('.shelf a').forEach(card => {
            card.addEventListener('pointermove', e => {
                if (e.pointerType !== 'mouse' || !motionOn()) return;
                const box = card.getBoundingClientRect();
                const x = (e.clientX - box.left) / box.width - 0.5;
                const y = (e.clientY - box.top) / box.height - 0.5;
                card.style.transform = `perspective(500px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg) scale(1.08)`;
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; });
        });
    }

    function initCat() {
        const cat = document.getElementById('cat');
        if (!cat) return;

        const cats = [2, 4, 5, 3, 1];
        const base = cat.getAttribute('src').replace(/cat\d\.png$/, '');
        let i = 0;
        cat.addEventListener('click', () => {
            i = (i + 1) % cats.length;
            cat.src = `${base}cat${cats[i]}.png`;
            const frame = cat.closest('.me-pic');
            frame.classList.remove('bounce');
            void frame.offsetWidth; // restarts the animation on a fast second click
            frame.classList.add('bounce');
        });
    }

    // Stars pop in one at a time the first time a rating comes into view
    function initRatings() {
        const seen = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('dealt');
                seen.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('.rating').forEach(rating => seen.observe(rating));
    }

    initParallax();
    initTilt();
    initCat();
    initRatings();
})();
