// Homepage specific effects and easter eggs
(function() {
    'use strict';

    let typedBuffer = '';
    let glitchTerminal = null;
    let ultrakillTriggered = false;
    let audioAllowed = false;
    let dog, title, devourerAudio, catImgElement;
    let ultrakillAudio, doggerCount = 0;

    function initHomepageEffects() {
        // Only run on homepage
        if (!utils.getElement('.title-container')) return;

        initElements();
        setupEventListeners();
        startAnimations();
        initDynamicSeparator();
        initAnalytics();
    }

    function initElements() {
        dog = utils.getElement('.dog');
        title = utils.getElement('.title');
        catImgElement = utils.getElement('#cat-img');
        devourerAudio = new Audio('/res/DevourerSpawn.mp3');
        ultrakillAudio = new Audio('/music/ultrakillsfx.mp3'); // Add ultrakill sound
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

    function initAnalytics() {
        // Simulate analytics data (in real implementation, this would come from your analytics service)
        const totalVisitors = utils.getElement('#total-visitors');
        const monthlyVisitors = utils.getElement('#monthly-visitors');

        if (!totalVisitors || !monthlyVisitors) return;

        // Simulate loading delay
        setTimeout(() => {
            animateCounter(totalVisitors, 0, 218, 2000);
            animateCounter(monthlyVisitors, 0, 12, 1500);
        }, 500);
    }

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    function handleKeydown(e) {
        const char = e.key.length === 1 ? e.key : '';
        typedBuffer += char.toLowerCase();

        if (typedBuffer.length > 20) {
            typedBuffer = typedBuffer.slice(-20);
        }

        checkEasterEggs();
    }

    function checkEasterEggs() {
        // DOGGER easter egg - enhanced
        if (typedBuffer.includes('dogger')) {
            triggerEnhancedDoggerEasterEgg();
            typedBuffer = '';
        }

        // ULTRAKILL easter egg - enhanced with sound
        if (!ultrakillTriggered && typedBuffer.includes('ultrakill')) {
            ultrakillTriggered = true;
            showEnhancedUltrakillMessage();
        }
    }

    function triggerEnhancedDoggerEasterEgg() {
        doggerCount++;

        if (!glitchTerminal) {
            glitchTerminal = utils.createElement('div', 'dogger-terminal');
            document.body.appendChild(glitchTerminal);
        }

        const commands = [
            `> DOGGER PROTOCOL ACTIVATED [${doggerCount}]`,
            '> ACCESSING FORGES...',
            '> NUKING OSUPK...',
            '> #EXECUTEDOGGERISM',
            '> GOON.EXE RUNNING...',
            '> HAMZA FOUND',
            '> IS THIS TRUE'
        ];

        // Clear previous content
        glitchTerminal.innerHTML = '';

        // Add lines with typing effect
        commands.forEach((command, index) => {
            setTimeout(() => {
                const line = utils.createElement('div', 'dogger-line glitch', command);
                line.style.animationDelay = `${index * 0.1}s`;
                glitchTerminal.appendChild(line);
            }, index * 300);
        });

        // Auto-remove after 5 seconds
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

        // Add new easter eggs
        checkForNewEasterEggs();
    }

    function checkForNewEasterEggs() {
        // Metal Gear Rising easter egg
        if (typedBuffer.includes('nanomachines')) {
            showMGREasterEgg();
            typedBuffer = '';
        }

        // NieR Automata easter egg
        if (typedBuffer.includes('2b') || typedBuffer.includes('android')) {
            showNierEasterEgg();
            typedBuffer = '';
        }

        // Undertale easter egg
        if (typedBuffer.includes('determination')) {
            showUndertaleEasterEgg();
            typedBuffer = '';
        }

        // Deltarune easter egg
        if (typedBuffer.includes('spamton')) {
            showDeltaruneEasterEgg();
            typedBuffer = '';
        }

        // Minecraft easter egg
        if (typedBuffer.includes('creeper')) {
            showMinecraftEasterEgg();
            typedBuffer = '';
        }

        // Evil Jonkler easter egg
        if (typedBuffer.includes('jonkler')) {
            showJonklerEasterEgg();
            typedBuffer = '';
        }
    }

    function showMGREasterEgg() {
        const terminal = utils.createElement('div', 'mgr-terminal');
        terminal.innerHTML = `
      <div style="color: #ff0000; font-weight: bold;">NANOMACHINES, SON!</div>
      <div style="margin: 10px 0;">They harden in response to physical trauma!</div>
      <div style="color: #ffff00;">You can't hurt me, Jack!</div>
    `;
        document.body.appendChild(terminal);

        setTimeout(() => {
            if (terminal.parentNode) {
                terminal.parentNode.removeChild(terminal);
            }
        }, 3000);
    }

    function showNierEasterEgg() {
        const glitch = utils.createElement('div', 'nier-glitch');
        document.body.appendChild(glitch);

        // Add text overlay
        const text = utils.createElement('div');
        text.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: white; font-family: monospace; font-size: 1.5rem; z-index: 1000;
      text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
        text.textContent = 'EMOTIONS ARE PROHIBITED';
        document.body.appendChild(text);

        setTimeout(() => {
            if (glitch.parentNode) glitch.parentNode.removeChild(glitch);
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 2000);
    }

    function showUndertaleEasterEgg() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const heart = utils.createElement('div', 'undertale-heart', '♥');
                heart.style.left = Math.random() * window.innerWidth + 'px';
                heart.style.top = window.innerHeight + 'px';
                document.body.appendChild(heart);

                setTimeout(() => {
                    if (heart.parentNode) heart.parentNode.removeChild(heart);
                }, 3000);
            }, i * 200);
        }
    }

    function showDeltaruneEasterEgg() {
        const text = utils.createElement('div');
        text.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: #ffff00; font-family: 'Press Start 2P', monospace; font-size: 1rem;
      z-index: 1000; text-align: center; background: rgba(0,0,0,0.8);
      padding: 20px; border: 2px solid #ffff00;
    `;
        text.innerHTML = `
      <div>[BIG SHOT]</div>
      <div style="margin: 10px 0;">NOW'S YOUR CHANCE TO BE A</div>
      <div style="color: #ff00ff;">[BIG SHOT]</div>
    `;
        document.body.appendChild(text);

        setTimeout(() => {
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 3000);
    }

    function showMinecraftEasterEgg() {
        const text = utils.createElement('div');
        text.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: #00ff00; font-family: monospace; font-size: 1.2rem;
      z-index: 1000; text-align: center; background: rgba(0,0,0,0.9);
      padding: 20px; border: 2px solid #00ff00;
    `;
        text.textContent = 'Aww man... So we back in the mine';
        document.body.appendChild(text);

        // Screen shake effect
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            shakeCount++;
            if (shakeCount > 10) {
                clearInterval(shakeInterval);
                document.body.style.transform = 'translate(0, 0)';
            }
        }, 100);

        setTimeout(() => {
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 3000);
    }

    function showJonklerEasterEgg() {
        const text = utils.createElement('div');
        text.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: #800080; font-family: 'Press Start 2P', monospace; font-size: 1rem;
      z-index: 1000; text-align: center; background: rgba(0,0,0,0.9);
      padding: 20px; border: 2px solid #800080; animation: glitch-anim 0.5s infinite;
    `;
        text.innerHTML = `
      <div style="color: #ff00ff;">WHY SO SERIOUS?</div>
      <div style="margin: 10px 0; color: #ffff00;">Let's put a smile on that face!</div>
      <div style="color: #ff0000;">HAHAHAHAHA</div>
    `;
        document.body.appendChild(text);

        setTimeout(() => {
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 4000);
    }

    function enableAudio() {
        audioAllowed = true;
    }

    function animateDog() {
        if (!dog || !title) return;

        dog.classList.add('animate');
        title.classList.add('hidden');

        if (audioAllowed) {
            devourerAudio.currentTime = 0;
            devourerAudio.play().catch(() => {});
        }

        setTimeout(() => {
            dog.classList.remove('animate');
            title.classList.remove('hidden');
        }, 2500);
    }

    function startAnimations() {
        // Cat image randomizer
        if (catImgElement) {
            const catImgs = ["images/cat4.png", "images/cat2.png", "images/cat3.png", "images/cat1.png", "images/cat5.png"];

            setInterval(() => {
                const idx = Math.floor(Math.random() * catImgs.length);
                catImgElement.src = catImgs[idx];
                catImgElement.alt = `Pixel cat ${idx + 1}`;
            }, 3000);
        }

        // Dog animation cycle
        setTimeout(() => {
            animateDog();
            setInterval(animateDog, 45000);
        }, 5000);
    }

    function showEnhancedUltrakillMessage() {
        const lines = ["MANKIND IS DEAD", "BLOOD IS FUEL", "HELL IS FULL"];
        const container = utils.getElement("#ultrakill-container");
        if (!container) return;

        // Play ULTRAKILL sound effect
        if (audioAllowed && ultrakillAudio) {
            ultrakillAudio.currentTime = 0;
            ultrakillAudio.play().catch(() => {});
        }

        const msg = utils.createElement("div");
        msg.id = "ultrakill-message";
        msg.style.textShadow = "0 0 10px #f00, 0 0 20px #f00, 0 0 30px #f00";
        container.appendChild(msg);

        let currentLine = 0;
        let currentChar = 0;

        function typeNextChar() {
            if (currentLine < lines.length) {
                msg.textContent += lines[currentLine][currentChar] || '';
                currentChar++;

                // Add screen shake effect
                if (Math.random() > 0.7) {
                    document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                    setTimeout(() => {
                        document.body.style.transform = 'translate(0, 0)';
                    }, 50);
                }

                if (currentChar >= lines[currentLine].length) {
                    msg.textContent += '\n';
                    currentLine++;
                    currentChar = 0;
                }

                setTimeout(typeNextChar, 50);
            } else {
                // Auto-remove after completion
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.parentNode.removeChild(msg);
                    }
                }, 2000);
            }
        }

        typeNextChar();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepageEffects);
    } else {
        initHomepageEffects();
    }
})();