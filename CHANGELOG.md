# Changelog

All notable changes to **asymptote-engine-game** are documented here.

---

## [Unreleased]

### Added
- **`src/utils.js`** — Shared interaction utilities ported from `basic-browser-spa`:
  - `addActivationHandler(element, handler)` — fast-tap helper that fires on
    `touchend` (no 300 ms synthetic-click delay on mobile) with an `onclick`
    fallback for mouse/keyboard. Respects the `disabled` attribute on form
    elements.
  - `debounce(fn, wait)` — standard debounce utility.
- **`src/slingshot.js`** — Pure ES module port of `js/spa/slingshotGesture.js`
  from `basic-browser-spa`. Unified pointer-event pull/drag interaction
  (`pointerdown → pointermove → pointerup`). No SPA dependencies; ready to
  wire into any element. API: `initSlingshot(element, callbacks) → { destroy }`.
- **`src/particle-transition.js`** — Pure ES module port of
  `js/spa/particleTransitionEngine.js` from `basic-browser-spa`. Canvas-based
  explode → reform particle transition engine.
  Exports `transition(fromCanvas, toCanvas, options, onComplete)` and
  `transitionFromPull(pulledParticles, toRegion, ctx, options, onComplete)`.

### Changed
- **`src/targets.js`** — Target tap handler now uses `addActivationHandler`
  instead of a raw `click` listener, eliminating the 300 ms touch delay on
  mobile devices. The floating reward position now uses the target's CSS
  coordinates rather than the pointer event position (consistent across both
  touch and mouse).
- **`src/ui.js`** — Upgrade and consumable button creation now uses
  `addActivationHandler` for all interactive buttons (upgrade, consumable,
  unstable chaos), improving mobile tap responsiveness.
- **`src/upgrades.js`** — Fact popup close button now uses
  `addActivationHandler`, giving immediate response on mobile while still
  respecting the `disabled` state during the countdown.

### Added (previous session)
- **Design system CSS migration from `indrolend/basic-browser-spa`**
  - Created `src/styles/style.css` as the new canonical stylesheet, replacing
    the previous `src/styles/animations.css`.
  - Ported and adapted all relevant design-system rules from `style.css` in the
    `basic-browser-spa` repository, including:
    - CSS custom properties: added `--panel`, `--panel-active`, `--bg`, `--fg`,
      `--accent` aliases alongside the existing `--color-*` tokens for
      design-system portability.
    - `touch-action: manipulation` on `html` and `body` for improved mobile
      tap responsiveness.
    - `min-height: 100svh` (small-viewport-height) support on `body` and
      `#app` grid container for correct mobile browser behaviour.
    - **`.nav-btn`** — reusable navigation/action button (adapted from
      `.spa-nav-btn`), with `.exit-btn` modifier.
    - **`.nav-dots` / `.nav-dot`** — dot-indicator row and individual dot
      (adapted from `#spa-dots` / `.spa-dot`).
    - **`.hero` variants** — centred hero display areas (`.hero`, `.hero--text`,
      `.hero--linkable`, `.hero-text`, `.hero-subtext`, `.hero-image`,
      `.hero-gif`), adapted from `.spa-hero*` classes.
    - **`.hero--dim`** — low-affordance dim state for hero cards.
    - **`.stats-bar` / `.stats-bar-stat` / `.stats-bar-label`** — compact
      full-width stats row (adapted from `.asy-stats-bar`).
    - **`.engine-hero`** — engine display container with characteristic radial
      gradient and glow border (adapted from `.asy-engine-hero`).
    - **`.engine-bg`** — canvas layer inside `.engine-hero` (adapted from
      `.asy-engine-bg`).
    - **`.core-dot`** — primary clickable engine dot button with glow box-shadow
      (adapted from `.asy-core-dot`).
    - **`.engine-hint`** — decorative hint label beneath the core dot (adapted
      from `.asy-engine-hint`).
    - **`.item-hero`** — item/card container for generators and upgrades
      (adapted from `.asy-item-hero`).
    - **`.motif`** — pixel-art motif canvas block (adapted from `.asy-motif`).
    - **`.hero-stat`** / **`.hero-action`** — prominent stat label and circular
      action button inside item cards (adapted from `.asy-hero-stat` /
      `.asy-hero-action`).
    - **`#transition-canvas`** — stub rule for the particle transition engine
      if/when ported.
    - Additional responsive breakpoint at `768px` for nav-btn and hero classes.
  - Updated `#game-area` background to the improved deep-green radial gradient
    from the SPA engine hero for visual consistency.
  - Updated `index.html` to reference `src/styles/style.css`.
  - All `.spa-` prefix classes and `.asy-` prefix classes have been
    removed/remapped; no SPA-specific selectors (`#spa-*`) have been carried
    over — selectors are aligned to this repo's standalone DOM structure.
  - Existing mechanics-specific and gameplay CSS (targets, upgrade buttons, fact
    overlay, substance visual effects, active-effects bar, etc.) is fully
    preserved and unchanged.
