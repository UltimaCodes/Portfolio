# Portfolio Redesign + New Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the entire portfolio site to the validated design system, fix all known bugs, archive the pre-redesign site as a single standalone HTML file, and add two new pages plus a genuinely interactive easter-egg system.

**Architecture:** Static HTML/CSS/JS, zero build step, zero new dependencies (Google Fonts `<link>` only). One shared `style.css` design-token foundation that every page consumes. No page reuses another page's specific components — only the shared tokens/card-shell/type system.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties), vanilla JS (IIFE modules, existing pattern). Google Fonts: Press Start 2P (already used) + Jersey 15 (new).

**Verification methodology:** This project has no test framework and none should be added — it's a static personal site with no build step. "Test" in every task below means: serve the site locally (`python -m http.server` from repo root, already configured as the `static-site` launch config), load the relevant page(s) in the browser, check the browser console for errors, and visually/functionally confirm the specific behavior described. Every task's Verify step says exactly what to check.

## Global Constraints

- Vanilla HTML/CSS/JS only. No frameworks, no bundler, no build step, no new npm/runtime dependencies.
- Stays on GitHub Pages. Do not change hosting.
- **Do not `git push` at any point in this plan.** Everything stays local/committed-locally only — the user has not repurchased the domain yet and does not want anything published.
- Full design values (exact hex codes, font names, the card-shell CSS, the no-dead-space rule) are defined in [`docs/superpowers/specs/2026-08-22-portfolio-redesign-design.md`](../specs/2026-08-22-portfolio-redesign-design.md) — every task below implements that spec; treat it as the source of truth for values not repeated here.
- The 7 existing easter eggs (Dogger, Ultrakill, MGR, Undertale, Deltarune, Jonkler, Matrix) keep their current content/jokes/audio — only their *trigger mechanism* and visual skin change in Task 9.

---

### Task 1: Compile the legacy archive

**Files:**
- Create: `legacy.html` (repo root)

**Interfaces:**
- Produces: a fully standalone, self-contained HTML file (inlined CSS, inlined/adapted JS, images referenced via existing `images/` paths since those assets aren't being deleted) reproducing the pre-redesign site (index, about, projects, and the 4 project pages) as one document with in-page navigation. No dependency on `style.css` or `js/*.js` — this file must still render correctly even after those are rewritten in later tasks.

- [ ] **Step 1: Extract the pre-redesign source files from git HEAD**

Run from repo root:
```bash
git show HEAD:index.html > /tmp/legacy-index.html
git show HEAD:about.html > /tmp/legacy-about.html
git show HEAD:projects.html > /tmp/legacy-projects.html
git show HEAD:projects/atomica.html > /tmp/legacy-atomica.html
git show HEAD:projects/gorilla-warfare.html > /tmp/legacy-gorilla.html
git show HEAD:projects/graphorama.html > /tmp/legacy-graphorama.html
git show HEAD:projects/shitbox.html > /tmp/legacy-shitbox.html
git show HEAD:style.css > /tmp/legacy-style.css
git show HEAD:js/shared.js > /tmp/legacy-shared.js
git show HEAD:js/homepage-effects.js > /tmp/legacy-homepage-effects.js
git show HEAD:js/age-tracker.js > /tmp/legacy-age-tracker.js
git show HEAD:js/music-player.js > /tmp/legacy-music-player.js
git show HEAD:js/projects.js > /tmp/legacy-projects.js
```
This is the true last-deployed state (commit `c9ef98d`), independent of any working-tree edits made this session.

- [ ] **Step 2: Build `legacy.html` as one document with 7 sections**

Structure: one `<html>` document with a fixed top nav bar (`Home | About | Projects | Atomica | Gorilla Warfare | Graphorama | Sumo Robot`) using anchor links (`#legacy-home`, `#legacy-about`, etc.) to `scroll-into-view`, plus a small banner at the very top:

```html
<div style="background:#ff00aa;color:#000;text-align:center;padding:10px;font-family:monospace;font-weight:bold;">
  📼 LEGACY ARCHIVE — this is a snapshot of the site as it looked before the redesign. Not the live site.
</div>
```

Each of the 7 sections is a `<section id="legacy-{name}">` wrapping that page's original `<body>` content verbatim (drop each page's own `<nav>`/`<footer>` duplication — keep one shared footer at the very end instead of 7 copies). Inline `/tmp/legacy-style.css` once in a single `<style>` block in `<head>` (it's already global, applies to all sections identically since that's how it worked originally).

- [ ] **Step 3: Namespace duplicate IDs so combined JS still works**

The original pages each have `#parallax-background`, and about.html has `#age-display`, index.html has `#cat-img`/`#ultrakill-container`/`#dynamic-separator`, etc. Combined into one DOM, `document.getElementById`/`querySelector` calls in the original JS would only ever find the *first* match. Fix by:
- Prefixing each section's originally-unique IDs with its section name (e.g. `#parallax-background` → `#legacy-home-parallax-background`, `#age-display` → `#legacy-about-age-display`).
- Inlining the 5 JS files at the end of `<body>`, each wrapped to query the namespaced ID instead of the bare one — since these are small IIFEs, copy each file's source into `legacy.html` directly (don't reference `js/*.js`, those get rewritten in later tasks and must not affect this archive) and update the ~10 `getElementById`/`querySelector` calls across them to the namespaced equivalents.
- Audio elements (`music/*.mp3`, `res/*.mp3`) keep their existing relative paths — those asset files aren't moving.

- [ ] **Step 4: Verify**

