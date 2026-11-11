/**
 * perf.js
 * Runs synchronously in <head>, before stylesheets paint, so weak desktops
 * get the lightweight rendering path without a flash of heavy effects.
 *
 * Detection is intentionally conservative. Force either mode with:
 *   ?perf=lite   or   ?perf=full
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var lite = false;

  try {
    if (window.matchMedia) {
      // Honour the OS accessibility setting.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) lite = true;
      // Newer OS-level transparency preference.
      if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) lite = true;
      // Browsers can report a slow display refresh path.
      if (window.matchMedia('(update: slow)').matches) lite = true;
    }

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) lite = true;
      if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') lite = true;
    }

    // 4 GB is a common "lightweight desktop" ceiling.
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4) {
      lite = true;
    }
    // Two threads or fewer cannot comfortably drive multiple composited layers.
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) {
      lite = true;
    }

    var forced = '';
    try {
      forced = (new URLSearchParams(window.location.search).get('perf') || '').toLowerCase();
    } catch (e) { /* very old browser */ }

    if (forced === 'lite' || forced === 'low') lite = true;
    if (forced === 'full' || forced === 'high') lite = false;
  } catch (e) {
    lite = false;
  }

  root.classList.toggle('perf-lite', lite);
  window.greatBooksLite = lite;
})();
