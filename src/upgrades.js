// upgrades.js — Upgrades, substances, and consumables

import { gameState, getEffectiveFactDuration } from './game-state.js';
import { playUpgradeSound, playErrorSound, playSubstanceSound, playWearOffSound, playFactSound, playFactDismissSound } from './audio.js';
import { updateUI, showActiveEffect, removeActiveEffect, applyWeedVisual, clearWeedVisual, applyAdderallVisual, clearAdderallVisual, applyAlcoholVisual, clearAlcoholVisual } from './ui.js';
import { restartSpawning } from './targets.js';
import { addActivationHandler } from './utils.js';

// ─── Regular Upgrades ────────────────────────────────────────────────────────

export const upgrades = [
  {
    id: 'click_rate_1',
    name: 'Sharper Focus',
    description: 'Increase click effectiveness by 50%.',
    baseCost: 50,
    maxLevel: 5,
    apply(level) {
      gameState.clickRate *= 1.5;
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(2, level)); },
  },
  {
    id: 'passive_boost_1',
    name: 'Background Thinking',
    description: 'Boost passive understanding rate.',
    baseCost: 75,
    maxLevel: 5,
    apply(level) {
      gameState.passiveRate *= 1.8;
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(2.2, level)); },
  },
  {
    id: 'faster_spawn',
    name: 'Heightened Awareness',
    description: 'Targets spawn more frequently.',
    baseCost: 100,
    maxLevel: 4,
    apply(level) {
      gameState.spawnInterval = Math.max(500, gameState.spawnInterval - 300);
      restartSpawning();
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(2.5, level)); },
  },
  {
    id: 'longer_lifetime',
    name: 'Expanded Attention Span',
    description: 'Targets last longer before expiring.',
    baseCost: 80,
    maxLevel: 4,
    apply(level) {
      gameState.targetLifetime += 1000;
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(1.8, level)); },
  },
  {
    id: 'understanding_per_click',
    name: 'Deep Insights',
    description: 'Each click grants more understanding.',
    baseCost: 60,
    maxLevel: 6,
    apply(level) {
      gameState.understandingPerClick += 5;
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(1.9, level)); },
  },
  {
    id: 'faster_facts',
    name: 'Speed Reader',
    description: 'Reduce the fact close timer by 30%.',
    baseCost: 120,
    maxLevel: 3,
    apply(level) {
      gameState.factDurationMultiplier *= 0.7;
    },
    costAt(level) { return Math.floor(this.baseCost * Math.pow(2.8, level)); },
  },
];

// Track upgrade levels
const upgradeLevels = {};
upgrades.forEach(u => { upgradeLevels[u.id] = 0; });

export function getUpgradeLevel(id) {
  return upgradeLevels[id] || 0;
}

export function buyUpgrade(id) {
  const upgrade = upgrades.find(u => u.id === id);
  if (!upgrade) return;

  const level = upgradeLevels[id];
  if (level >= upgrade.maxLevel) return;

  let cost = upgrade.costAt(level);
  // Alcohol discount
  if (gameState.modifiers.alcohol > 0) cost = Math.floor(cost * 0.6);

  const totalUnderstanding = gameState.understanding + gameState.pseudoUnderstanding;
  if (totalUnderstanding < cost) {
    playErrorSound();
    return;
  }

  // Spend pseudo first, then real
  const fromPseudo = Math.min(gameState.pseudoUnderstanding, cost);
  gameState.pseudoUnderstanding -= fromPseudo;
  gameState.understanding -= (cost - fromPseudo);

  upgrade.apply(level);
  upgradeLevels[id]++;

  if (gameState.modifiers.adderall > 0) {
    gameState.adderallActionCount++;
  }

  playUpgradeSound();
  updateUI();
}

// ─── Substances ───────────────────────────────────────────────────────────────

let substanceIntervals = {};

function startSubstanceTick(name, onExpire) {
  if (substanceIntervals[name]) {
    clearInterval(substanceIntervals[name]);
  }
  substanceIntervals[name] = setInterval(() => {
    if (gameState.modifiers[name] <= 0) {
      clearInterval(substanceIntervals[name]);
      substanceIntervals[name] = null;
      onExpire();
      return;
    }
    gameState.modifiers[name] -= 1;
    updateUI();
  }, 1000);
}

// ── Weed ──────────────────────────────────────────────────────────────────────