Serve locally (`python -m http.server 4173` from repo root), navigate to `http://localhost:4173/legacy.html`. Check:
- No console errors.
- Clicking each nav link scrolls to the right section.
- The About section's age tracker counts up live.
- The Home section's cat roulette cycles images.
- No visual bleed between sections (each section's own styling stays contained — this should hold automatically since the original CSS was already global/consistent across pages).

- [ ] **Step 5: Commit**

```bash
git add legacy.html
git commit -m "Archive pre-redesign site as a standalone legacy.html snapshot"
```

---

### Task 2: CSS design system foundation

**Files:**
- Modify: `style.css` (full rewrite of the token/base layer; component-specific rules arrive in later tasks as each page is reworked)

**Interfaces:**
- Produces: CSS custom properties every later task consumes:
  `--bg`, `--panel`, `--border`, `--accent` (green), `--accent-alert` (magenta), `--text`, `--text-dim`, `--font-head` (Press Start 2P), `--font-body` (Jersey 15). Plus a reusable `.card-shell` component class (background/border/box-shadow) and `.card-titlebar` class, per the spec's "Hard-Shadow Sticker" definition.

- [ ] **Step 1: Add the Google Fonts import for Jersey 15 alongside the existing Press Start 2P import**

At the top of `style.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Jersey+15&display=swap');
```

- [ ] **Step 2: Define the design tokens as CSS custom properties on `:root`**

```css
:root {
  --bg: #0b0c2a;
  --panel: #101233;
  --border: #2a2d5c;
  --accent: #33ff33;
  --accent-alert: #ff3fa8;
  --accent-alert-shadow: #ff00aa;
  --text: #c9cbe8;
  --text-dim: #6d71a8;
  --text-dim-2: #8b8fc9;
  --font-head: 'Press Start 2P', monospace;
  --font-body: 'Jersey 15', monospace;
}
```

- [ ] **Step 3: Replace the global body font-family and background with the tokens**

Change the existing `body { font-family: 'Press Start 2P', cursive; background-color: #0b0c2a; ... }` rule so headings/nav/buttons use `var(--font-head)` and body copy/paragraphs use `var(--font-body)`. Concretely: keep `body { font-family: var(--font-body); background: var(--bg); color: var(--text); }` as the default, and apply `var(--font-head)` explicitly on `h1, h2, h3, nav a, .btn-pixel, .status-header` and any other UI-chrome selectors that currently hardcode `'Press Start 2P'` (there are 19 such declarations per the spec's audit — replace every one with `var(--font-head)`, and every plain `monospace` declaration with `var(--font-body)`).

- [ ] **Step 4: Add the hard drop-shadow to major headings**

```css
h1, .title {
  text-shadow: 2px 2px 0 var(--accent-alert-shadow);
}
```
Do not add `text-shadow` with any blur radius anywhere in the file — grep the file for `text-shadow` and `box-shadow` after this task and confirm every value has `0` blur (third value in the shadow shorthand).

- [ ] **Step 5: Add the reusable card-shell component classes**

```css
.card-shell {
  background: var(--panel);
  border: 1px solid var(--accent);
  box-shadow: 4px 4px 0 rgba(51, 255, 51, 0.35);
}
.card-titlebar {
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-head);
  font-size: 0.5rem;
  padding: 8px 12px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.card-body {
  padding: 12px 14px 14px;
  font-family: var(--font-body);
  color: var(--text);
}
.card-row-grid {
  display: grid;
  grid-template-columns: max-content max-content;
  gap: 5px 16px;
}
```
These 4 classes are what every later task's cards/panels are built from — do not invent a second card pattern in a later task.

- [ ] **Step 6: Consolidate the 6 scattered `@media (max-width: 768px)` blocks into one**

Search the file for every `@media (max-width: 768px)` occurrence, cut their contents, and merge into a single block near the end of the file (keep the existing `@media (min-width: 1440px)` separate, that one isn't part of the scattered-duplicate problem). Verify no selector was dropped in the merge by diffing the total rule count before/after (`grep -c "^\s*\." style.css` before and after should match, since this is a pure reorganization, not a content change).

- [ ] **Step 7: Replace the 2 blanket `transition: all 0.3s ease` declarations**

Find both occurrences (originally at lines ~78 and ~834). Replace each with the specific properties that element actually animates — check what properties change on that selector's `:hover`/`.active` state nearby in the file and list only those (e.g. `transition: opacity 0.3s ease, transform 0.3s ease;` instead of `all`).

- [ ] **Step 8: Self-host the parallax texture instead of loading it from transparenttextures.com**

Download the texture:
```bash
curl -o images/stardust-texture.png https://www.transparenttextures.com/patterns/stardust.png
```
Update `#parallax-background`'s `background-image` from the external URL to `url('images/stardust-texture.png')`.

- [ ] **Step 9: Remove the nav link glow/flicker — a full grep-for-glow pass turned up 16 blurred-shadow instances, this is the shared/global one**

`nav a:hover` currently stacks a 4-layer neon glow and an infinite flicker animation (the comment above it literally says "Nav button hover glow/flicker effect"), and `nav a.active` has its own single-layer glow. Both are exactly the effect the design system explicitly bans. Replace:

```css
/* before */
nav a {
  position: relative;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}
nav a:hover {
  color: #ff66cc;
  text-shadow:
          0 0 5px #ff66cc,
          0 0 10px #ff33aa,
          0 0 15px #ff0088,
          0 0 20px #ff0088;
  animation: flicker 1.5s infinite alternate;
}
@keyframes flicker {
  0%, 100% { text-shadow: 0 0 10px #ff33aa; }
  50% { text-shadow: 0 0 20px #ff66cc, 0 0 30px #ff00aa; }
}
/* ...later in the file... */
nav a.active {
  background-color: #ff00aa;
  color: #000;
  box-shadow: 0 0 8px #ff00aa;
  pointer-events: none;
}
```
```css
/* after */
nav a {
  position: relative;
  transition: color 0.2s ease;
}
nav a:hover {
  color: var(--accent);
}
nav a.active {
  background-color: var(--accent);
  color: var(--bg);
  pointer-events: none;
}
```
Delete the `@keyframes flicker` block entirely (no other selector references it — confirm with `grep -n "flicker" style.css` before deleting, it should only match this one keyframe and its one usage).

- [ ] **Step 10: Verify**

Serve locally, load `index.html`. Check: no console errors, no 404s in the network tab (especially confirming the texture now loads from `images/stardust-texture.png` not the external domain), heading text shows the magenta hard-shadow with no blur, hovering a nav link shows a plain color change with no glow or flicker, page still uses the navy/green/magenta palette.

- [ ] **Step 11: Commit**

```bash
git add style.css images/stardust-texture.png
git commit -m "Rebuild style.css around the Refined Classic design system (tokens, card shell, Jersey 15 body font, remove nav glow/flicker)"
```

---

### Task 3: Fix the remaining standalone bugs

**Files:**
- Modify: `projects/shitbox.html`
- Modify: `projects/atomica.html`
- Modify: `js/projects.js`
- Modify: `js/homepage-effects.js`

**Interfaces:**
- Consumes: nothing from Task 2.
- Produces: nothing consumed by later tasks — these are independent point-fixes. Can run in parallel with Task 2 if desired.

- [ ] **Step 1: Fix the parallax id typo**

In `projects/shitbox.html`, change `<div id="parallax-backsround"></div>` to `<div id="parallax-background"></div>`.

- [ ] **Step 2: Fix the stale page title**

In `projects/shitbox.html`, change `<title>PID LFR Robot | Ryaan Aaqil</title>` to `<title>Sumo Robot | Ryaan Aaqil</title>`.

- [ ] **Step 3: Fix the placeholder GitHub link**

In `projects/atomica.html`, change `<a href="https://github.com/your-username/Atomica" class="btn-pixel">View on GitHub</a>` to `<a href="https://github.com/UltimaCodes/Atomica" class="btn-pixel">View on GitHub</a>`. (This assumes the repo lives under the same `UltimaCodes` account as the other projects — confirm with Ryaan if this 404s once live.)

- [ ] **Step 4: Remove the dead gallery code**

In `js/projects.js`, delete the `setupProjectGalleries()` function entirely and its call inside `initProjectsPage()`. It targets a `.project-gallery` class that doesn't exist in any HTML file.

- [ ] **Step 5: Lazy-load the easter-egg audio files**

In `js/homepage-effects.js`, `initElements()` currently does:
```javascript
devourerAudio = new Audio('/res/DevourerSpawn.mp3');
ultrakillAudio = new Audio('/res/ultrakillsfx.mp3');
undertaleAudio = new Audio('/res/utale.mp3');
spamtonAudio = new Audio('/res/spamt.mp3');
matrixAudio = new Audio('/res/mtrx.mp3');
mgrrAudio = new Audio('/res/nanomachines.mp3');
jonklerAudio = new Audio('/res/jonkler.mp3');
```
Each `new Audio(src)` starts fetching immediately. Replace with lazy factory functions that only construct the `Audio` object the first time each specific egg fires — e.g. change the module-level `let devourerAudio, ...` declarations to stay `undefined` until first use, and in each trigger function (`triggerDoggerEasterEgg`, `showMGREasterEgg`, etc.) do:
```javascript
if (!devourerAudio) {
  devourerAudio = new Audio('/res/DevourerSpawn.mp3');
  devourerAudio.volume = 0.4;
}
```
(one such guard per audio variable, placed at the top of the function that plays it, moving the volume-setting line from `initElements()` into this guard). Remove the corresponding `new Audio(...)` and volume lines from `initElements()`.

- [ ] **Step 6: Fix the cat roulette alt-text mismatch**

In `js/homepage-effects.js`, `startAnimations()` has:
```javascript
const catImgs = ["images/cat4.png", "images/cat2.png", "images/cat3.png", "images/cat1.png", "images/cat5.png"];
setInterval(() => {
    const idx = Math.floor(Math.random() * catImgs.length);
    catImgElement.src = catImgs[idx];
    catImgElement.alt = `Pixel cat ${idx + 1}`;
}, 3000);
```
The alt text uses the array *index*, not the actual filename. Fix by extracting the number from the filename instead:
```javascript
const catImgs = ["images/cat4.png", "images/cat2.png", "images/cat3.png", "images/cat1.png", "images/cat5.png"];
setInterval(() => {
    const idx = Math.floor(Math.random() * catImgs.length);
    const src = catImgs[idx];
    catImgElement.src = src;
    catImgElement.alt = `Pixel cat ${src.match(/\d+/)[0]}`;
}, 3000);
```

- [ ] **Step 7: Verify**

Serve locally. Load `projects/shitbox.html` — confirm the parallax texture now renders (it was invisible before the id fix) and the browser tab shows "Sumo Robot". Load `index.html`, open the Network tab, reload, and confirm none of the 7 `res/*.mp3` files are fetched on load (they should only appear after actually triggering an egg via its keyword). Trigger one egg (type its keyword) and confirm its specific audio file now loads and plays. Watch the cat roulette for ~15 seconds and confirm the alt text (inspect via devtools) always matches the number in the currently-shown filename.

- [ ] **Step 8: Commit**

```bash
git add projects/shitbox.html projects/atomica.html js/projects.js js/homepage-effects.js
git commit -m "Fix parallax typo, stale title, placeholder link, dead code, eager audio loading, and cat alt-text mismatch"
```

---

### Task 4: Rework the About page

**Files:**
- Modify: `about.html`
- Modify: `style.css` (About-specific rules: pull-quote, skill cards, MUN table, chips, contact readout)

**Interfaces:**
- Consumes: `.card-shell`, `.card-titlebar`, `.card-body`, `.card-row-grid`, and the CSS custom properties from Task 2.
- Produces: nothing consumed by later tasks.

This task implements the "About page (fully validated)" section of the spec exactly as written there — header with 3 stat chips, tab-styled scroll-anchor quick-jump pills (Profile/Skills/MUN/Goals/Contact), pull-quote intro, 2×2 skill category grid with wrapping chips (all 20 real skills, grouped Programming/Game Development/Robotics & Hardware/Tools & Software exactly as currently listed in `about.html`), MUN table capped to ~480px, and a content-sized terminal-style contact box. Keep Education, Hobbies & Interests, and the Goals checklist's existing content and structure — only reskin them with the new tokens/fonts, no layout rework (per spec, these weren't individually redesigned this session). Age tracker JS (`js/age-tracker.js`) is untouched — only wrap its output in the new visual skin. Phone number in the contact section stays.

- [ ] **Step 1: Build the header + stat chips + quick-jump pills**

Replace the current `<div class="bio-centered"><h1>About Me</h1></div>` block with:
```html
<div class="about-header">
  <h1>RYAAN AAQIL</h1>
  <p class="about-tagline">Developer · Game Designer · Robotics Enthusiast</p>
  <div class="about-chips">
    <span class="about-chip">18 years old</span>
    <span class="about-chip">A-Levels @ Nixor</span>
    <span class="about-chip">Coding since age 9</span>
  </div>
</div>
<nav class="about-jumpnav">
  <a href="#about-profile" class="about-jumptab active">Profile</a>
  <a href="#about-skills" class="about-jumptab">Skills</a>
  <a href="#about-mun" class="about-jumptab">MUN</a>
  <a href="#about-goals" class="about-jumptab">Goals</a>
  <a href="#about-contact" class="about-jumptab">Contact</a>
</nav>
```
Add matching CSS (`.about-header` centered; `.about-chip` pill using `var(--border)` border and `var(--text-dim-2)` text; `.about-jumpnav` flex row with a bottom border; `.about-jumptab` using `var(--font-head)` at `0.55rem` with `border-bottom: 2px solid transparent`, and `.about-jumptab.active` / `:hover` getting `border-bottom-color: var(--accent); color: var(--accent);`). Give `<section id="about-profile">` etc. `scroll-margin-top: 20px;` so the anchor jumps don't land flush against the viewport edge.

- [ ] **Step 2: Wrap the Introduction paragraph in the pull-quote treatment**

Wrap the existing intro `<p>` in `<div class="about-quote">...</div>` with:
```css
.about-quote {
  font-size: 1.15rem;
  line-height: 1.6;
  border-left: 3px solid var(--accent-alert-shadow);
  padding-left: 16px;
}
```

- [ ] **Step 3: Rebuild the Skills section as a 2×2 bounded-card grid with wrapping chips**

Replace the existing `.skills-grid` markup (currently 4 `.skill-category` blocks with `<ul><li>`) with 4 cards using the shared card-shell classes:
```html
<div class="about-skills-grid">
  <div class="card-shell">
    <div class="card-titlebar">PROGRAMMING</div>
    <div class="card-body about-chip-row">
      <span class="about-skill-chip">C# (Advanced)</span>
      <span class="about-skill-chip">C++ (Intermediate)</span>
      <span class="about-skill-chip">Python (Intermediate)</span>
      <span class="about-skill-chip">JavaScript (Beginner)</span>
      <span class="about-skill-chip">HTML/CSS (Intermediate)</span>
    </div>
  </div>
  <!-- repeat for GAME DEVELOPMENT, ROBOTICS & HARDWARE, TOOLS & SOFTWARE using the exact same 5 items each already listed in the current about.html -->
</div>
```
CSS:
```css
.about-skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 768px) { .about-skills-grid { grid-template-columns: 1fr; } }
.about-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.about-skill-chip { font-size: 0.85rem; background: rgba(51,255,51,0.07); color: var(--accent); padding: 2px 8px; border-radius: 3px; }
```

- [ ] **Step 4: Rebuild the MUN Experience section as a capped-width table**

Replace the current `<ul>` of 8 MUN entries with a table using the current 8 entries' exact text (Event | Committee | Result columns — split each existing bullet's " - " separated text into these 3 fields):
```html
<div class="about-table">
  <div class="about-row about-row-head"><span>Event</span><span>Committee</span><span>Result</span></div>
  <div class="about-row"><span>BeaconMun 2024</span><span>SOCHUM — DPRK</span><span>—</span></div>
  <div class="about-row"><span>FDMUN III</span><span>DISEC — DPRK</span><span class="alert">Best Delegate</span></div>
  <div class="about-row"><span>HCMUN III</span><span>ODC</span><span class="alert">Hon. Mention</span></div>
  <div class="about-row"><span>HCMUN III</span><span>BDCC — UAE</span><span class="alert">Best Delegate</span></div>
  <div class="about-row"><span>MUNIK XV</span><span>MvD</span><span class="alert">Hon. Mention</span></div>
  <div class="about-row"><span>JCMUN VI</span><span>HCC</span><span class="alert">Best Delegate</span></div>
  <div class="about-row"><span>BeaconMun 2025</span><span>HCC</span><span>—</span></div>
  <div class="about-row"><span>CBMUN XII</span><span>CHESG</span><span>—</span></div>
</div>
```
CSS:
```css
.about-table { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; max-width: 520px; }
.about-row { display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 6px 12px; border-bottom: 1px solid var(--border); }
.about-row:last-child { border-bottom: none; }
.about-row:nth-child(even) { background: var(--panel); }
.about-row .alert { color: var(--accent-alert); }
.about-row-head { color: var(--text-dim); font-size: 0.7rem; text-transform: uppercase; }
```

- [ ] **Step 5: Rebuild the Contact section as a content-sized terminal readout**

Replace the current `.boot-sequence.sys-diag` block with:
```html
<div class="about-terminal">
  <div><span class="dim">email:</span> ryaanaqil3@gmail.com</div>
  <div><span class="dim">github:</span> <a href="https://github.com/UltimaCodes">UltimaCodes</a></div>
  <div>carrier pigeon also accepted</div>
</div>
```
CSS:
```css
.about-terminal { background: #050611; border: 1px solid var(--accent); border-radius: 4px; padding: 10px 14px; display: inline-block; min-width: 260px; }
.about-terminal .dim { color: var(--text-dim); }
```
The "MUN Portfolio" resume button (`<a href="/res/Resume.pdf" class="btn-pixel">MUN Portfolio</a>`) stays exactly where it is, below this block, unchanged.

- [ ] **Step 6: Reskin Education, Hobbies & Interests, and Goals sections with the new tokens (no structural change)**

Keep the existing HTML structure and content of all 3 sections exactly as-is. Update the shared `.about-section` rules in `style.css` — these currently hardcode magenta on every section heading and every list-item bullet, which violates the spec's "magenta is a rare accent, never a second workhorse color" rule now that About has other places (the alert values in the MUN table, the contact terminal) already using it. Change:

```css
/* before */
.about-section {
  background-color: #1c1c40;
  padding: 30px;
  border: 2px solid #fff;
  margin: 20px auto;
}
.about-section h2 {
  color: #ff00aa;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
}
.about-section h3 {
  color: #33ff33;
  font-size: 0.9rem;
  margin: 15px 0 10px 0;
}
.about-section li:before {
  content: ">";
  color: #ff00aa;
  position: absolute;
  left: 0;
}
```
```css
/* after */
.about-section {
  background-color: var(--panel);
  padding: 30px;
  border: 1px solid var(--border);
  margin: 20px auto;
}
.about-section h2 {
  font-family: var(--font-head);
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
}
.about-section h3 {
  font-family: var(--font-head);
  color: var(--accent);
  font-size: 0.9rem;
  margin: 15px 0 10px 0;
}
.about-section li:before {
  content: ">";
  color: var(--accent);
  position: absolute;
  left: 0;
}
```
Also update `.about-section p, .about-section li` to add `font-family: var(--font-body);` (currently unset, inheriting whatever `body` resolves to — make it explicit), and update `.goal-checkbox` / `.goal-checkbox.completed` / `.goal-text` to swap their hardcoded `#fff`/`#33ff33`/`#000` for `var(--text)` / `var(--accent)` / `var(--bg)` respectively, keeping every other value (sizes, spacing, the strike-through on completed goals) unchanged.

- [ ] **Step 7: Verify**

Serve locally, load `about.html`. Check: no console errors, clicking each quick-jump pill scrolls to its section (page does not jump to a different "panel," content stays visible throughout), all 20 skills are visible and wrap correctly inside their 4 cards when the browser is narrowed to ~400px width, the MUN table doesn't stretch edge-to-edge on a wide window, the age tracker still counts up live, the contact box doesn't stretch full-width, phone number is still present.

- [ ] **Step 8: Commit**

```bash
git add about.html style.css
git commit -m "Rework About page: quick-jump pills, pull-quote intro, bounded skill cards, capped MUN table, content-sized contact box"
```

---

### Task 5: Rework the homepage

**Files:**
- Modify: `index.html`
- Modify: `style.css` (homepage-specific rules: status cards, bio/cat-roulette layout, fun-facts terminal)
- Modify: `js/homepage-effects.js` (only if the fun-facts/bio sections need new interaction wiring — see Step 3)

**Interfaces:**
- Consumes: `.card-shell`, `.card-titlebar`, `.card-body`, `.card-row-grid` from Task 2.
- Produces: nothing consumed by later tasks.

Per the spec, the hero + status cards are fully validated; the bio/cat-roulette and fun-facts sections were not individually mocked up, so Steps 3–4 apply the design system directly using this plan author's judgment — flag these back to Ryaan for a look once built rather than treating them as pre-approved.

- [ ] **Step 1: Rebuild the status cards section**

Replace the current `.status-grid` (4 boxes) with 3 independent `.card-shell` cards — drop `SYSTEM STATUS` entirely (its CPU/RAM/GPU content moves to the new `/uses` page in Task 7, not duplicated here):
```html
<div class="hp-cards">
  <div class="card-shell hp-card">
    <div class="card-titlebar">PROJECT STATUS</div>
    <div class="card-body card-row-grid">
      <span class="hp-label">GORILLA WARFARE</span><span class="hp-val">Maaf karo</span>
      <span class="hp-label">ATOMICA</span><span class="hp-val">COMPLETE</span>
      <span class="hp-label">WEBSITE</span><span class="hp-val alert">LIVE (WIP)</span>
    </div>
  </div>
  <div class="card-shell hp-card">
    <div class="card-titlebar">YES</div>
    <div class="card-body card-row-grid">
      <span class="hp-label">RED BULLS</span><span class="hp-val">251</span>
      <span class="hp-label">SCREEN TIME</span><span class="hp-val">67hr</span>
      <span class="hp-label">SANITY</span><span class="hp-val alert">we do not live in a society</span>
    </div>
  </div>
  <div class="card-shell hp-card">
    <div class="card-titlebar">ENVIRONMENT</div>
    <div class="card-body card-row-grid">
      <span class="hp-label">OS</span><span class="hp-val">WINDOWS 1998</span>
      <span class="hp-label">IDE</span><span class="hp-val">JETBRAINS RIDER</span>
      <span class="hp-label">BALLING?</span><span class="hp-val">Mayhaps</span>
      <span class="hp-label">CATS</span><span class="hp-val alert">ABUSIVE</span>
    </div>
  </div>
</div>
```
CSS — critical detail from the no-dead-space rule, do not use `1fr` grid columns here:
```css
.hp-cards { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
.hp-card { width: 230px; flex-shrink: 0; }
.hp-label { color: var(--text-dim-2); white-space: nowrap; }
.hp-val { white-space: nowrap; }
.hp-val.alert { color: var(--accent-alert); }
```
If "we do not live in a society" or "WINDOWS 1998 / JETBRAINS RIDER / Mayhaps / ABUSIVE" make the Environment card's content wider than 230px and wrap awkwardly, widen `.hp-card` uniformly (keep all 3 cards matching) rather than letting one card differ in width — re-check against real rendered text, per the spec's "Open items" note that 230px was chosen by eye.

- [ ] **Step 2: Remove the empty ultrakill-container's layout impact and confirm ANALYTICS section is gone**

Confirm the `<div id="analytics-section">` block (already removed in an earlier session) is not present in the current `index.html` — if a merge conflict or edit reintroduced it, remove it again. No other action needed here.

- [ ] **Step 3: Reskin the bio + cat roulette section**

Keep the existing `.main-content` structure (cat roulette image + bio paragraph side-by-side per current CSS). Update only the visual skin: bio text uses `var(--font-body)` at a readable size (`1rem`, `line-height: 1.6`), remove any hardcoded colors in favor of `var(--text)`. No structural change — this section's current side-by-side layout is reasonable and wasn't flagged as a problem.

- [ ] **Step 4: Rebuild the "THIS MIGHT BE TRUE" fun-facts block using the card-shell**

Wrap the existing `.code-matrix` content in the shared card pattern instead of its current bespoke styling:
```html
<div class="card-shell" style="max-width: 520px; margin: 30px auto;">
  <div class="card-titlebar">THIS MIGHT BE TRUE</div>
  <div class="card-body">
    <div class="commit-line">&gt; All watermelons have an even number of stripes</div>
    <!-- keep all existing commit-line entries verbatim -->
    <div class="commit-line cursor">_</div>
  </div>
</div>
```
Keep the existing `js/homepage-effects.js` `initStatusAnimations()` logic that fades in `.commit-line` elements in sequence — it targets `.commit-line` by class, which still exists, so no JS change needed here.

- [ ] **Step 5: Delete the now-dead old status/matrix CSS, including two more glow instances the grep-for-glow pass found**

Steps 1 and 4 replace every use of `.status-grid`/`.status-box`/`.status-header`/`.status-content`/`.status-line`/`.status-value` and the old bespoke `.code-matrix`/`.matrix-header` styling with `.card-shell`. Delete those old rule blocks from `style.css` entirely rather than leaving them as unused dead weight — this also removes two more blurred-glow instances the file-wide grep turned up that would otherwise silently survive unused: `.status-box { box-shadow: 0 0 10px rgba(51, 255, 51, 0.2); }` and `.code-matrix { box-shadow: 0 0 15px rgba(51, 255, 51, 0.3); }`. Confirm with `grep -n "status-box\|status-header\|status-content\|status-line\|status-value\|code-matrix\|matrix-header" index.html style.css` that no HTML references these classes anymore before deleting their CSS.

- [ ] **Step 6: Verify**

Serve locally, load `index.html`. Check: no console errors, exactly 3 status cards render (no 4th SYSTEM box), all 3 cards are the same width with no large empty gap after short content, values align in a column within each card, cat roulette still cycles, bio text is legible in Jersey 15, fun-facts block still fades in line-by-line, `grep -n "shadow:\s*0\s*0" style.css` no longer matches anything inside the deleted rules.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css
git commit -m "Rework homepage: 3-card status section (SYSTEM removed), reskinned bio and fun-facts block"
```

---

### Task 6: Rework the projects pages

**Files:**
- Modify: `projects.html`
- Modify: `projects/atomica.html`, `projects/gorilla-warfare.html`, `projects/graphorama.html`, `projects/shitbox.html`
- Modify: `style.css` (projects-specific rules)

**Interfaces:**
- Consumes: tokens from Task 2. Consumes the fixes from Task 3 (must be applied first, or re-verify they survived if done out of order).
- Produces: nothing consumed by later tasks.

Per the spec, these pages weren't individually mocked up — `projects.html` keeps its existing grid-of-cards shape (already reasonable), and the 4 detail pages keep their existing long-form article shape (already reasonable). This task reskins both with the new tokens/type/card-shell rather than restructuring them. Flag back to Ryaan for a look once built.

- [ ] **Step 1: Reskin the project card grid on `projects.html`**

`.project-card:hover` and `.projects-section h2` both currently use blurred glow (found during the Task 2 grep-for-glow pass) and magenta as the default heading color on every single card and section title, not as a sparing accent. Replace:

```css
/* before */
.project-card:hover {
  transform: scale(1.05);
  background-color: #252560;
  box-shadow: 0 0 20px #ff00aa, 4px 4px 0 #ff00aa;
  z-index: 10;
}
.project-card .project-info h2 {
  color: #ff00aa;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-align: center;
}
.project-summary h3 {
  color: #ff00aa;
  font-size: 0.8rem;
  margin-bottom: 10px;
}
.projects-section h2 {
  color: #ff00aa;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 0 10px #ff00aa;
}
```
```css
/* after */
.project-card:hover {
  transform: scale(1.05);
  background-color: var(--panel);
  border-color: var(--accent);
  box-shadow: 4px 4px 0 rgba(51, 255, 51, 0.35);
  z-index: 10;
}
.project-card .project-info h2 {
  font-family: var(--font-head);
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-align: center;
}
.project-summary h3 {
  font-family: var(--font-head);
  color: var(--accent);
  font-size: 0.8rem;
  margin-bottom: 10px;
}
.projects-section h2 {
  font-family: var(--font-head);
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 30px;
}
```
Also update `.project-card` itself (currently `border: 2px solid #fff; background-color: #1c1c40;`) to `border: 1px solid var(--accent); background-color: var(--panel);` so the resting state already carries the card-shell's green-border identity, not just on hover. Keep the existing hover-reveal `.project-summary` behavior and the 3-section grouping (Game Development / Programming / Robotics) exactly as-is — only colors/fonts/shadow change, not the interaction or grouping.

- [ ] **Step 2: Reskin the 4 project detail pages, including two more glow instances**

`.blog-post h1` uses a magenta gradient text-fill (not a blur, leave the gradient technique as-is, it's a different effect) but `.blog-post h2` has the same banned blurred glow pattern:

```css
/* before */
.blog-post h2 {
  color: #ff00aa;
  margin-top: 30px;
  margin-bottom: 15px;
  text-shadow: 0 0 5px #ff00aa;
}
```
```css
/* after */
.blog-post h2 {
  font-family: var(--font-head);
  color: var(--accent);
  margin-top: 30px;
  margin-bottom: 15px;
}
```
Update `.blog-post` itself (`background-color: #1c1c40; border: 2px solid #fff;`) to `background-color: var(--panel); border: 1px solid var(--border);`, `.blog-post p, .blog-post li` to add `font-family: var(--font-body); color: var(--text);`, and `.blog-post .tech-used` (`border: 1px solid #33ff33;`) to `border: 1px solid var(--accent);`. Keep every page's existing content, structure, the magenta `h1` gradient, and the "View on GitHub" button pattern unchanged.

- [ ] **Step 3: Verify**

Serve locally, load `projects.html` and each of the 4 detail pages. Check: no console errors, hovering a project card still reveals its summary, all 4 detail pages render with the new palette/fonts and no leftover old-palette colors (spot-check via devtools computed styles on a heading and a paragraph).

- [ ] **Step 4: Commit**

```bash
git add projects.html projects/*.html style.css
git commit -m "Reskin projects grid and detail pages to the new design system"
```

---

### Task 7: Build the /uses setup page

**Files:**
- Create: `uses.html`
- Modify: `style.css` (if any new rule is needed beyond `.card-shell`/tables already defined)
- Modify: `index.html`, `about.html`, `projects.html` and the 4 project detail pages (add a nav link)

**Interfaces:**
- Consumes: `.card-shell` and the `.about-table` pattern from Task 4 (reuse that exact table CSS for a "spec sheet" table here — don't invent a third table style).

- [ ] **Step 1: Create `uses.html` with the same nav/footer shell as every other page**

Copy the standard `<nav>`/`<footer>`/`<script>` structure from `about.html`. Every page's `<nav>` currently has exactly one link per `left`/`center`/`right` slot; add Uses as a second link inside the existing `.left` slot rather than restructuring the 3-slot layout:
```html
<!-- before, on every page -->
<div class="left"><a href="projects.html" class="btn-pixel">Projects</a></div>
<!-- after, on every page (index.html/about.html/projects.html at root; projects/*.html use ../uses.html) -->
<div class="left"><a href="projects.html" class="btn-pixel">Projects</a> <a href="uses.html" class="btn-pixel">Uses</a></div>
```
Add `.left { display: flex; gap: 8px; }` to `style.css` if `.left` isn't already a flex container (check first — it may already be, since it's currently a single-child div).

- [ ] **Step 2: Build the setup content using the content removed from the homepage's SYSTEM STATUS box**

```html
<div class="about-header">
  <h1>SETUP</h1>
  <p class="about-tagline">What I actually build on</p>
</div>
<div class="about-table" style="margin: 0 auto;">
  <div class="about-row about-row-head"><span>Component</span><span>Spec</span></div>
  <div class="about-row"><span>CPU</span><span>Ryzen 5 5600</span></div>
  <div class="about-row"><span>RAM</span><span>32GB DDR4</span></div>
  <div class="about-row"><span>GPU</span><span>RTX 2070 Super</span></div>
  <div class="about-row"><span>OS</span><span>Windows 11</span></div>
  <div class="about-row"><span>IDE</span><span>JetBrains Rider</span></div>
</div>
```
(Note: the homepage joke box said "OS: WINDOWS 1998" and "STATUS: LIFE SUPPORT" — those are jokes, not real specs; use the real OS value here since this page is the honest counterpart, not the joke one.)

- [ ] **Step 3: Verify**

Serve locally, load `uses.html` directly and via the nav link from every other page. Check: no console errors, nav link works from all 7 other pages, table doesn't stretch full width.

- [ ] **Step 4: Commit**

```bash
git add uses.html style.css index.html about.html projects.html projects/*.html
git commit -m "Add /uses setup page, link it from site nav"
```

---

### Task 8: Build the custom 404 page

**Files:**
- Create: `404.html`

**Interfaces:**
- Consumes: `.card-shell`, tokens from Task 2. GitHub Pages automatically serves a root-level `404.html` for any unmatched URL on a custom domain or project site — no configuration needed beyond the file existing at repo root.

- [ ] **Step 1: Create `404.html` at repo root**

Same nav/footer shell as other pages, main content:
```html
<div class="about-header" style="padding: 60px 20px;">
  <h1>404</h1>
  <p class="about-tagline">This page doesn't exist. Much like my sleep schedule.</p>
  <div class="hp-cards" style="margin-top: 30px;">
    <a href="/index.html" class="btn-pixel">Take me home</a>
  </div>
</div>
```

- [ ] **Step 2: Verify**

Serve locally, navigate to `http://localhost:4173/this-page-does-not-exist`. Python's `http.server` doesn't auto-serve `404.html` for unmatched routes the way GitHub Pages does, so instead directly load `http://localhost:4173/404.html` and visually confirm it renders correctly with the site's nav/footer/styling intact. Note in the commit message that GitHub-Pages-specific 404 routing can only be confirmed after a real deploy (out of scope — not pushing yet).

- [ ] **Step 3: Commit**

```bash
git add 404.html
git commit -m "Add custom 404 page"
```

---

### Task 9: Easter egg system overhaul

**Files:**
- Modify: `js/homepage-effects.js` (existing 7 eggs: reskin + keep keyword triggers as one valid path, not the only one)
- Create: `js/easter-eggs.js` (new interaction-based trigger system, kept separate from the existing file per the "files that change together live together, split by responsibility" principle — this is a distinct subsystem: physical-interaction detection, not homepage-specific visual effects)
- Modify: `index.html` (script include for the new file, plus the DOM hooks each new trigger needs — e.g. `draggable="true"` on the dog image)
- Modify: `style.css` (visual skin for the existing 7 eggs' popups/messages, updated to the card-shell language instead of their current bespoke styling)

**Interfaces:**
- Consumes: `.card-shell` from Task 2 for reskinning egg message popups.
- Produces: `window.easterEggs.register(name, triggerConfig)` — a small registry API other future eggs can hook into (documented in Step 1) so this isn't a one-off pile of independent listeners.

Ryaan asked for all 4 requested interaction styles: click/drag/hover triggers, a Konami-style key sequence, hidden clickable elements, and mini-interactions instead of popups. This task adds one concrete example of each, plus reskins (not rewires) the existing 7 keyword-triggered eggs so keyword-typing remains *one* valid trigger style, not the only one.

- [ ] **Step 1: Build the trigger registry in `js/easter-eggs.js`**

```javascript
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
})();
```

- [ ] **Step 2: Add the Konami-style key-sequence egg**

Still in `js/easter-eggs.js`, after the registry definition:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    window.easterEggs.register('konami-glitch', {
        type: 'keydown-sequence',
        sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
        onTrigger: function() {
            document.body.classList.add('konami-active');
            setTimeout(() => document.body.classList.remove('konami-active'), 4000);
        }
    });
});
```
CSS in `style.css`:
```css
body.konami-active { animation: konami-shake 0.15s linear infinite; }
@keyframes konami-shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, -2px); }
}
```

- [ ] **Step 3: Add the drag-the-dog-onto-the-title egg (replaces the automatic random trigger with a deliberate interaction)**

In `index.html`, add `draggable="true"` to the `.dog` image. Register:
```javascript
window.easterEggs.register('dog-devour', {
    type: 'drag-target',
    sourceSelector: '.dog',
    targetSelector: '.title',
    onTrigger: function() {
        // reuse the existing animateDog()/devourer sequence already defined in js/homepage-effects.js
        if (typeof window.triggerDevourerSequence === 'function') window.triggerDevourerSequence();
    }
});
```
In `js/homepage-effects.js`, extract the existing devourer particle/audio/class-toggle logic currently inside `animateDog()`'s automatic-interval path into a named function `triggerDevourerSequence()`, expose it as `window.triggerDevourerSequence = triggerDevourerSequence;`, and keep the existing 45-second automatic interval calling the same function — so the egg now fires both automatically (as today) *and* on-demand when the dog is dragged onto the title.

- [ ] **Step 4: Add the rapid-click-the-cat egg (mini-interaction, not a popup)**

Register:
```javascript
window.easterEggs.register('cat-frenzy', {
    type: 'click-target',
    selector: '#cat-img',
    clicksRequired: 5,
    resetMs: 1500,
    onTrigger: function() {
        const img = document.querySelector('#cat-img');
        img.classList.add('cat-frenzy-spin');
        let spins = 0;
        const spinInterval = setInterval(() => {
            const cats = ['images/cat1.png','images/cat2.png','images/cat3.png','images/cat4.png','images/cat5.png'];
            img.src = cats[spins % cats.length];
            spins++;
            if (spins > 10) {
                clearInterval(spinInterval);
                img.classList.remove('cat-frenzy-spin');
            }
        }, 100);
    }
});
```
CSS: `.cat-frenzy-spin { animation: cat-spin 0.4s linear infinite; } @keyframes cat-spin { to { transform: rotate(360deg); } }`. This is a "mini-interaction" (you caused a rapid visible cycling effect through your own clicking, not a static message box).

- [ ] **Step 5: Add the hover-hold egg on the nav logo**

Register:
```javascript
window.easterEggs.register('wgat-hover-reveal', {
    type: 'hover-hold',
    selector: '.nav-home',
    holdMs: 2000,
    onTrigger: function() {
        const el = document.querySelector('.nav-home');
        const original = el.textContent;
        el.textContent = '"wait, genuinely?"';
        el.classList.add('glitch');
        setTimeout(() => {
            el.textContent = original;
            el.classList.remove('glitch');
        }, 2500);
    }
});
```
This is the hover-triggered egg — holding the mouse over the `"wgat"` nav logo for 2 seconds reveals what it actually stands for, then reverts. Uses the existing `.glitch` class already defined in `style.css` for the visual flicker.

- [ ] **Step 6: Add one hidden clickable element**

In `index.html` footer, add a near-invisible target: `<span id="hidden-secret" style="opacity: 0.03; cursor: default; user-select: none;">•</span>` placed inline in the footer copyright text. Register:
```javascript
window.easterEggs.register('hidden-footer-dot', {
    type: 'click-target',
    selector: '#hidden-secret',
    clicksRequired: 1,
    onTrigger: function() {
        document.querySelector('#hidden-secret').style.opacity = '1';
        document.querySelector('#hidden-secret').textContent = 'you found it. there is nothing else here.';
        document.querySelector('#hidden-secret').style.color = 'var(--accent)';
    }
});
```

- [ ] **Step 7: Include the new script and reskin the existing 7 eggs' visual output**

Add `<script src="js/easter-eggs.js"></script>` to `index.html` after `js/homepage-effects.js`. For each of the existing 7 eggs' message/overlay elements (built inline in `showMGREasterEgg()`, `showUndertaleEasterEgg()`, `showDeltaruneEasterEgg()`, `showJonklerEasterEgg()`, `showUltrakillMessage()` in `js/homepage-effects.js`), update their inline-styled containers to use the `.card-shell`/`.card-titlebar` classes instead of their current bespoke `style.cssText` strings, so they visually match the new design system. Keep every trigger keyword, every joke/line of text, and every audio file exactly as they are — only the visual container changes.

Two of these also have blurred-glow CSS the Task 2 grep pass found (both are dramatic jump-scare-style moments, but the "no blur, ever" rule in the spec was written as absolute, so keep them consistent with the rest of the site rather than carving out an exception):

```css
/* before, #ultrakill-message */
text-shadow: 0 0 5px #f00;
```
```css
/* after */
text-shadow: 2px 2px 0 #f00;
```

```css
/* before — mgr-pulse is defined TWICE in the current file (lines ~180 and ~1221), the second
   definition wins per CSS cascade so the first is already dead; delete the dead one and fix the live one */
