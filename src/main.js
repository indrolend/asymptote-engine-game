// main.js — Game initialization and main loop

import { gameState, applyPassiveTick } from './game-state.js';
import { updateUI } from './ui.js';
import { startSpawning } from './targets.js';

// ─── Engine Background Canvas ─────────────────────────────────────────────────
// Draws a subtle animated asymptote curve (y = −1/x, Q2) with orbiting
// particles behind the game targets — mirroring the visual signature of the
// precursor SPA design.

const _ANIM_AR  = [108, 99, 255]; // accent purple #6c63ff
const _DOT_N    = 22;
const _DOT_R    = 3.5;
const _GLOW_R   = 9;
const _CYCLE_MS = 4000;
const _SEQ_MS   = 2600;
const _HOLD_MS  = 3200;
const _RANGE    = 3.5;
const _BG_OPACITY_SCALE = 0.28; // keep background dots subtle so targets stay readable

// Pre-compute Q2 curve points: x ∈ [−3.2, −0.3], y = −1/x
const _ANIM_DOTS = (function () {
  const d = [];
  for (let i = 0; i < _DOT_N; i++) {
    const t   = i / (_DOT_N - 1);
    const mag = Math.exp(Math.log(3.2) + (Math.log(0.3) - Math.log(3.2)) * t);
    d.push({ cx: -mag, cy: 1 / mag });
  }
  return d;
}());

function _drawEngineBg(ctx, cssW, cssH, wallMs) {
  ctx.clearRect(0, 0, cssW, cssH);

  const padL = 18, padR = 36, padT = 18, padB = 32;
  const plotW = cssW - padL - padR;
  const plotH = cssH - padT - padB;
  const sx    = plotW / _RANGE;
  const sy    = plotH / _RANGE;
  const ox    = cssW - padR;
  const oy    = cssH - padB;
  const canX  = cx => padL + (cx + _RANGE) * sx;
  const canY  = cy => (cssH - padB) - cy * sy;

  // Axes — very faint
  ctx.strokeStyle = 'rgba(94, 232, 125, 0.06)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, padT); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(padL, oy); ctx.stroke();

  // Animated asymptote dots cycling left→right
  const eFrac    = (wallMs % _CYCLE_MS) / _CYCLE_MS;
  const seqFrac  = _SEQ_MS  / _CYCLE_MS;
  const holdFrac = _HOLD_MS / _CYCLE_MS;
  const slotFrac = seqFrac  / (_DOT_N - 1);
  const [ar0, ar1, ar2] = _ANIM_AR;

  for (let i = 0; i < _DOT_N; i++) {
    const activateAt = (i / (_DOT_N - 1)) * seqFrac;
    let opacity;
    if (eFrac < activateAt) {
      opacity = 0;
    } else if (eFrac < holdFrac) {
      opacity = Math.min(1, (eFrac - activateAt) / Math.max(slotFrac * 0.55, 0.001));
    } else {
      opacity = Math.max(0, 1 - (eFrac - holdFrac) / (1 - holdFrac));
    }
    if (opacity <= 0.01) continue;

    // Scale opacity down so dots don't overwhelm the game area
    const a = opacity * _BG_OPACITY_SCALE;
    const px = canX(_ANIM_DOTS[i].cx);
    const py = canY(_ANIM_DOTS[i].cy);
    if (py < -_GLOW_R || py > cssH + _GLOW_R || px < -_GLOW_R || px > cssW + _GLOW_R) continue;

    const grd = ctx.createRadialGradient(px, py, 0, px, py, _GLOW_R);
    grd.addColorStop(0, `rgba(${ar0},${ar1},${ar2},${a * 0.7})`);
    grd.addColorStop(1, `rgba(${ar0},${ar1},${ar2},0)`);
    ctx.beginPath(); ctx.arc(px, py, _GLOW_R, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();

    ctx.beginPath(); ctx.arc(px, py, _DOT_R, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ar0},${ar1},${ar2},${a})`; ctx.fill();
  }
}

let _bgFrameId = null;

function startEngineBackground() {
  const canvas = document.getElementById('engine-bg');
  if (!canvas || !canvas.getContext) return;

  function frame() {
    _bgFrameId = requestAnimationFrame(frame);
    const rect  = canvas.getBoundingClientRect();
    const dpr   = window.devicePixelRatio || 1;
    const cssW  = Math.round(rect.width);
    const cssH  = Math.round(rect.height);
    if (cssW < 10 || cssH < 10) return;
    const physW = Math.round(cssW * dpr);
    const physH = Math.round(cssH * dpr);
    if (canvas.width !== physW || canvas.height !== physH) {
      canvas.width  = physW;
      canvas.height = physH;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    _drawEngineBg(ctx, cssW, cssH, performance.now());
  }

  _bgFrameId = requestAnimationFrame(frame);
}

// ─── Game Loop ────────────────────────────────────────────────────────────────

let lastTick = 0;
const TICK_INTERVAL = 1000; // 1 second ticks for passive gain

function gameTick(timestamp) {
  if (!gameState.gameRunning) return;

  if (timestamp - lastTick >= TICK_INTERVAL) {
    lastTick = timestamp;
    applyPassiveTick();
    updateUI();
  }

  requestAnimationFrame(gameTick);
}

// ─── Initialization ───────────────────────────────────────────────────────────

function init() {
  // Start engine background canvas animation
  startEngineBackground();

  // Start the animation/game loop
  requestAnimationFrame(gameTick);

  // Start spawning targets
  startSpawning();

  // Initial UI render
  updateUI();

  // Welcome message
  const gameArea = document.getElementById('game-area');
  if (gameArea) {
    const hint = document.createElement('div');
    hint.className = 'hint-message';
    hint.textContent = 'Click the targets to approach the asymptote.';
    gameArea.appendChild(hint);
    setTimeout(() => hint.classList.add('fade-out'), 3000);
    hint.addEventListener('transitionend', () => hint.remove());
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
