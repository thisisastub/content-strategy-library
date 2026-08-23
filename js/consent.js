/* ============================================================
   Content Strategy Library, cookie consent gate
   ------------------------------------------------------------
   GA4 Consent Mode v2. On first visit the page is visible but
   dimmed and non-interactive until the visitor chooses Accept or
   Reject. Analytics storage stays "denied" (no _ga cookie) until
   Accept. Choice persists in localStorage so the gate shows once.
   Self-contained, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'csl-consent-v1';
  var PRIVACY_URL = '/privacy/';

  // gtag may not exist if the GA snippet failed to load; never throw.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: session-only */ }
  }

  function applyConsent(granted) {
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  }

  // ---- gate DOM ------------------------------------------------
  var scrim, bar, lastFocus;

  function lockScroll(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  }

  function buildBar(gated) {
    var wrap = document.createElement('div');
    wrap.className = 'consent-bar' + (gated ? ' consent-bar--gated' : '');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', gated ? 'true' : 'false');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.innerHTML =
      '<div class="consent-bar__inner">' +
        '<p class="consent-bar__text">This site uses a single Google Analytics cookie to understand how the library gets used, ' +
        'no ads, and your data is never sold or shared. Essential features (remembering this choice and your Workspace) never use tracking cookies. ' +
        '<a href="' + PRIVACY_URL + '" class="consent-bar__link">Privacy</a></p>' +
        '<div class="consent-bar__actions">' +
          '<button type="button" class="btn btn--sm btn--secondary" data-consent="reject">Reject</button>' +
          '<button type="button" class="btn btn--sm btn--highlight" data-consent="accept">Accept</button>' +
        '</div>' +
      '</div>';
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      choose(b.getAttribute('data-consent') === 'accept');
    });
    return wrap;
  }

  function openGate(gated) {
    if (bar) return; // already open
    lastFocus = document.activeElement;
    if (gated) {
      scrim = document.createElement('div');
      scrim.className = 'consent-scrim';
      document.body.appendChild(scrim);
      lockScroll(true);
    }
    bar = buildBar(gated);
    document.body.appendChild(bar);
    // focus the first action for keyboard users
    var first = bar.querySelector('button');
    if (first) first.focus();
    if (gated) document.addEventListener('keydown', trapKey, true);
  }

  function closeGate() {
    if (scrim) { scrim.remove(); scrim = null; }
    if (bar) { bar.remove(); bar = null; }
    lockScroll(false);
    document.removeEventListener('keydown', trapKey, true);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  // Keep keyboard focus inside the gated bar (a choice is required).
  function trapKey(e) {
    if (e.key === 'Tab' && bar) {
      var f = bar.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // Esc intentionally does nothing while gated, the visitor must choose.
  }

  function choose(accepted) {
    save(accepted ? 'granted' : 'denied');
    applyConsent(accepted);
    closeGate();
  }

  // Re-open from the footer "Cookie preferences" link (non-gated: just re-choose).
  window.openCookiePrefs = function () {
    if (bar) return;
    openGate(false);
  };

  // ---- boot ----------------------------------------------------
  function boot() {
    var choice = stored();
    if (choice === 'granted') { applyConsent(true); return; }
    if (choice === 'denied') { applyConsent(false); return; }
    // No prior choice → show the blocking gate.
    openGate(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
