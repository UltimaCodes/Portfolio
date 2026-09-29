// Homepage specific effects and easter eggs
(function() {
    'use strict';

    let typedBuffer = '';
    let glitchTerminal = null;
    let audioAllowed = false;
    let dogCycleStarted = false;
    let dog, title, devourerAudio, catImgElement;
    let jonklerAudio, matrixAudio, mgrrAudio, doggerCount = 0;

    function initHomepageEffects() {
        // Only run on homepage
        if (!utils.getElement('.title-container')) return;

        initElements();
        setupEventListeners();
        startAnimations();
        initDynamicSeparator();
        initMatrixRain();
        initStatusAnimations();
    }

    function initElements() {
        dog = utils.getElement('.dog');
        title = utils.getElement('.title');
        catImgElement = utils.getElement('#cat-img');
        // Easter-egg audio is lazy-loaded on first trigger instead of here,
        // see the getXAudio() helpers below. Loading all 7 files upfront cost
        // ~750KB on every homepage visit regardless of whether any egg fires.
    }

    function getDevourerAudio() {
        if (!devourerAudio) { devourerAudio = new Audio(utils.asset('res/DevourerSpawn.mp3')); devourerAudio.volume = 0.4; }
        return devourerAudio;
    }
    function getMatrixAudio() {
        if (!matrixAudio) { matrixAudio = new Audio(utils.asset('res/mtrx.mp3')); matrixAudio.volume = 0.3; }
        return matrixAudio;
    }
    function getMgrrAudio() {
        if (!mgrrAudio) { mgrrAudio = new Audio(utils.asset('res/nanomachines.mp3')); mgrrAudio.volume = 0.5; }
        return mgrrAudio;
    }
    function getJonklerAudio() {
        if (!jonklerAudio) { jonklerAudio = new Audio(utils.asset('res/jonkler.mp3')); jonklerAudio.volume = 0.4; }
        return jonklerAudio;
    }

    function setupEventListeners() {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
        window.addEventListener('resize', utils.debounce(updateDynamicSeparator, 250));
    }

    function initDynamicSeparator() {
        updateDynamicSeparator();
    }

    function updateDynamicSeparator() {
        const separator = utils.getElement('#dynamic-separator');
        if (!separator) return;

        const screenWidth = window.innerWidth;
        let separatorLength;

        if (screenWidth <= 480) {
            separatorLength = 20;
        } else if (screenWidth <= 768) {
            separatorLength = 30;
        } else if (screenWidth <= 1024) {
            separatorLength = 40;
        } else if (screenWidth <= 1440) {
            separatorLength = 55;
        } else {
            separatorLength = 70;
        }

        separator.textContent = '='.repeat(separatorLength);
    }

    function initStatusAnimations() {
        // Animate status card values
        const statusValues = document.querySelectorAll('.hp-val');
        statusValues.forEach((value, index) => {
            setTimeout(() => {
                value.style.opacity = '0';
                value.style.transform = 'translateY(10px)';
                value.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                setTimeout(() => {
                    value.style.opacity = '1';
                    value.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });

    }

    function handleKeydown(e) {
        const char = e.key.length === 1 ? e.key.toLowerCase() : '';
        typedBuffer += char;

        // Keep buffer manageable
        if (typedBuffer.length > 30) {
            typedBuffer = typedBuffer.slice(-30);
        }

        checkEasterEggs();
    }

    function checkEasterEggs() {
        // DOGGER easter egg
        if (typedBuffer.includes('dogger')) {
            triggerDoggerEasterEgg();
            clearTypedBuffer();
        }

        // Metal Gear Rising easter egg - Enhanced
        if (typedBuffer.includes('nanomachines')) {
            showMGREasterEgg();
            clearTypedBuffer();
        }

        // Evil Jonkler easter egg
        if (typedBuffer.includes('jonkler')) {
            showJonklerEasterEgg();
            clearTypedBuffer();
        }

        // Matrix easter egg
        if (typedBuffer.includes('matrix')) {
            triggerMatrixEffect();
            clearTypedBuffer();
        }
    }

    function clearTypedBuffer() {
        typedBuffer = '';
    }

    function triggerDoggerEasterEgg() {
        if (window.easterEggs) window.easterEggs.markFound('dogger');
        doggerCount++;

        if (glitchTerminal && glitchTerminal.parentNode) {
            glitchTerminal.parentNode.removeChild(glitchTerminal);
        }

        glitchTerminal = utils.createElement('div', 'dogger-terminal');
        const titlebar = utils.createElement('div', 'card-titlebar', 'root@ryaan:~$ ./dogger.sh');
        const body = utils.createElement('div', 'dogger-body');
        glitchTerminal.appendChild(titlebar);
        glitchTerminal.appendChild(body);
        document.body.appendChild(glitchTerminal);

        const commands = [
            `> DOGGER PROTOCOL ACTIVATED [${doggerCount}]`,
            '> ACCESSING FORGES...',
            '> NUKING OSUPK...',
            '> #EXECUTEDOGGERISM',
            '> GOON.EXE RUNNING...',
            '> HAMZA FOUND',
            '> IS THIS TRUE'
        ];

        commands.forEach((command, index) => {
            setTimeout(() => {
                const line = utils.createElement('div', 'glitch', command);
                line.style.animationDelay = `${index * 0.1}s`;
                body.appendChild(line);
                if (index === commands.length - 1) {
                    line.appendChild(utils.createElement('span', 'cursor'));
                }
            }, index * 300);
        });

        setTimeout(() => {
            if (glitchTerminal && glitchTerminal.parentNode) {
                glitchTerminal.style.opacity = '0';
                glitchTerminal.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    if (glitchTerminal && glitchTerminal.parentNode) {
                        glitchTerminal.parentNode.removeChild(glitchTerminal);
                        glitchTerminal = null;
                    }
                }, 500);
            }
        }, 5000);
    }

    function showMGREasterEgg() {
        if (window.easterEggs) window.easterEggs.markFound('nanomachines');
        // Create full-screen overlay
        const overlay = utils.createElement('div');
        overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: linear-gradient(45deg, #000, #330000);
                z-index: 1000; display: flex; align-items: center; justify-content: center;
                animation: mgr-entrance 0.5s ease-out;
            `;

        const terminal = utils.createElement('div', 'mgr-terminal');

        terminal.innerHTML = `
                <div style="color: #ff0000; font-size: 1.5rem; margin-bottom: 20px;">NANOMACHINES, SON!</div>
                <div style="color: #ffff00; margin: 15px 0;">They harden in response to physical trauma!</div>
                <div style="color: #ff0000; font-size: 1.2rem;">We're making the mother of all omelettes, Jack!</div>
            `;

        overlay.appendChild(terminal);
        document.body.appendChild(overlay);

        // Play MGR sound effect
        if (audioAllowed) {
            const audio = getMgrrAudio();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        // Add screen shake
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            document.body.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
            shakeCount++;
            if (shakeCount > 20) {
                clearInterval(shakeInterval);
                document.body.style.transform = '';
            }
        }, 100);

        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 500);
        }, 6000);
    }
    
    function showJonklerEasterEgg() {
        if (window.easterEggs) window.easterEggs.markFound('jonkler');

        // Play Jonkler sound effect
        if (audioAllowed) {
            const audio = getJonklerAudio();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        const jonklerTexts = [
            "WHY SO SERIOUS?", "YOU WANNA KNOW HOW I GOT THESE SCARS", "WE LIVE IN A SOCIETY", "JONKLERISM RISES", "BUY TIMESHARES",
            "EVERYTHING BURNS", "NO ESCAPE", "ONE QUESTION"
        ];

        const spamElements = [];

        const interval = setInterval(() => {
            const popup = utils.createElement('div');
            popup.textContent = jonklerTexts[Math.floor(Math.random() * jonklerTexts.length)];
            popup.style.cssText = `
            position: fixed;
            top: ${Math.random() * 90}vh;
            left: ${Math.random() * 90}vw;
            background: #000;
            color: #ff00ff;
            padding: 10px;
            font-family: var(--font-head);
            font-size: 0.6rem;
            border: 2px solid #ff0000;
            z-index: 9999;
            opacity: 1;
            animation: glitch-anim 0.3s infinite alternate;
        `;
            document.body.appendChild(popup);
            spamElements.push(popup);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            spamElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 500);
            });
        }, 10000);
    }

    function initMatrixRain() {
        const canvas = utils.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: -1; opacity: 0; pointer-events: none;
                transition: opacity 1s ease;
            `;
        document.body.appendChild(canvas);
    }

    function triggerMatrixEffect() {
        const canvas = utils.getElement('#matrix-canvas');
        if (!canvas) return;
        if (window.easterEggs) window.easterEggs.markFound('matrix');

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        canvas.style.opacity = '0.3';

        // Play Matrix sound effect
        if (audioAllowed) {
            const audio = getMatrixAudio();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        const interval = setInterval(draw, 33);

        setTimeout(() => {
            clearInterval(interval);
            canvas.style.opacity = '0';
        }, 5000);
    }

    function enableAudio() {
        if (audioAllowed) return;
        audioAllowed = true;
        startDogCycle();
    }

    function startDogCycle() {
        if (dogCycleStarted) return;
        dogCycleStarted = true;
        setTimeout(() => {
            animateDog();
            setInterval(animateDog, 45000);
        }, 2000);
    }

    function animateDog() {
        if (!dog || !title || dog.classList.contains('animate')) return;

        // Devourer of Gods animation. The title erodes away exactly as fast
        // as the dog's leading edge sweeps across it. A clip-path driven by
        // real position each frame means the name is only ever gone where
        // the dog has actually passed, not toggled invisible the instant
        // any part of the dog overlaps it.
        dog.classList.add('animate');

        const animDuration = 2500;
        const animStart = performance.now();

        function syncTitleToDogPosition(now) {
            const elapsed = now - animStart;
            if (elapsed >= animDuration) {
                title.style.clipPath = '';
                return;
            }

            const dogRect = dog.getBoundingClientRect();
            const titleRect = title.getBoundingClientRect();
            const eatenFraction = titleRect.width > 0
                ? Math.min(1, Math.max(0, (dogRect.right - titleRect.left) / titleRect.width))
                : 0;

            title.style.clipPath = `inset(0 0 0 ${(eatenFraction * 100).toFixed(2)}%)`;

            requestAnimationFrame(syncTitleToDogPosition);
        }
        requestAnimationFrame(syncTitleToDogPosition);

        // Add screen effects during animation
        const screenEffect = utils.createElement('div');
        screenEffect.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: radial-gradient(circle, transparent 30%, rgba(255, 0, 170, 0.1) 70%);
                z-index: 5; pointer-events: none; opacity: 0;
                transition: opacity 0.3s ease;
            `;
        document.body.appendChild(screenEffect);

        setTimeout(() => {
            screenEffect.style.opacity = '1';
        }, 500);

        // Add particle trail
        const particleInterval = setInterval(() => {
            const particle = utils.createElement('div');
            particle.style.cssText = `
                    position: fixed; top: 50%; left: ${Math.random() * window.innerWidth}px;
                    width: 6px; height: 6px; background: #ff00aa;
                    border-radius: 50%; z-index: 4; pointer-events: none;
                    animation: devourer-particle 1s ease-out forwards;
                `;
            document.body.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) particle.parentNode.removeChild(particle);
            }, 1000);
        }, 100);

        if (audioAllowed) {
            const audio = getDevourerAudio();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        setTimeout(() => {
            clearInterval(particleInterval);
            dog.classList.remove('animate');
            title.style.clipPath = '';
            // slide back into its lurking spot instead of popping in
            dog.classList.add('returning');
            setTimeout(() => dog.classList.remove('returning'), 800);

            screenEffect.style.opacity = '0';
            setTimeout(() => {
                if (screenEffect.parentNode) screenEffect.parentNode.removeChild(screenEffect);
            }, 300);
        }, 2500);
    }

    function startAnimations() {
        if (catImgElement) {
            const catImgs = ["images/cat4.png", "images/cat2.png", "images/cat3.png", "images/cat1.png", "images/cat5.png"];

            setInterval(() => {
                const idx = Math.floor(Math.random() * catImgs.length);
                const src = catImgs[idx];
                catImgElement.src = src;
                catImgElement.alt = `Pixel cat ${src.match(/\d+/)[0]}`;
            }, 3000);
        }

        // The automatic run waits for the page's first real click or
        // keypress (enableAudio, above) instead of a blind timer, so its
        // very first pass is never silent. Browsers block audio before a
        // genuine user gesture, and nothing before this point guarantees
        // one has happened yet.
        if (audioAllowed) startDogCycle();
    }

    // Exposed so js/easter-eggs.js can trigger the same run on demand
    // (poking the lurking dog), not just on the 45s interval.
    window.triggerDevourerSequence = animateDog;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepageEffects);
    } else {
        initHomepageEffects();
    }
})();