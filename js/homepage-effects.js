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
        initMatrixRain();
        initStatusAnimations();
    }

    function initElements() {
        dog = utils.getElement('.dog');
        title = utils.getElement('.title');
        catImgElement = utils.getElement('#cat-img');
        devourerAudio = new Audio('/res/DevourerSpawn.mp3');
        ultrakillAudio = new Audio('/music/ultrakillsfx.mp3');
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
        const totalVisitors = utils.getElement('#total-visitors');
        const monthlyVisitors = utils.getElement('#monthly-visitors');

        if (!totalVisitors || !monthlyVisitors) return;

        setTimeout(() => {
            animateCounter(totalVisitors, 0, 218, 2000);
            animateCounter(monthlyVisitors, 0, 12, 1500);
        }, 500);
    }

    function initStatusAnimations() {
        // Animate status values
        const statusValues = document.querySelectorAll('.status-value');
        statusValues.forEach((value, index) => {
            setTimeout(() => {
                value.style.opacity = '0';
                value.style.transform = 'translateY(10px)';
                value.style.transition = 'all 0.5s ease';

                setTimeout(() => {
                    value.style.opacity = '1';
                    value.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });

        // Animate commit lines
        const commitLines = document.querySelectorAll('.commit-line');
        commitLines.forEach((line, index) => {
            if (!line.classList.contains('cursor')) {
                line.style.opacity = '0';
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.transition = 'opacity 0.3s ease';
                }, index * 400 + 1000);
            }
        });
    }

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

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
        const char = e.key.length === 1 ? e.key.toLowerCase() : '';
        typedBuffer += char;

        // Keep buffer manageable
        if (typedBuffer.length > 30) {
            typedBuffer = typedBuffer.slice(-30);
        }

        checkEasterEggs();
    }

    function checkEasterEggs() {
        // Reset ultrakill trigger if buffer doesn't contain it
        if (!typedBuffer.includes('ultrakill')) {
            ultrakillTriggered = false;
        }

        // DOGGER easter egg
        if (typedBuffer.includes('dogger')) {
            triggerDoggerEasterEgg();
            clearTypedBuffer();
        }

        // ULTRAKILL easter egg
        if (!ultrakillTriggered && typedBuffer.includes('ultrakill')) {
            ultrakillTriggered = true;
            showUltrakillMessage();
            clearTypedBuffer();
        }

        // Metal Gear Rising easter egg - Enhanced
        if (typedBuffer.includes('nanomachines')) {
            showEnhancedMGREasterEgg();
            clearTypedBuffer();
        }

        // NieR Automata easter egg - Completely redesigned
        if (typedBuffer.includes('2b') || typedBuffer.includes('android')) {
            showEnhancedNierEasterEgg();
            clearTypedBuffer();
        }

        // Undertale easter egg - Enhanced with better visuals
        if (typedBuffer.includes('determination')) {
            showEnhancedUndertaleEasterEgg();
            clearTypedBuffer();
        }

        // Deltarune easter egg
        if (typedBuffer.includes('spamton')) {
            showDeltaruneEasterEgg();
            clearTypedBuffer();
        }

        // Minecraft easter egg
        if (typedBuffer.includes('creeper')) {
            showMinecraftEasterEgg();
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

        // New Terraria easter egg
        if (typedBuffer.includes('terraria')) {
            showTerrariaEasterEgg();
            clearTypedBuffer();
        }
    }

    function clearTypedBuffer() {
        typedBuffer = '';
    }

    function triggerDoggerEasterEgg() {
        doggerCount++;

        if (glitchTerminal && glitchTerminal.parentNode) {
            glitchTerminal.parentNode.removeChild(glitchTerminal);
        }

        glitchTerminal = utils.createElement('div', 'dogger-terminal');
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

        glitchTerminal.innerHTML = '';

        commands.forEach((command, index) => {
            setTimeout(() => {
                const line = utils.createElement('div', 'dogger-line glitch', command);
                line.style.animationDelay = `${index * 0.1}s`;
                glitchTerminal.appendChild(line);
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

    function showEnhancedMGREasterEgg() {
        // Create full-screen overlay
        const overlay = utils.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: linear-gradient(45deg, #000, #330000);
            z-index: 1000; display: flex; align-items: center; justify-content: center;
            animation: mgr-entrance 0.5s ease-out;
        `;

        const terminal = utils.createElement('div');
        terminal.style.cssText = `
            background: #000; border: 3px solid #ff0000; padding: 30px;
            font-family: 'Press Start 2P', monospace; text-align: center;
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
            animation: mgr-pulse 2s ease-in-out infinite;
        `;

        terminal.innerHTML = `
            <div style="color: #ff0000; font-size: 1.5rem; margin-bottom: 20px;">NANOMACHINES, SON!</div>
            <div style="color: #ffff00; margin: 15px 0;">They harden in response to physical trauma!</div>
            <div style="color: #ff0000; font-size: 1.2rem;">You can't hurt me, Jack!</div>
            <div style="color: #ffffff; margin-top: 20px; font-size: 0.8rem;">Standing here, I realize...</div>
        `;

        overlay.appendChild(terminal);
        document.body.appendChild(overlay);

        // Add screen shake
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            document.body.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
            shakeCount++;
            if (shakeCount > 20) {
                clearInterval(shakeInterval);
                document.body.style.transform = 'translate(0, 0)';
            }
        }, 100);

        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 500);
        }, 4000);
    }

    function showEnhancedNierEasterEgg() {
        // Create white flash effect
        const flash = utils.createElement('div');
        flash.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: white; z-index: 1000; opacity: 1;
            transition: opacity 0.3s ease-out;
        `;
        document.body.appendChild(flash);

        setTimeout(() => {
            flash.style.opacity = '0';
        }, 200);

        // Create android UI panel
        setTimeout(() => {
            const androidPanel = utils.createElement('div');
            androidPanel.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #000; border: 2px solid #ffffff; padding: 30px;
                font-family: 'Press Start 2P', monospace; color: white;
                z-index: 1001; text-align: center; min-width: 400px;
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
            `;

            androidPanel.innerHTML = `
                <div style="color: #00ffff; margin-bottom: 15px;">ANDROID UNIT: 2B</div>
                <div style="margin: 10px 0;">STATUS: OPERATIONAL</div>
                <div style="margin: 10px 0;">MISSION: DESTROY MACHINE LIFEFORMS</div>
                <div style="color: #ff6666; margin: 15px 0;">EMOTIONS ARE PROHIBITED</div>
                <div style="font-size: 0.6rem; margin-top: 20px; color: #888;">
                    [ACCESSING MEMORY BANK...]<br/>
                    [GLORY TO MANKIND]
                </div>
            `;

            document.body.appendChild(androidPanel);

            // Add typing sound effect simulation
            const lines = androidPanel.querySelectorAll('div');
            lines.forEach((line, index) => {
                line.style.opacity = '0';
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.transition = 'opacity 0.3s ease';
                }, index * 500);
            });

            setTimeout(() => {
                androidPanel.style.opacity = '0';
                androidPanel.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    if (androidPanel.parentNode) androidPanel.parentNode.removeChild(androidPanel);
                    if (flash.parentNode) flash.parentNode.removeChild(flash);
                }, 500);
            }, 4000);
        }, 300);
    }

    function showEnhancedUndertaleEasterEgg() {
        // Create battle-like UI
        const battleBox = utils.createElement('div');
        battleBox.style.cssText = `
            position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%);
            width: 600px; height: 150px; background: #000;
            border: 4px solid #fff; z-index: 1000;
            font-family: 'Press Start 2P', monospace;
        `;

        const textBox = utils.createElement('div');
        textBox.style.cssText = `
            padding: 20px; color: #fff; font-size: 0.8rem;
            line-height: 1.5; height: 100%;
        `;

        battleBox.appendChild(textBox);
        document.body.appendChild(battleBox);

        // Create soul (heart)
        const soul = utils.createElement('div');
        soul.style.cssText = `
            position: fixed; bottom: 220px; left: 50%; transform: translateX(-50%);
            width: 20px; height: 20px; background: #ff0000;
            z-index: 1001; animation: soul-pulse 1s ease-in-out infinite;
        `;
        document.body.appendChild(soul);

        // Type out text
        const messages = [
            "* You are filled with DETERMINATION.",
            "* The power of fluffy boys shines within you.",
            "* You feel like you're going to have a bad time."
        ];

        let currentMessage = 0;
        let currentChar = 0;

        function typeMessage() {
            if (currentMessage < messages.length) {
                if (currentChar < messages[currentMessage].length) {
                    textBox.textContent += messages[currentMessage][currentChar];
                    currentChar++;
                    setTimeout(typeMessage, 50);
                } else {
                    setTimeout(() => {
                        textBox.textContent = '';
                        currentMessage++;
                        currentChar = 0;
                        if (currentMessage < messages.length) {
                            typeMessage();
                        }
                    }, 1500);
                }
            } else {
                setTimeout(() => {
                    battleBox.style.opacity = '0';
                    soul.style.opacity = '0';
                    battleBox.style.transition = 'opacity 0.5s ease-out';
                    soul.style.transition = 'opacity 0.5s ease-out';
                    setTimeout(() => {
                        if (battleBox.parentNode) battleBox.parentNode.removeChild(battleBox);
                        if (soul.parentNode) soul.parentNode.removeChild(soul);
                    }, 500);
                }, 2000);
            }
        }

        typeMessage();
    }

    function showTerrariaEasterEgg() {
        const notification = utils.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: linear-gradient(45deg, #4a0e4e, #81007f);
            border: 2px solid #ff00ff; padding: 15px;
            font-family: 'Press Start 2P', monospace; color: #fff;
            z-index: 1000; min-width: 300px; text-align: center;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
            animation: terraria-slide 0.5s ease-out;
        `;

        notification.innerHTML = `
            <div style="color: #ff00ff; margin-bottom: 10px;">TERRARIA</div>
            <div style="font-size: 0.6rem; margin: 5px 0;">The Devourer of Gods has awoken!</div>
            <div style="font-size: 0.5rem; color: #ffaaff;">Infernum Mode Active</div>
        `;

        document.body.appendChild(notification);

        // Create particle effects
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = utils.createElement('div');
                particle.style.cssText = `
                    position: fixed; top: ${Math.random() * window.innerHeight}px;
                    left: ${Math.random() * window.innerWidth}px;
                    width: 4px; height: 4px; background: #ff00ff;
                    z-index: 999; border-radius: 50%;
                    animation: particle-float 3s ease-out forwards;
                `;
                document.body.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) particle.parentNode.removeChild(particle);
                }, 3000);
            }, i * 100);
        }

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 500);
        }, 4000);
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

    function initMatrixRain() {
        const canvas = utils.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: -2; opacity: 0; pointer-events: none;
            transition: opacity 1s ease;
        `;
        document.body.appendChild(canvas);
    }

    function triggerMatrixEffect() {
        const canvas = utils.getElement('#matrix-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        canvas.style.opacity = '0.3';

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
        audioAllowed = true;
    }

    function animateDog() {
        if (!dog || !title) return;

        // Enhanced Devourer of Gods animation
        dog.classList.add('animate');
        title.classList.add('hidden');

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
            devourerAudio.currentTime = 0;
            devourerAudio.play().catch(() => {});
        }

        setTimeout(() => {
            clearInterval(particleInterval);
            dog.classList.remove('animate');
            title.classList.remove('hidden');

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
                catImgElement.src = catImgs[idx];
                catImgElement.alt = `Pixel cat ${idx + 1}`;
            }, 3000);
        }

        setTimeout(() => {
            animateDog();
            setInterval(animateDog, 45000);
        }, 5000);
    }

    function showUltrakillMessage() {
        const lines = ["MANKIND IS DEAD", "BLOOD IS FUEL", "HELL IS FULL"];
        const container = utils.getElement("#ultrakill-container");
        if (!container) return;

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
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.parentNode.removeChild(msg);
                    }
                }, 2000);
            }
        }

        typeNextChar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepageEffects);
    } else {
        initHomepageEffects();
    }
})();