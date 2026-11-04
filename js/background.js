// The swirling paint behind every page. Plain WebGL, no libraries. The canvas
// renders at a fraction of the screen size and gets scaled up without smoothing,
// which is where the pixels come from and also why it's cheap to run.
(function() {
    'use strict';

    const PIXEL_SIZE = 4;       // CSS pixels per paint pixel
    const FRAME_MS = 1000 / 30; // 30fps is plenty for something this slow

    // [paint, paint, the dark between them, optional overrides]. Each page gets
    // its own, set by data-swirl on <body>.
    const PALETTES = {
        home:             ['#3d1d4e', '#1e2468', '#0b0c2a', { gloss: 0.22, speed: 0.55 }],
        projects:         ['#17704a', '#23408f', '#0a1a24'],
        setup:            ['#a33a35', '#245e8f', '#10182a'],
        about:            ['#925818', '#54307f', '#140f2a'],
        lost:             ['#55588a', '#32355f', '#0b0c2a'],
        settings:         ['#3a4a7a', '#4a3a72', '#0c0e26', { gloss: 0.22, speed: 0.55 }],
        'voxelium':       ['#347f4f', '#2f70a8', '#0c1e2a'],
        'gorilla-warfare':['#8a7218', '#22632d', '#101a12'],
        'bete':           ['#8f2329', '#1a6640', '#0b1f18'],
        'macrofy':        ['#3f66b5', '#6a6e88', '#10142a'],
        'retraceosu':     ['#b84a7d', '#5a3090', '#1a1020'],
        'saltsentinel':   ['#9e3049', '#4a1a72', '#0f0a1e'],
        'mako':           ['#862a35', '#2f72b5', '#140a12'],
        'shitbox':        ['#6f7780', '#a04f25', '#12141c'],
        'raheroshan':     ['#2e7d6b', '#8a6a1f', '#0b1a1c']
    };

    const VERTEX = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';

    const FRAGMENT = `
        #extension GL_OES_standard_derivatives : enable
        precision highp float;
        uniform vec2 uRes;
        uniform float uTime;
        uniform vec3 uA, uB, uC;
        uniform vec2 uMouse;
        uniform float uStir;
        uniform float uScroll;
        uniform float uGloss, uRelief, uVignette;

        mat2 rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c, -s, s, c);
        }

        void main() {
            vec2 screen = (gl_FragCoord.xy - 0.5 * uRes) / length(uRes);

            // The paint sits behind the page, so it moves less when you scroll
            vec2 p = screen + vec2(0.0, uScroll * 0.1);

            // The cursor drags the paint around it a little
            vec2 m = p - uMouse;
            p = uMouse + rot(uStir * 1.9 * exp(-dot(m, m) * 26.0)) * m;

            // One big slow spiral around the middle of the screen
            float r = length(p);
            p = rot(uTime * 0.035 + r * 7.0) * p;

            // Fold the space over itself until it looks like poured paint
            p *= 30.0;
            float t = uTime * 0.42;
            vec2 q = p;
            for (int i = 0; i < 6; i++) {
                float k = float(i);
                q += p * 0.7 + sin(p.yx * 0.8 + k);
                p += 0.7 * vec2(cos(q.y * 0.35 + t * 0.5 + k), sin(q.x * 0.33 - t * 0.4));
                p = rot(0.35) * p;
                p -= 0.8 * vec2(cos(p.x * 0.8 + p.y * 0.6), sin(p.x * 0.6 - p.y * 0.8));
            }

            // Two colours of paint with a dark outline where they meet
            float v = length(p) * 0.07 + 0.05 * sin(t * 0.3);
            float a = smoothstep(0.54, 0.64, v);
            float b = smoothstep(0.46, 0.36, v);
            vec3 col = uA * a + uB * b + uC * (1.0 - a - b);

            // Glossy streaks running along the flow
            float streak = pow(0.5 + 0.5 * sin(v * 30.0), 6.0);
            col += (uA * a + uB * b) * streak * uGloss + 0.02 * uGloss * streak * (a + b);

            // Light it from the top left so the paint looks thick
            #ifdef GL_OES_standard_derivatives
                vec2 slope = vec2(dFdx(v), dFdy(v)) * length(uRes) * 0.012;
                col *= 1.0 + clamp(dot(slope, vec2(-0.7, 0.7)), -1.0, 1.0) * uRelief;
            #endif

            // Darker toward the edges, like looking down into it
            col *= 1.0 - smoothstep(0.14, 0.56, length(screen)) * uVignette;

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    let gl, canvas, uniforms;
    let running = false;
    let time = 0;
    let speed = 1;
    let lastFrame = 0;
    let mouse = [0, 0], mouseTarget = [0, 0];
    let stir = 0, stirTarget = 0;

    function hexToRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }

    // Light mode is a barely-there tint on paper, the colours that work on navy
    // just turn into pastel mush when they get washed out.
    function applyPalette() {
        const entry = PALETTES[document.body.dataset.swirl] || PALETTES.home;
        const options = entry[3] || {};
        const light = document.documentElement.dataset.theme === 'light';
        const colours = entry.slice(0, 3).map(hexToRgb).map(rgb =>
            light ? rgb.map(c => c + (1 - c) * 0.9) : rgb
        );
        if (light) colours[2] = [0.965, 0.965, 0.984];
        speed = options.speed || 1;
        gl.uniform3fv(uniforms.uA, colours[0]);
        gl.uniform3fv(uniforms.uB, colours[1]);
        gl.uniform3fv(uniforms.uC, colours[2]);
        gl.uniform1f(uniforms.uGloss, light ? 0 : (options.gloss || 0.38));
        gl.uniform1f(uniforms.uRelief, light ? 0.02 : 0.28);
        gl.uniform1f(uniforms.uVignette, light ? 0 : 0.55);
    }

    function compile(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    function setUp() {
        canvas = document.createElement('canvas');
        canvas.id = 'swirl';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);

        gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
        if (!gl) return false;
        gl.getExtension('OES_standard_derivatives');

        const program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const a = gl.getAttribLocation(program, 'a');
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

        uniforms = {};
        ['uRes', 'uTime', 'uA', 'uB', 'uC', 'uMouse', 'uStir', 'uScroll', 'uGloss', 'uRelief', 'uVignette'].forEach(name => {
            uniforms[name] = gl.getUniformLocation(program, name);
        });

        resize();
        applyPalette();
        return true;
    }

    function resize() {
        canvas.width = Math.ceil(window.innerWidth / PIXEL_SIZE);
        canvas.height = Math.ceil(window.innerHeight / PIXEL_SIZE);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uniforms.uRes, canvas.width, canvas.height);
        if (!running) draw();
    }

    function draw() {
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform2f(uniforms.uMouse, mouse[0], mouse[1]);
        gl.uniform1f(uniforms.uStir, stir);
        gl.uniform1f(uniforms.uScroll, window.scrollY / Math.hypot(window.innerWidth, window.innerHeight));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
        if (!running) return;
        requestAnimationFrame(frame);
        const elapsed = now - lastFrame;
        if (elapsed < FRAME_MS) return;
        lastFrame = now;

        time += Math.min(elapsed, 100) / 1000 * speed;
        stir += (stirTarget - stir) * 0.08;
        stirTarget *= 0.97;
        mouse[0] += (mouseTarget[0] - mouse[0]) * 0.12;
        mouse[1] += (mouseTarget[1] - mouse[1]) * 0.12;
        draw();
    }

    function start() {
        if (running || document.hidden) return;
        running = true;
        lastFrame = performance.now();
        requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
    }

    function apply() {
        const on = siteSettings.get('bg') === 'on';
        canvas.hidden = !on;
        if (on) start(); else stop();
    }

    function init() {
        if (!setUp()) {
            // No WebGL: the flat background colour stays
            if (canvas) canvas.remove();
            return;
        }

        // Carry on from where the last page left off so the paint doesn't jump
        // when you click a link. The first page of a visit starts somewhere random.
        try {
            time = parseFloat(sessionStorage.getItem('swirlTime')) || Math.random() * 500;
        } catch (e) {
            time = Math.random() * 500;
        }
        draw();

        window.addEventListener('pagehide', () => {
            try { sessionStorage.setItem('swirlTime', String(time)); } catch (e) { /* fine */ }
        });
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else if (!canvas.hidden) start();
        });
        window.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            const size = Math.hypot(window.innerWidth, window.innerHeight);
            mouseTarget = [(e.clientX - window.innerWidth / 2) / size, (window.innerHeight / 2 - e.clientY) / size];
            stirTarget = Math.min(1, stirTarget + 0.03);
        }, { passive: true });

        document.addEventListener('settingchange', e => {
            if (e.detail.key === 'bg') apply();
            if (e.detail.key === 'theme') {
                applyPalette();
                if (!running) draw();
            }
        });

        apply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