@keyframes mgr-pulse {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.8); }
}
/* on .mgr-terminal */
box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
animation: mgr-pulse 2s ease-in-out infinite;
```
```css
/* after — pulse via border width instead of blur radius, keeps the "alive/pulsing" feel with zero blur */
@keyframes mgr-pulse {
  0%, 100% { border-width: 3px; }
  50% { border-width: 6px; }
}
/* on .mgr-terminal */
box-shadow: 4px 4px 0 rgba(255, 0, 0, 0.6);
animation: mgr-pulse 2s ease-in-out infinite;
```
Delete the duplicate `@keyframes mgr-pulse` block (confirm both locations with `grep -n "mgr-pulse" style.css` first — there should be exactly 2 definitions and this fix reduces it to 1).

- [ ] **Step 8: Verify**

Serve locally, load `index.html`, open devtools console (no errors on load). Test each new egg: press the 8-key arrow sequence and confirm the shake animation fires; drag the dog image onto the title text and confirm the devour sequence plays; click the cat image 5 times within 1.5s and confirm the spin-cycle plays; hover the `"wgat"` nav logo for 2 seconds and confirm it reveals `"wait, genuinely?"` then reverts; find and click the near-invisible footer dot and confirm it reveals text. Also re-test 2 of the original 7 keyword eggs (e.g. type "ultrakill", type "matrix") and confirm they still fire with their original jokes/audio, now inside the card-shell visual frame, with the Ultrakill message's red text-shadow now hard-edged (no blur) and the MGR terminal pulsing via border-width, not a glow. Finally, run `grep -n "0 0 [0-9]" style.css` across the whole file one more time and confirm every remaining match is either a legitimate non-shadow use (e.g. a `translate(0, 0)` or gradient position) or has been consciously decided on, not a leftover glow.

- [ ] **Step 9: Commit**

```bash
git add js/easter-eggs.js js/homepage-effects.js index.html style.css
git commit -m "Add interactive easter-egg system (Konami sequence, drag, rapid-click, hidden element), reskin existing eggs, fix remaining glow instances"
```

---

## Self-Review Notes

- **Spec coverage:** all 9 bugs (Task 3, plus #7/#8/#9 folded into Task 2's rebuild), the full design system (Task 2), About/Homepage/Projects rework (Tasks 4–6), the two approved new pages (Tasks 7–8), and the 4-style easter egg expansion (Task 9) each have a task. The legacy archive (Task 1) is sequenced first specifically so it captures pre-redesign state.
- **Dependency order:** Task 1 must run before Tasks 2–9 touch the live pages (it reads from git HEAD regardless, but running it first avoids any confusion about which working-tree state it should reflect). Task 2 must precede Tasks 4–9 (they all consume its custom properties and `.card-shell` classes). Task 3 is independent and can run any time. Tasks 4/5/6/7/8 touch different files and could run in parallel once Task 2 is done. Task 9 should come after Task 5 (it modifies homepage markup Task 5 also touches — sequence to avoid merge conflicts within the same session).
- **No-push reminder:** no task includes a `git push` step, by design — every commit stays local.
- **Glow audit (added during self-review):** the original bug sweep only caught the 2 blanket-transition instances; a full `grep -n "shadow:\s*0\s*0"` pass over `style.css` during plan review turned up 16 blurred-glow instances total, most not mentioned in the design spec because they weren't visible in the mockups (mockups only covered the hero, status cards, and About page — never the nav hover state, the old status boxes, the projects grid, the blog-post pages, or the MGR/Ultrakill egg overlays). Every instance now has an owning task: nav hover/active + `@keyframes flicker` → Task 2 Step 9; old `.status-box`/`.code-matrix` glows → deleted as dead code in Task 5 Step 5 (superseded by the card-shell rebuild); `.project-card:hover`/`.project-summary h3`/`.projects-section h2` → Task 6 Step 1; `.blog-post h2` → Task 6 Step 2; `#ultrakill-message`/`.mgr-terminal`/duplicate `mgr-pulse` keyframe → Task 9 Step 7. Task 9 Step 8's Verify now includes a final file-wide re-grep specifically to catch anything this pass still missed.
