// audio.js — Web Audio API sound effects (no external files needed)

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, type, duration, gainVal, startDelay = 0) {
  try {
    const ctx = getCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);

    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime + startDelay);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + startDelay + duration
    );

    oscillator.start(ctx.currentTime + startDelay);
    oscillator.stop(ctx.currentTime + startDelay + duration);
  } catch (e) {
    // Audio not supported or blocked — silently skip
  }
}

/** Short pop when clicking a target. */
export function playClickSound() {
  playTone(440, 'sine', 0.08, 0.3);
  playTone(660, 'sine', 0.06, 0.2, 0.04);
}

/** Satisfying chime when buying an upgrade. */
export function playUpgradeSound() {
  playTone(523, 'triangle', 0.12, 0.25);
  playTone(659, 'triangle', 0.12, 0.2, 0.1);
  playTone(784, 'triangle', 0.15, 0.2, 0.2);
}

/** Warn tone when a target expires without being clicked. */
export function playExpireSound() {
  playTone(200, 'sawtooth', 0.1, 0.1);
}

/** Substance activation — spacey whoosh. */
export function playSubstanceSound() {
  playTone(300, 'sine', 0.3, 0.2);
  playTone(150, 'sine', 0.4, 0.15, 0.15);
}

/** Substance wore off — descending tones. */
export function playWearOffSound() {
  playTone(400, 'triangle', 0.15, 0.2);
  playTone(300, 'triangle', 0.15, 0.15, 0.12);
  playTone(200, 'triangle', 0.2, 0.1, 0.24);
}

/** Alert / fact popup appears. */
export function playFactSound() {
  playTone(800, 'square', 0.06, 0.15);
  playTone(400, 'square', 0.1, 0.1, 0.07);
}

/** Fact dismissed. */
export function playFactDismissSound() {
  playTone(600, 'sine', 0.1, 0.2);
  playTone(800, 'sine', 0.12, 0.15, 0.08);
}

/** Error / can't afford. */
export function playErrorSound() {
  playTone(150, 'sawtooth', 0.12, 0.15);
}
