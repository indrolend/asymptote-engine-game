// main.js — Game initialization and main loop

import { gameState, applyPassiveTick } from './game-state.js';
import { updateUI } from './ui.js';
import { startSpawning } from './targets.js';

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
