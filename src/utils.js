// utils.js — Shared interaction utilities
// Ported and adapted from indrolend/basic-browser-spa (main.js).

/**
 * Unified fast-tap helper.
 *
 * Fires `handler` on touchend (immediately, no 300ms synthetic-click delay)
 * and on click (mouse / keyboard / accessibility fallback).
 *
 * The touchend listener calls preventDefault() to suppress the synthetic
 * click that the browser fires after touch, preventing double-invocation.
 * Screen readers fire `click` directly through accessibility APIs (not via
 * the touch event chain), so keyboard/VoiceOver/TalkBack are unaffected.
 *
 * Respects the `disabled` attribute on form elements — if the element has
 * `disabled = true` at the time of touch, the handler is not called.
 *
 * @param {HTMLElement} element
 * @param {Function} handler
 */
export function addActivationHandler(element, handler) {
  element.addEventListener('touchend', (e) => {
    if (element.disabled) return;
    e.preventDefault();
    handler();
  });
  element.onclick = handler;
}

/**
 * Returns a debounced version of `fn` that delays invocation by `wait` ms.
 * Only the last call within the wait window is executed.
 *
 * @param {Function} fn
 * @param {number} wait — delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
