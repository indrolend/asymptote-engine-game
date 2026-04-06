// targets.js — Target spawning, expiry, and click handling

import { gameState, applyClick } from './game-state.js';
import { playClickSound, playExpireSound } from './audio.js';
import { updateUI } from './ui.js';

let spawnTimer = null;

/**
 * Show floating reward text at the click location.
 */
function showFloatingReward(x, y, text) {
  const el = document.createElement('div');
  el.className = 'floating-reward';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.getElementById('game-area').appendChild(el);
  // Remove after animation completes
  el.addEventListener('animationend', () => el.remove());
}

/**
 * Spawn a single clickable target in the game area.
 */
export function spawnTarget() {
  if (gameState.factActive) return; // Don't spawn during fact popups

  const gameArea = document.getElementById('game-area');
  const areaRect = gameArea.getBoundingClientRect();

  const target = document.createElement('div');
  target.className = 'target';

  // Random position (keep within bounds with padding)
  const padX = 50, padY = 50;
  const maxX = (areaRect.width || 600) - padX;
  const maxY = (areaRect.height || 400) - padY;
  target.style.left = Math.max(5, Math.floor(Math.random() * maxX)) + 'px';
  target.style.top = Math.max(5, Math.floor(Math.random() * maxY)) + 'px';

  // Lifetime adjusted by time multiplier
  const lifetime = gameState.targetLifetime * gameState.timeMultiplier;
  target.style.animationDuration = lifetime + 'ms';

  let clicked = false;

  target.addEventListener('click', (e) => {
    if (clicked || gameState.factActive) return;
    clicked = true;

    const result = applyClick();
    if (!result) return;

    playClickSound();

    // Spawn floating reward at click position relative to game area
    const rect = gameArea.getBoundingClientRect();
    showFloatingReward(
      e.clientX - rect.left,
      e.clientY - rect.top,
      `+${result.earned} 🧠`
    );

    // Click animation
    target.classList.add('clicked');
    setTimeout(() => target.remove(), 200);

    updateUI();
  });

  // Auto-remove when lifetime expires
  const expireTimer = setTimeout(() => {
    if (!clicked) {
      target.classList.add('expired');
      playExpireSound();
      setTimeout(() => target.remove(), 400);
    }
  }, lifetime);

  // Store timer ref on element so we can cancel if needed
  target._expireTimer = expireTimer;

  gameArea.appendChild(target);
}

/**
 * Start the target spawning loop.
 */
export function startSpawning() {
  stopSpawning();
  spawnTimer = setInterval(() => {
    spawnTarget();
  }, gameState.spawnInterval);
}

/**
 * Stop the spawning loop (call when respawning with new interval).
 */
export function stopSpawning() {
  if (spawnTimer !== null) {
    clearInterval(spawnTimer);
    spawnTimer = null;
  }
}

/**
 * Restart spawning with the current spawnInterval (after upgrades).
 */
export function restartSpawning() {
  stopSpawning();
  startSpawning();
}

/**
 * Remove all active targets from the game area.
 */
export function clearAllTargets() {
  document.querySelectorAll('#game-area .target').forEach(t => {
    clearTimeout(t._expireTimer);
    t.remove();
  });
}
