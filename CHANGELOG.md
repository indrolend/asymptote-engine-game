# Changelog

All notable changes to **asymptote-engine-game** are documented here.

---

## [Unreleased]

### Changed (this session — restore first-version aesthetic)
- **`src/styles/style.css`** — Restored the first-version purple/indigo colour palette
  (`--color-accent: #6c63ff`, `--color-bg: #0d0d1a`, `--color-surface: #161628`, etc.)
  while retaining the new-version SPA design system additions and mobile improvements.
  - Typography reverted to `'Segoe UI', system-ui, sans-serif` (main) and
    `'Courier New', monospace` (mono) — matching the MVP.
  - `.stat-chip` restored to pill shape (`border-radius: 20px`) with larger fonts and
    monospace values, as in the MVP.
  - `#header` padding/gap/font-size restored to MVP proportions.
  - Progress bar height restored to 8 px.
  - `#game-area` background restored to subtle purple radial glow.
  - `#game-area::before` purple CSS grid overlay restored (40 px grid, accent lines at
    5 % opacity).
  - `.target` restored to purple gradient (`#8b85ff → #6c63ff`) with matching glow.
  - Upgrade button cost restored to gold (`var(--color-reward)`) with lime when
    affordable (`#a3e635`), hover/active backgrounds updated to purple tint.
  - Fact modal restored to 2 px border, 32 px padding, and purple glow.
  - All hardcoded greens in the SPA design system section updated to purple equivalents
    (`.engine-hero`, `.core-dot`, `.hero-action`, `.hero--dim .core-dot`).
- **`src/main.js`** — Engine background canvas dot colour updated from green
  (`[94, 232, 125]`) to purple (`[108, 99, 255]`) to match the restored palette.

### Added (previous session)
- **`src/utils.js`** — `addActivationHandler` (fast-tap, no 300ms delay) + `debounce`
- **`src/slingshot.js`** — pure ES module port of `slingshotGesture.js`
- **`src/particle-transition.js`** — pure ES module port of `particleTransitionEngine.js`

### Changed (previous session)
- **`src/targets.js`** — Target tap handler now uses `addActivationHandler`
- **`src/ui.js`** — Upgrade and consumable buttons use `addActivationHandler`
- **`src/upgrades.js`** — Fact popup close button uses `addActivationHandler`

### Added (earlier session)
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
