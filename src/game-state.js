// game-state.js — Central game state for the Asymptote Engine

export const gameState = {
  // Core progression
  distance: 100.0,       // Distance to the asymptote (starts at 100, approaches 0)
  understanding: 0,      // Real understanding currency
  pseudoUnderstanding: 0, // Fake understanding from weed

  // Rates
  clickRate: 1,          // How much each click reduces distance
  passiveRate: 0.005,    // Passive distance reduction per second
  understandingPerClick: 10, // Understanding gained per click

  // Spawn settings
  targetLifetime: 3000,  // ms before a target expires
  spawnInterval: 2000,   // ms between target spawns

  // Time modifier (1.0 = normal, <1 = faster, >1 = slower)
  timeMultiplier: 1.0,

  // Active substance timers (in seconds remaining)
  modifiers: {
    weed: 0,
    adderall: 0,
    alcohol: 0,
  },

  // Adderall tracking
  adderallActiveTime: 0,    // How long adderall has been active (seconds)
  adderallActionCount: 0,   // Actions taken during adderall

  // Fact mechanic
  factBaseDuration: 10,     // Base seconds before fact can be closed
  factDurationMultiplier: 1.0, // Reduced by upgrades

  // Upgrade tracking
  purchasedUpgrades: new Set(),

  // Alcohol unlocked upgrades tracking
  alcoholUnlockActive: false,

  // Running state
  gameRunning: true,
  factActive: false,

  // Stats
  totalClicks: 0,
  totalUnderstandingEarned: 0,

  // Computed: effective understanding rate (moving average over last 5s)
  _understandingHistory: [],
  get understandingRate() {
    if (this._understandingHistory.length === 0) return 1;
    const sum = this._understandingHistory.reduce((a, b) => a + b, 0);
    return sum / this._understandingHistory.length;
  },
};

/**
 * Record understanding earned for rate calculation.
 */
export function recordUnderstanding(amount) {
  gameState._understandingHistory.push(amount);
  if (gameState._understandingHistory.length > 10) {
    gameState._understandingHistory.shift();
  }
}

/**
 * Return the effective fact close duration (seconds), adjusted by upgrades + substances.
 */
export function getEffectiveFactDuration() {
  let duration = gameState.factBaseDuration * gameState.factDurationMultiplier;
  // Weed makes time pass faster (halves close timer subjectively)
  if (gameState.modifiers.weed > 0) {
    duration *= 0.5;
  }
  // Adderall makes time pass slower (doubles the wait)
  if (gameState.modifiers.adderall > 0) {
    duration *= 2.0;
  }
  // Alcohol randomizes time effects
  if (gameState.modifiers.alcohol > 0) {
    duration *= (0.5 + Math.random() * 1.5);
  }
  return Math.max(1, Math.round(duration));
}

/**
 * Apply passive distance reduction each second tick.
 */
export function applyPassiveTick() {
  if (!gameState.gameRunning) return;
  let rate = gameState.passiveRate;
  // Adderall boosts passive too (matches the 2x multiplier applied on purchase)
  if (gameState.modifiers.adderall > 0) rate *= 2.0;
  gameState.distance = Math.max(0.000001, gameState.distance - rate);
}

/**
 * Apply a click — reduces distance, awards understanding.
 */
export function applyClick() {
  if (gameState.factActive) return false;

  const reduction = gameState.clickRate / gameState.distance;
  gameState.distance = Math.max(0.000001, gameState.distance - reduction);

  const earned = gameState.understandingPerClick;
  gameState.understanding += earned;
  if (gameState.modifiers.weed > 0) {
    gameState.pseudoUnderstanding += earned * 0.5;
  }
  recordUnderstanding(earned);

  gameState.totalClicks++;
  gameState.totalUnderstandingEarned += earned;

  if (gameState.modifiers.adderall > 0) {
    gameState.adderallActionCount++;
  }

  return { reduction, earned };
}