export const weedItem = {
  id: 'weed',
  name: '🌿 Weed',
  description: 'Gain pseudo-understanding. Time passes faster. When it wears off... clarity returns (painfully).',
  getCost() {
    return Math.floor(gameState.understandingRate * 15 + 30);
  },
};

export function buyWeed() {
  if (gameState.modifiers.weed > 0) return; // already active
  const cost = weedItem.getCost();
  if (gameState.understanding < cost) { playErrorSound(); return; }

  gameState.understanding -= cost;
  gameState.modifiers.weed = 30; // 30 seconds
  gameState.pseudoUnderstanding += 60; // Fake boost
  gameState.timeMultiplier = 0.6; // Time passes faster

  playSubstanceSound();
  applyWeedVisual();
  showActiveEffect('weed', '🌿 Weed', gameState.modifiers.weed);

  startSubstanceTick('weed', onWeedWearOff);
  updateUI();
}

function onWeedWearOff() {
  // Pseudo understanding evaporates
  gameState.pseudoUnderstanding = 0;
  // Distance regression penalty
  gameState.distance = Math.min(100, gameState.distance + 8);
  gameState.timeMultiplier = 1.0;

  clearWeedVisual();
  removeActiveEffect('weed');
  playWearOffSound();
  showWearOffMessage('🌿 Weed wore off. Pseudo-understanding gone. The asymptote seems further away...');
  updateUI();
}

// ── Adderall ──────────────────────────────────────────────────────────────────

export const adderallItem = {
  id: 'adderall',
  name: '💊 Adderall',
  description: 'Boost click rate & passive gain. Time feels slower. But inaction causes regression. Sold in packs of 3.',
  getCost() {
    return Math.floor(gameState.understandingRate * 25 + 80);
  },
};

export function buyAdderall() {
  if (gameState.modifiers.adderall > 0) return; // already active
  const cost = adderallItem.getCost();
  // Must buy 3 at a time (pack)
  const totalCost = cost * 3;
  if (gameState.understanding < totalCost) { playErrorSound(); return; }

  gameState.understanding -= totalCost;
  gameState.modifiers.adderall = 40; // 40 seconds
  gameState.adderallActiveTime = 40;
  gameState.adderallActionCount = 0;
  gameState.clickRate *= 2.0;
  gameState.passiveRate *= 2.0;
  gameState.timeMultiplier = 1.5; // Time feels slower

  playSubstanceSound();
  applyAdderallVisual();
  showActiveEffect('adderall', '💊 Adderall', gameState.modifiers.adderall);

  startSubstanceTick('adderall', onAdderallWearOff);
  updateUI();
}

function onAdderallWearOff() {
  // Undo boosts
  gameState.clickRate /= 2.0;
  gameState.passiveRate /= 2.0;
  gameState.timeMultiplier = 1.0;

  clearAdderallVisual();
  removeActiveEffect('adderall');
  playWearOffSound();

  // If no actions were taken, apply regression
  if (gameState.adderallActionCount === 0) {
    const regression = gameState.adderallActiveTime * 0.5;
    gameState.distance = Math.min(100, gameState.distance + regression);
    showWearOffMessage(`💊 Adderall wore off. No actions taken — understanding regressed by ${regression.toFixed(1)}!`);
  } else {
    showWearOffMessage(`💊 Adderall wore off. ${gameState.adderallActionCount} actions taken — you stayed focused.`);
  }
  updateUI();
}

// ── Alcohol ───────────────────────────────────────────────────────────────────

export const alcoholItem = {
  id: 'alcohol',
  name: '🍺 Alcohol',
  description: 'Upgrades cost 40% less for 25s. Unlocks wild temporary upgrades. Time becomes... unpredictable.',
  getCost() {
    return Math.floor(gameState.understandingRate * 10 + 40);
  },
};

export function buyAlcohol() {
  if (gameState.modifiers.alcohol > 0) return;
  const cost = alcoholItem.getCost();
  if (gameState.understanding < cost) { playErrorSound(); return; }

  gameState.understanding -= cost;
  gameState.modifiers.alcohol = 25;
  gameState.alcoholUnlockActive = true;
  gameState.timeMultiplier = 0.5 + Math.random() * 1.5; // Wobble

  playSubstanceSound();
  applyAlcoholVisual();
  showActiveEffect('alcohol', '🍺 Alcohol', gameState.modifiers.alcohol);

  startSubstanceTick('alcohol', onAlcoholWearOff);
  updateUI();
}

