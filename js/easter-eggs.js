// The typed easter eggs. Type a word anywhere on the site. Esc or a click
// ends any of them early.
(function() {
    'use strict';

    let typed = '';
    let stopCurrent = null;
    let doggerCount = 0;

    const eggs = {
        dogger: runDogger,
        nanomachines: runNanomachines,
        jonkler: runJonkler,
        matrix: runMatrix
    };

    function onKeydown(e) {
        if (e.key === 'Escape' && stopCurrent) { stopCurrent(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;

        typed = (typed + e.key.toLowerCase()).slice(-30);
        for (const word in eggs) {
            if (typed.endsWith(word)) {
                typed = '';
                if (stopCurrent) stopCurrent();
                eggs[word]();
            }
        }
    }

    // Everything an egg creates gets cleaned up through here, so ending one
    // early and letting it run out behave exactly the same.
    function start(cleanup, durationMs) {
        const timer = setTimeout(stop, durationMs);
        function stop() {
            clearTimeout(timer);
            cleanup();
            stopCurrent = null;
        }
        stopCurrent = stop;
        return stop;
    }

    function playSound(file, volume) {
        const audio = new Audio(utils.asset('res/' + file));
        audio.volume = volume;
        if (siteSettings.get('sound') === 'on') audio.play().catch(() => {});
        return audio;
    }

    function runDogger() {
        doggerCount++;
        const lines = [
            `> DOGGER PROTOCOL ACTIVATED [${doggerCount}]`,
            '> ACCESSING FORGES...',
            '> NUKING OSUPK...',
            '> #EXECUTEDOGGERISM',
            '> GOON.EXE RUNNING...',
            '> HAMZA FOUND',
            '> IS THIS TRUE'
        ];

        const term = utils.createElement('div', 'egg-term box');
        const body = utils.createElement('div', 'win-body');
        term.appendChild(utils.createElement('div', 'win-bar', 'root@ryaan:~$ ./dogger.sh'));
        term.appendChild(body);
        document.body.appendChild(term);

        const timers = lines.map((line, i) =>
            setTimeout(() => body.appendChild(utils.createElement('div', '', line)), i * 320)
        );

        const stop = start(() => {
            timers.forEach(clearTimeout);
            term.remove();
        }, 6500);
        term.addEventListener('click', stop);
    }

    function runNanomachines() {
        const audio = playSound('nanomachines.mp3', 0.5);
        const screen = utils.createElement('div', 'egg-full egg-mgr');
        screen.appendChild(utils.createElement('div', 'big', 'Nanomachines, son.'));
        document.body.appendChild(screen);

        const timers = [
            setTimeout(() => screen.appendChild(utils.createElement('div', 'line', 'They harden in response to physical trauma.')), 1300),
            setTimeout(() => screen.appendChild(utils.createElement('div', 'line', "We're making the mother of all omelettes, Jack.")), 2900)
        ];

        const stop = start(() => {
            timers.forEach(clearTimeout);
            audio.pause();
            screen.remove();
        }, 6000);
        screen.addEventListener('click', stop);
    }

    function runJonkler() {
        const audio = playSound('jonkler.mp3', 0.4);
        const texts = [
            'WHY SO SERIOUS?', 'YOU WANNA KNOW HOW I GOT THESE SCARS', 'WE LIVE IN A SOCIETY',
            'JONKLERISM RISES', 'BUY TIMESHARES', 'EVERYTHING BURNS', 'NO ESCAPE', 'ONE QUESTION'
        ];

        const layer = utils.createElement('div', 'egg-layer');
        document.body.appendChild(layer);

        const spawner = setInterval(() => {
            const text = texts[Math.floor(Math.random() * texts.length)];
            const sticker = utils.createElement('div', 'egg-sticker', text);
            sticker.style.top = `${Math.random() * 90}%`;
            sticker.style.left = `${Math.random() * 78}%`;
            sticker.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
            layer.appendChild(sticker);
        }, 130);

        start(() => {
            clearInterval(spawner);
            audio.pause();
            layer.remove();
        }, 5000);
    }

    function runMatrix() {
        const audio = playSound('mtrx.mp3', 0.3);
        const screen = utils.createElement('div', 'egg-full egg-matrix');
        const canvas = document.createElement('canvas');
        screen.appendChild(canvas);
        document.body.appendChild(screen);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        const glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        const fontSize = 20;
        const drops = Array(Math.ceil(canvas.width / fontSize)).fill(0).map(() => Math.random() * -40);

        ctx.font = `${fontSize}px monospace`;
        const painter = setInterval(() => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#33ff33';
            drops.forEach((y, i) => {
                ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, y * fontSize);
                drops[i] = y * fontSize > canvas.height && Math.random() > 0.97 ? 0 : y + 1;
            });
        }, 40);

        const stop = start(() => {
            clearInterval(painter);
            audio.pause();
            screen.remove();
        }, 6000);
        screen.addEventListener('click', stop);
    }

    document.addEventListener('keydown', onKeydown);
})();
