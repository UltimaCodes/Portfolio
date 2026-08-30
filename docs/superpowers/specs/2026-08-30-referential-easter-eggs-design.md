# Referential easter eggs: design

Replaces the "type a keyword, get a toast" pattern for the game references
with real, integrated mechanics, following the Devourer of Gods dog as the
model: a genuine interaction shaped like the source material, not a popup
that name-drops it. Approved in conversation 2026-08-30, written up for the
record before implementation, not as a blocking review gate.

## Scope

Five new persistent, sitewide fixtures. Small buttons/counters that are
always visible (not hidden behind a secret you have to already know),
living as a row bottom-left, mirroring the existing secrets badge
bottom-right.

All original/CSS-drawn assets, no ripped sprites or copyrighted art, both
because that's a real legal line and because it wouldn't fit this site's
own hard-shadow pixel-art system anyway.

## The five

**Save Point** (Undertale/Deltarune, shared mechanic across both). A star
fixture. Click plays a flash and an original determination-styled line in
the site's existing glitch-text treatment, then marks itself found.
Replaces the `determination` and `spamton` keyword eggs outright.

**Parry** (Cuphead). A pink object spawns periodically during normal
browsing, sits idle, then does a distinct "flash" window, brief and
timed. Click during the flash: a white star-burst, a successful parry.
Click outside it, or don't click at all: it expires and the ring count
takes a hit. This is the one timing-based interaction on the site.

**Ring count** (Sonic). A persistent counter. Every time any easter egg
gets marked found anywhere on the site, it gains a ring, so the count
means something (how much of the site you've actually found), not a
number going up for its own sake. A missed parry scatters it, a burst of
rings flies out and fades, each briefly clickable to recover it, the same
grace period the games give you.

**Vision Mode** (Batman's Detective Vision, Assassin's Creed's Eagle
Vision, Spider-Man's Spidey-Sense, merged, since they're the same trick
three times). An eye fixture. Toggling it drops the page into a blue-orange
duotone (an SVG filter, not a CSS approximation) and reveals genuinely
hidden elements, opacity 0 outside vision mode, that don't exist anywhere
else: a small CS2 reference, a Marvel Rivals/Luna Snow reference, placed
contextually. It also highlights the other fixtures and known trigger
points with a hard-edged pulsing outline (solid rings, not a blur) while
active. The toggle itself is never hidden, what it shows you is.

**Ultrakill button**. The existing `ultrakill` keyword payload (the typed
MANKIND IS DEAD / BLOOD IS FUEL / HELL IS FULL sequence, the screen jitter,
the sound) is kept exactly as it looks and sounds, just re-triggered by a
V1-marked button fixture instead of a typed word. The keyword trigger is
removed. Since it becomes a sitewide fixture rather than a homepage-only
effect, the message display moves from a hardcoded `#ultrakill-container`
div into `easter-eggs.js`, building its own overlay on demand.

## Kept as-is

`dogger` stays a typed keyword (a friend reference, not a game one), not
converted to a fixture. Its terminal gets a visual pass regardless, a
title bar, a scanline texture matching the rest of the site's terminal
elements, and a blinking cursor reusing the existing `blink` keyframe,
since the current version is plain unstyled text on a box. `nanomachines`,
`jonkler`, and `matrix` are untouched, out of scope for this pass.

## Bug fix: audio on the dog's first automatic run

The dog eats the homepage title unprompted 5 seconds after load. Browsers
block audio before a genuine user gesture, so that first automatic run is
almost always silent, since nothing has required a click or keypress yet.
This reads as "audio doesn't work" even though every later trigger,
including the next scheduled run 45 seconds after, plays fine once
anything has been clicked or typed. Fix: the automatic cycle no longer
starts on a blind timer. It starts the first time the page's existing
audio-unlock listener (click or keydown, already wired for this) actually
fires, so the first run a visitor sees is never silent. All five new
fixtures are click-triggered by design, so this doesn't affect them, the
triggering click is itself what satisfies the browser.

## Tracker

The badge and checklist stay, just with better entries. `determination`
and `spamton` are removed from `ALL_EGGS`, `ultrakill`'s entry changes
from "type" to "click" phrasing, and `save-point`, `cuphead-parry`,
`sonic-rings`, `vision-mode`, `vision-cs2`, and `vision-luna` are added.