function onAlcoholWearOff() {
  gameState.alcoholUnlockActive = false;
  gameState.timeMultiplier = 1.0;

  clearAlcoholVisual();
  removeActiveEffect('alcohol');
  playWearOffSound();
  showWearOffMessage('🍺 Alcohol wore off. The deals are gone. Temporary unlocks revoked.');
  updateUI();
}

// ── Alcohol exclusive upgrade (only available while drunk) ────────────────────

export const alcoholUpgrade = {
  id: 'unstable_chaos',
  name: '🔥 Unstable Chaos',
  description: '[ALCOHOL ONLY] Double spawn rate for 20s. Extremely chaotic.',
  getCost() { return Math.floor(50 * 0.6); }, // Always discounted while active
};

export function buyUnstableChaos() {
  if (!gameState.alcoholUnlockActive) { playErrorSound(); return; }
  const cost = alcoholUpgrade.getCost();
  if (gameState.understanding < cost) { playErrorSound(); return; }

  gameState.understanding -= cost;
  gameState.spawnInterval = Math.max(300, Math.floor(gameState.spawnInterval / 2));
  restartSpawning();

  playUpgradeSound();
  showWearOffMessage('🔥 Chaos mode activated! Targets spawning like mad!');
  updateUI();
}

// ─── Random Fact Buyable ─────────────────────────────────────────────────────

const randomFacts = [
  "The shortest war in history lasted 38 minutes. Kind of like your attention span.",
  "Understanding doesn't come for free — and neither does reading this fact.",
  "This popup is actively reducing your clicks-per-minute to zero. Enjoy.",
  "Everything on the internet is 100% true, including this message.",
  "The asymptote is watching you struggle from a safe distance.",
  "Studies show that reading random facts increases perceived productivity by 0%.",
  "You paid for this interruption. Sit with that for a moment.",
  "The word 'asymptote' comes from Greek meaning 'not falling together.' You are not falling together.",
  "The human brain can only focus for ~25 minutes. This popup is not helping.",
  "Honey never spoils. Your understanding, however, might.",
  "Did you know? This fact could have been an email.",
  "Cogito ergo sum. You think, therefore you are losing distance-to-asymptote time.",
  "The average person spends 6 years of their life dreaming. You're spending yours here.",
  "There are more possible iterations of a game of chess than atoms in the observable universe. You're playing neither.",
  "Random fact: this is a randomly selected fact. Meta.",
];

export const randomFactItem = {
  id: 'random_fact',
  name: '📚 Read a Random Fact',
  description: 'Gain... wisdom? Costs 10x your current understanding rate. Blocks all actions.',
  getCost() {
    return Math.max(20, Math.floor(gameState.understandingRate * 10));
  },
};

export function buyRandomFact() {
  if (gameState.factActive) return;
  const cost = randomFactItem.getCost();
  if (gameState.understanding < cost) { playErrorSound(); return; }

  gameState.understanding -= cost;
  gameState.factActive = true;

  const fact = randomFacts[Math.floor(Math.random() * randomFacts.length)];
  const duration = getEffectiveFactDuration();

  playFactSound();
  showFactPopup(fact, duration, () => {
    gameState.factActive = false;
    playFactDismissSound();
    updateUI();
  });
  updateUI();
}

function showFactPopup(fact, duration, onClose) {
  const overlay = document.createElement('div');
  overlay.id = 'fact-overlay';
  overlay.className = 'fact-overlay';

  overlay.innerHTML = `
    <div class="fact-modal">
      <div class="fact-header">📚 MANDATORY KNOWLEDGE ACQUISITION</div>
      <div class="fact-body">${fact}</div>
      <div class="fact-footer">
        <span class="fact-note">All activities suspended. Sit with this.</span>
        <button id="fact-close-btn" disabled>Close (<span id="fact-timer">${duration}</span>s)</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  let remaining = duration;
  const interval = setInterval(() => {
    remaining--;
    const timerEl = document.getElementById('fact-timer');
    const btnEl = document.getElementById('fact-close-btn');
    if (timerEl) timerEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(interval);
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = 'Close (finally)';
      }
    }
  }, 1000);

  const closeBtn = document.getElementById('fact-close-btn');
  addActivationHandler(closeBtn, () => {
    if (closeBtn.disabled) return;
    clearInterval(interval);
    overlay.remove();
    onClose();
  });
}

function showWearOffMessage(msg) {
  const el = document.createElement('div');
  el.className = 'wear-off-message';
  el.textContent = msg;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
