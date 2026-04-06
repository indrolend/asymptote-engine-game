// ui.js — User interface updates

import { gameState } from './game-state.js';
import { upgrades, getUpgradeLevel, weedItem, adderallItem, alcoholItem, randomFactItem, alcoholUpgrade } from './upgrades.js';
import { buyUpgrade, buyWeed, buyAdderall, buyAlcohol, buyRandomFact, buyUnstableChaos } from './upgrades.js';

// ─── Main UI Update ───────────────────────────────────────────────────────────

export function updateUI() {
  // Distance display
  const distEl = document.getElementById('distance-counter');
  if (distEl) {
    const d = gameState.distance;
    let display;
    if (d >= 10) display = d.toFixed(2);
    else if (d >= 1) display = d.toFixed(4);
    else display = d.toFixed(8);
    distEl.textContent = display;
  }

  // Understanding
  const uEl = document.getElementById('understanding-counter');
  if (uEl) uEl.textContent = Math.floor(gameState.understanding);

  // Pseudo understanding
  const pEl = document.getElementById('pseudo-counter');
  if (pEl) {
    const pseudo = Math.floor(gameState.pseudoUnderstanding);
    pEl.textContent = pseudo;
    pEl.parentElement.style.display = pseudo > 0 ? 'flex' : 'none';
  }

  // Progress bar: visual distance approach
  const bar = document.getElementById('progress-bar-fill');
  if (bar) {
    // Map distance 100→0 to 0→100% width
    const pct = Math.max(0, Math.min(100, 100 - gameState.distance));
    bar.style.width = pct + '%';
    // Color shifts as you get closer
    if (pct < 30) bar.style.background = 'var(--color-bar-early)';
    else if (pct < 60) bar.style.background = 'var(--color-bar-mid)';
    else if (pct < 85) bar.style.background = 'var(--color-bar-late)';
    else bar.style.background = 'var(--color-bar-max)';
  }

  // Stats
  const statsEl = document.getElementById('stats-display');
  if (statsEl) {
    statsEl.innerHTML = `
      <span>Clicks: ${gameState.totalClicks}</span>
      <span>Click Rate: ${gameState.clickRate.toFixed(2)}</span>
      <span>Passive: ${gameState.passiveRate.toFixed(4)}/s</span>
    `;
  }

  // Update substance timers
  updateActiveEffectsUI();

  // Upgrade buttons
  renderUpgradeButtons();
  renderConsumables();
}

// ─── Active Effects Bar ───────────────────────────────────────────────────────

const activeEffectEls = {};

export function showActiveEffect(id, label, duration) {
  const container = document.getElementById('active-effects');
  if (!container) return;

  let el = activeEffectEls[id];
  if (!el) {
    el = document.createElement('div');
    el.className = 'active-effect-badge';
    el.dataset.effectId = id;
    container.appendChild(el);
    activeEffectEls[id] = el;
  }
  el.innerHTML = `<span class="effect-label">${label}</span> <span class="effect-timer" id="effect-timer-${id}">${duration}s</span>`;
}

export function removeActiveEffect(id) {
  const el = activeEffectEls[id];
  if (el) {
    el.classList.add('fading');
    el.addEventListener('animationend', () => el.remove());
    delete activeEffectEls[id];
  }
}

function updateActiveEffectsUI() {
  ['weed', 'adderall', 'alcohol'].forEach(name => {
    const timerEl = document.getElementById(`effect-timer-${name}`);
    if (timerEl) {
      timerEl.textContent = gameState.modifiers[name] + 's';
    }
  });
}

// ─── Visual Effects ────────────────────────────────────────────────────────────

export function applyWeedVisual() {
  document.body.classList.add('weed-active');
}
export function clearWeedVisual() {
  document.body.classList.remove('weed-active');
}
export function applyAdderallVisual() {
  document.body.classList.add('adderall-active');
}
export function clearAdderallVisual() {
  document.body.classList.remove('adderall-active');
}
export function applyAlcoholVisual() {
  document.body.classList.add('alcohol-active');
}
export function clearAlcoholVisual() {
  document.body.classList.remove('alcohol-active');
}

// ─── Upgrade Buttons ──────────────────────────────────────────────────────────

