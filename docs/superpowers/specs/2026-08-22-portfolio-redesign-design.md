# Portfolio Redesign + Bug Fix Pass — Design Spec

## Context

Ryaan just got the `ryaanaaqil.org` domain back after losing it for a year and wants to relaunch with an updated site: a full visual redesign, a bug sweep, and (later, out of scope here) more content. The site is a static HTML/CSS/JS personal portfolio (game dev / robotics / MUN), deployed on GitHub Pages via a custom domain.

## Scope

**In scope:** visual redesign of the existing pages, and fixing every bug found during the sweep below.

**Explicitly out of scope (phase 2, future spec):** adding new projects, upgrading easter eggs from text/sound triggers to interactive components, adding new pages/sections (blog, gallery, timeline, contact form). Domain/DNS reconnection is operational, not a design decision, and was already handled via direct guidance (point DNS at GitHub Pages' IPs, re-save the custom domain in repo settings, enable HTTPS once available).

**Hard constraint:** stays 100% vanilla HTML/CSS/JS, static, zero build step, deployed on GitHub Pages exactly as today. No frameworks, no bundler, no new runtime dependencies. If implementation ever finds a genuine case for an external tool (e.g. self-hosting a font file, one-time image compression), that gets named and confirmed with Ryaan before use — never introduced silently.

## Bugs to fix (from the sweep)

1. [`projects/shitbox.html:11`](../../../projects/shitbox.html) — `id="parallax-backsround"` (typo) means this page silently loses the parallax background every other page has. Fix the id.
2. [`projects/shitbox.html:6`](../../../projects/shitbox.html) — tab title says "PID LFR Robot" but the page is entirely about the Sumo Robot ("Pablo Escrowbar"). Fix the title to match the content.
3. [`projects/atomica.html:83`](../../../projects/atomica.html) — "View on GitHub" links to the placeholder `github.com/your-username/Atomica`. Needs a real repo URL (confirm with Ryaan if `github.com/UltimaCodes/Atomica` isn't correct).
4. [`js/projects.js`](../../../js/projects.js) — `setupProjectGalleries()` targets a `.project-gallery` class that doesn't exist anywhere in the HTML; it's dead code. Remove it (the underlying idea — hover image-cycling per project — is a good phase-2 candidate, but don't ship dead code now).
5. [`js/homepage-effects.js`](../../../js/homepage-effects.js) `initElements()` — all 7 easter-egg audio files (~750KB) are fetched on every homepage load regardless of whether any easter egg is ever triggered. Change to lazy-load each `Audio` object the first time its specific easter egg fires, not on page load.
6. Cat roulette alt text ([`js/homepage-effects.js`](../../../js/homepage-effects.js), `startAnimations()`) — the alt text's cat number (`idx + 1`) doesn't correspond to the actual filename shown, since the array isn't in numeric order. Fix the mapping so alt text matches the displayed image.
7. `style.css` `#parallax-background` — texture image is pulled from `transparenttextures.com` (third-party, currently live but a single point of failure for a sitewide visual). Self-host the texture file instead.
8. `style.css` — 6 separate scattered `@media (max-width: 768px)` blocks. Consolidate into a coherent responsive structure as part of the CSS rebuild below (not a separate task — happens naturally when the stylesheet is rebuilt around the new design system).
9. `style.css` — 2 instances of blanket `transition: all 0.3s ease`. Replace with intentional per-property transitions as part of the rebuild.

**Explicitly not changing:** the raw phone number on the About page contact section stays as-is (Ryaan reviewed and chose to keep it).

## Design system

### Direction

Evolve the existing retro-terminal/glitch identity — don't replace it. The identity comes from the palette, the pixel-font headings, and the terminal/game-console framing; it does **not** come from CRT glow or scanline effects, which read as generic "AI-hacker-aesthetic" rather than deliberate design. Restraint is the point: let color discipline and typography carry the personality instead of atmospheric effects.

### Anti-patterns (binding constraints, provided by Ryaan)

No purple aurora gradient blob hero · no bento-grid rounded-square icon cards · no circular-avatar testimonials · no Inter font at default letter-spacing · no "unlock your [noun]" headlines · no rule-of-three adjective stacks · no "how it works" in exactly 3 steps · no blanket `transition: all .3s ease` on everything · no missing alt text / missing `lang` / default `<title>` · no particle-network or generic canvas-animation background · no Hero→Logos→Features→FAQ SaaS page structure · no em-dash-heavy double-speak · no gerund list titles · **no blurred neon text/box glow, no CRT scanline overlays** (established this session specifically — this is the site's own version of the same "generic AI slop" failure mode).

### Palette — "Refined Classic"

| Token | Value | Use |
|---|---|---|
| Background | `#0b0c2a` | page background |
| Panel/card fill | `#101233` | card and panel backgrounds |
| Structural border | `#2a2d5c` | neutral borders (tables, dividers, non-accented containers) |
| Primary accent | `#33ff33` | the workhorse color — borders, hard shadows, title-bar fills, primary values, links |
| Alert/highlight accent | `#ff00aa` (headings) / `#ff3fa8` (UI elements) | used **sparingly** — one highlighted value per card/section, never more |
| Body text | `#c9cbe8` | paragraph and label text |
| Dim/muted text | `#6d71a8` / `#8b8fc9` | secondary labels, category headers inside cards |
| Hero text | `#fff` | main title only |

Rule: magenta is a rare accent, not a second workhorse color. If a screen has magenta on more than one element, that's a sign it's being overused — pull it back to a single highlight.

**No blur, ever.** Every shadow in the system is a hard, zero-blur offset (`Npx Npx 0 color`), never `text-shadow`/`box-shadow` with a blur radius, and never a glow (`0 0 Npx`).

### Typography

- **Headings, nav, buttons, UI chrome:** `Press Start 2P` — unchanged from the current site, confirmed as the one thing that was already right ("FIRE"). Major headings get a hard offset drop-shadow: `text-shadow: 2px 2px 0 #ff00aa` (no blur — this is a pixel-art-sticker effect, not a glow, and is explicitly the one shadow effect Ryaan confirmed he likes).
- **Body/UI text:** `Jersey 15` — replaces the previous plain `monospace` fallback (which wasn't a real chosen font, just whatever mono the visitor's OS happened to have). This was chosen after two full rounds of rejected alternatives — recording the rejections so they aren't re-litigated during implementation:
  - Rejected as "too software-engineer," not gamey: JetBrains Mono, IBM Plex Mono, Space Mono.
  - Rejected as "too straight/too retro" (spindly old-CRT dot-matrix): VT323.
  - Rejected as "too rounded" (soft modern-indie): Pixelify Sans.
  - Also considered and passed over in the same round as Jersey 15: Silkscreen, DotGothic16.
  - **Jersey 15 is the confirmed choice** — blocky/geometric like Press Start 2P's spirit, no rounding, more substantial than VT323, reads as "game console" rather than "code editor."

### Card shell — "Hard-Shadow Sticker"

The one validated container pattern, used wherever the design calls for a bounded card/panel (status cards, skill category cards, etc.):

```css
.card {
  background: #101233;
  border: 1px solid #33ff33;
  box-shadow: 4px 4px 0 rgba(51, 255, 51, 0.35); /* hard, zero blur */
}
.card .titlebar {
  background: #33ff33;
  color: #0b0c2a;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem; /* scale per context */
  padding: 8px 12px;
}
.card .body {
  padding: 12px 14px 14px;
  font-family: 'Jersey 15', monospace;
  color: #c9cbe8;
}
```

Rejected alternative shells (kept here for reference in case revisited later): "Notched HUD Panel" (diagonal clip-path corners), "Bracket Corners" (open corner-bracket/reticle style, no fill or border). Both dropped in favor of the Hard-Shadow Sticker, which ties the card language directly to the one shadow effect already confirmed on headings.

### The no-dead-space rule (critical — this caused every layout bug found during design)

Every "too much empty space" issue found while designing this system had the same root cause: **something was sized by its container instead of by its own content.** Concretely:

- Never use `justify-content: space-between` for a label/value pair — it stretches to fill 100% of whatever width is available, which reads as a huge, unintentional gap the moment the container is wider than the text. Use a two-column `grid-template-columns: max-content max-content` with a small fixed `gap` (14–16px) instead — this keeps label and value close together and, critically, keeps values aligned in a column when several rows stack in the same card.
- Never let a `1fr` grid column dictate a card's width — `1fr` divides the *entire available row width* equally, so even the widest-content card in a row can end up mostly empty space on a wide viewport. When multiple cards need to match each other's width, size them with an explicit fixed width chosen to comfortably fit the widest one's real content, and let the *row* hug that total width (`display:flex; justify-content:center` or `width:fit-content; margin:auto`) rather than stretching edge-to-edge.
- Standalone content-light elements (a short contact readout, a handful of table rows) should be sized to their own content (`display:inline-block`, `max-width` capped to what the content needs) rather than stretching to fill their section's full width.
- Content that can grow without bound (skill lists, tags) belongs inside a bounded card with **wrapping** chips (`flex-wrap: wrap`, small fixed-size chips), never a one-item-per-line list — a list grows into a "wall of text" as items are added; wrapped chips just add another row inside the same card.

Apply this rule when building the pages/sections that weren't individually walked through during design (see below) — it's the single most important lesson from this pass, more important than any specific component's exact styling.

## Page-by-page direction

Ryaan was explicit that every page should be designed around what it actually needs — nothing here is a template to be stamped across pages that weren't built for it.

### About page (`about.html`) — fully validated

- **Header:** name (Press Start 2P + hard shadow), tagline in Jersey 15, 3 quick-stat pill chips below (age, school, "coding since").
- **Quick-jump pills:** styled like tabs (Press Start 2P, small caps, green underline when active) but function as scroll anchors to page sections — **not** hide/show panels. Ryaan explicitly rejected a tabbed/panel-hiding layout as "too limiting"; the pill styling is purely visual, borrowed from that rejected direction.
- **Introduction:** pull-quote treatment — Jersey 15 at a larger size, magenta left border, not boxed.
- **Skills & Technologies:** 2×2 grid of bounded category cards (Programming / Game Development / Robotics & Hardware / Tools & Software). Inside each card, items are small wrapping chips (not pills with heavy borders, not one-per-line lists) so adding more skills later just wraps to another row instead of growing the card into a wall of text.
- **MUN Experience:** table-style rows (Event / Committee / Result), capped to a max-width around 480px so it doesn't stretch into dead space on wide viewports — same no-dead-space rule as everywhere else.
- **Contact:** terminal-readout style (dark fill, green border, monospace-ish Jersey 15 text), sized to its own content (`inline-block`), not stretched full-width. Phone number stays; email and GitHub link included.
- **Education, Hobbies & Interests, Goals & Ambitions, Age Tracker:** not individually redesigned during this session — apply the general design system (palette, type, no-dead-space rule, card shell where a boxed treatment fits) when implementing. The existing Goals checklist styling is reasonably solid already; carry its spirit forward rather than reinventing it. Age tracker JS logic is untouched — only its visual skin updates.

### Homepage (`index.html`) — hero and status cards validated; rest is not

Ryaan was explicit: **the homepage is personality only.** Real technical specs (CPU/RAM/GPU-type content) belong on the About page, not here.

- **Hero:** title + dog + subtitle, centered, same anatomy as today.
- **Status cards:** three independent Hard-Shadow Sticker cards — `PROJECT STATUS`, `YES`, `ENVIRONMENT`. The original fourth box, `SYSTEM STATUS` (hardware specs), is **removed entirely** — that content is superseded by real specs Ryaan plans to add to the About page later. Cards are equal fixed width (sized to comfortably fit the longest content, currently the Project Status card), laid out as a centered row that hugs its own total width rather than stretching across the page. Label/value pairs inside each card use the aligned two-column grid from the no-dead-space rule, not a stretched space-between row.
- **Bio + cat roulette, "THIS MIGHT BE TRUE" fun-facts terminal block, easter egg trigger UI:** **not visually validated this session.** Apply the design system directly — palette, Jersey 15 body text, the card shell where a boxed/paneled treatment makes sense, and the no-dead-space rule throughout. Since these weren't walked through with mockups, flag them back to Ryaan for a look once built rather than treating them as silently pre-approved.
- **Easter eggs:** keep the existing keyword-trigger mechanism and content as-is functionally; only the audio eager-load bug (see Bugs, #5) changes. Turning them into interactive (non-text) components is explicitly phase 2.

### Projects page (`projects.html`) and project detail pages — not visually validated

Ryaan was explicit that these need their own treatment, not a reuse of About's or the homepage's specific components. `projects.html` is fundamentally a card gallery; the project detail pages (`atomica.html`, `gorilla-warfare.html`, `graphorama.html`, `shitbox.html`) are long-form article content. Neither needs the structural rethink About needed (About's problem was "unorganized single scroll of disparate content"; the projects pages are already a reasonably appropriate shape for what they contain).

Apply during implementation: the shared design system (palette, typography, card shell where boxes are used, no-dead-space rule), refining the existing grid-of-cards and article layouts rather than reinventing their structure. Flag specific choices back to Ryaan for review once built, same as the un-mocked-up homepage sections.

## Open items for implementation

- Confirm the real GitHub URL for the Atomica project page (bug #3) before shipping.
- The exact fixed pixel width for the homepage status cards, and the exact max-width for the About page's MUN table, were chosen by eye during mockups (`230px` and `~480px` respectively) — treat these as starting points to fine-tune against real rendered text, not exact specs.
