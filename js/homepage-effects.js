// Homepage specific effects and easter eggs
(function() {
    'use strict';

    let typedBuffer = '';
    let glitchTerminal = null;
    let ultrakillTriggered = false;
    let audioAllowed = false;
    let dog, title, devourerAudio, catImgElement;
    let jonklerAudio, ultrakillAudio, undertaleAudio, spamtonAudio, matrixAudio, mgrrAudio, doggerCount = 0;

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
        ultrakillAudio = new Audio('/res/ultrakillsfx.mp3');
        undertaleAudio = new Audio('/res/utale.mp3');
        spamtonAudio = new Audio('/res/spamt.mp3');
        matrixAudio = new Audio('/res/mtrx.mp3');
        mgrrAudio = new Audio('/res/nanomachines.mp3');
        jonklerAudio = new Audio('/res/jonkler.mp3');
        
        // Set volumes for easter egg sounds
        if (devourerAudio) devourerAudio.volume = 0.4;
        if (ultrakillAudio) ultrakillAudio.volume = 0.5;
        if (undertaleAudio) undertaleAudio.volume = 0.4;
        if (spamtonAudio) spamtonAudio.volume = 0.4;
        if (matrixAudio) matrixAudio.volume = 0.3;
        if (mgrrAudio) mgrrAudio.volume = 0.5;
        if (jonklerAudio) jonklerAudio.volume = 0.4;
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
            showMGREasterEgg();
            clearTypedBuffer();
        }

        // Undertale easter egg - Enhanced with better visuals
        if (typedBuffer.includes('determination')) {
            showUndertaleEasterEgg();
            clearTypedBuffer();
        }

        // Deltarune easter egg
        if (typedBuffer.includes('spamton')) {
            showDeltaruneEasterEgg();
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
                const line = utils.createElement('div', 'glitch', command);
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

    function showMGREasterEgg() {
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
                <div style="color: #ff0000; font-size: 1.2rem;">We're making the mother of all omelettes, Jack!</div>
            `;

        overlay.appendChild(terminal);
        document.body.appendChild(overlay);

        // Play MGR sound effect
        if (audioAllowed && mgrrAudio) {
            mgrrAudio.currentTime = 0;
            mgrrAudio.play().catch(() => {});
        }

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
        }, 6000);
    }
    
    function showUndertaleEasterEgg() {
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

        // Play Undertale sound effect
        if (audioAllowed && undertaleAudio) {
            undertaleAudio.currentTime = 0;
            undertaleAudio.play().catch(() => {});
        }

        const soul = utils.createElement('img');
        soul.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Undertale.png/1200px-Undertale.png';
        soul.style.cssText = `
        position: fixed; bottom: 220px; left: 50%; transform: translateX(-50%);
        width: 20px; height: 20px;
        z-index: 1001; animation: soul-pulse 1s ease-in-out infinite;
    `;
        document.body.appendChild(soul);

        const messages = [
            "* Despite everything, it's still you.",
            "* You are filled with DETERMINATION."
        ];

        let currentMessage = 0;
        let currentChar = 0;

        function typeMessage() {
            if (currentMessage < messages.length) {
                if (currentChar < messages[currentMessage].length) {
                    textBox.textContent += messages[currentMessage][currentChar];
                    currentChar++;
                    setTimeout(typeMessage, 115);
                } else {
                    setTimeout(() => {
                        textBox.textContent = '';
                        currentMessage++;
                        currentChar = 0;
                        typeMessage();
                    }, 3100);
                }
            } else {
                hideElements();
            }
        }

        function hideElements() {
            battleBox.style.transition = 'opacity 0.5s ease-out';
            soul.style.transition = 'opacity 0.5s ease-out';
            battleBox.style.opacity = '0';
            soul.style.opacity = '0';
            setTimeout(() => {
                battleBox.remove();
                soul.remove();
            }, 500);
        }

        typeMessage();
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
                <div>HEY [HYPERLINK BLOCKED]</div>
                <div style="margin: 10px 0;">NOW'S YOUR CHANCE TO BE A</div>
                <div style="color: #ff00ff;">[BIG SHOT]</div>
            `;
        document.body.appendChild(text);

        // Play Spamton sound effect
        if (audioAllowed && spamtonAudio) {
            spamtonAudio.currentTime = 0;
            spamtonAudio.play().catch(() => {});
        }

        setTimeout(() => {
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 3000);
    }

    function showJonklerEasterEgg() {

        // Play Jonkler sound effect
        if (audioAllowed && jonklerAudio) {
            jonklerAudio.currentTime = 0;
            jonklerAudio.play().catch(() => {});
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
            font-family: 'Press Start 2P', monospace;
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

        // Play Matrix sound effect
        if (audioAllowed && matrixAudio) {
            matrixAudio.currentTime = 0;
            matrixAudio.play().catch(() => {});
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