function renderUpgradeButtons() {
  const container = document.getElementById('upgrades-list');
  if (!container) return;

  // Only re-render if content has changed (check via data attr)
  upgrades.forEach(upgrade => {
    const level = getUpgradeLevel(upgrade.id);
    const cost = upgrade.costAt(level);
    const discounted = gameState.modifiers.alcohol > 0 ? Math.floor(cost * 0.6) : cost;
    const maxed = level >= upgrade.maxLevel;
    const totalUnderstanding = gameState.understanding + gameState.pseudoUnderstanding;
    const canAfford = totalUnderstanding >= discounted && !maxed;

    let btn = document.getElementById(`upgrade-btn-${upgrade.id}`);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = `upgrade-btn-${upgrade.id}`;
      btn.className = 'upgrade-btn';
      btn.addEventListener('click', () => buyUpgrade(upgrade.id));
      container.appendChild(btn);
    }

    btn.className = 'upgrade-btn' + (canAfford ? ' affordable' : '') + (maxed ? ' maxed' : '');
    btn.innerHTML = `
      <span class="upgrade-name">${upgrade.name}</span>
      <span class="upgrade-desc">${upgrade.description}</span>
      <span class="upgrade-cost">${maxed ? 'MAX' : (gameState.modifiers.alcohol > 0 ? `<s>${cost}</s> ${discounted}` : discounted) + ' 🧠'}</span>
      <span class="upgrade-level">Lv ${level}/${upgrade.maxLevel}</span>
    `;
    btn.disabled = maxed || !gameState.gameRunning;
  });
}

// ─── Consumables Panel ────────────────────────────────────────────────────────

function renderConsumables() {
  renderConsumable('weed', weedItem, buyWeed, gameState.modifiers.weed > 0);
  renderConsumable('adderall', adderallItem, buyAdderall, gameState.modifiers.adderall > 0, '(pack of 3)');
  renderConsumable('alcohol', alcoholItem, buyAlcohol, gameState.modifiers.alcohol > 0);
  renderConsumable('random-fact', randomFactItem, buyRandomFact, gameState.factActive);

  // Alcohol exclusive upgrade
  const container = document.getElementById('consumables-list');
  if (!container) return;

  let chaosBtn = document.getElementById('consumable-btn-unstable_chaos');
  if (!chaosBtn) {
    chaosBtn = document.createElement('button');
    chaosBtn.id = 'consumable-btn-unstable_chaos';
    chaosBtn.className = 'upgrade-btn alcohol-only';
    chaosBtn.addEventListener('click', buyUnstableChaos);
    container.appendChild(chaosBtn);
  }
  const chaosCost = alcoholUpgrade.getCost();
  const chaosActive = gameState.alcoholUnlockActive;
  chaosBtn.style.display = chaosActive ? '' : 'none';
  chaosBtn.className = 'upgrade-btn alcohol-only' + (gameState.understanding >= chaosCost && chaosActive ? ' affordable' : '');
  chaosBtn.innerHTML = `
    <span class="upgrade-name">${alcoholUpgrade.name}</span>
    <span class="upgrade-desc">${alcoholUpgrade.description}</span>
    <span class="upgrade-cost">${chaosCost} 🧠</span>
  `;
}

function renderConsumable(id, item, buyFn, isActive, suffix = '') {
  const container = document.getElementById('consumables-list');
  if (!container) return;

  let btn = document.getElementById(`consumable-btn-${id}`);
  if (!btn) {
    btn = document.createElement('button');
    btn.id = `consumable-btn-${id}`;
    btn.className = 'upgrade-btn consumable-btn';
    btn.addEventListener('click', buyFn);
    container.appendChild(btn);
  }

  const cost = item.getCost();
  const canAfford = gameState.understanding >= cost && !isActive && !gameState.factActive;

  btn.className = 'upgrade-btn consumable-btn' + (canAfford ? ' affordable' : '') + (isActive ? ' active-substance' : '');
  btn.innerHTML = `
    <span class="upgrade-name">${item.name} ${suffix}</span>
    <span class="upgrade-desc">${item.description}</span>
    <span class="upgrade-cost">${isActive ? 'ACTIVE' : cost + ' 🧠'}</span>
  `;
  btn.disabled = isActive || gameState.factActive;
}
