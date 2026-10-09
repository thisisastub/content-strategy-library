/* ============================================================
   Content Strategy Library, hero video player
   ------------------------------------------------------------
   Progressive enhancement for the motion graphics that stand in
   for the static hero diagram on some tool pages (see
   window.TOOL_VIDEOS in js/data.js).

   Behaviour:
     · Plays through once, muted, as soon as it scrolls into view.
     · Two controls, play/pause and a loop toggle.
     · Pointer devices reveal the controls on hover or keyboard focus.
     · Touch devices reveal them on tap, and fade them back out after
       a few idle seconds.
     · Turning loop on restarts a finished video and keeps it running.
     · prefers-reduced-motion: nothing autoplays, controls stay put.

   The markup is built by app.js (heroVideo) and by build.js for the
   prerendered pages; this file only wires up behaviour.
   ============================================================ */

(function () {
  'use strict';

  var IDLE_HIDE_MS = 3000;   // touch: how long the controls linger after a tap
  var VISIBLE_RATIO = 0.35;  // how much of the video must be on screen to autoplay

  var reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  var canHover = window.matchMedia
    ? window.matchMedia('(hover: hover) and (pointer: fine)')
    : { matches: true };

  /* ---------- icons ---------- */
  function svg(paths, filled) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" ' +
      'fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }
  var ICON = {
    play:   svg('<path d="M8 5.5v13l11-6.5z"/>', true),
    pause:  svg('<path d="M9.5 5v14M14.5 5v14"/>'),
    replay: svg('<path d="M20 11.5a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>'),
    loop:   svg('<path d="M4 9.5A3.5 3.5 0 0 1 7.5 6h11"/><path d="M15.5 3.2 18.8 6l-3.3 2.8"/>' +
                '<path d="M20 14.5a3.5 3.5 0 0 1-3.5 3.5h-11"/><path d="M8.5 20.8 5.2 18l3.3-2.8"/>')
  };

  /* ---------- one player ---------- */
  function setUp(fig) {
    if (fig.dataset.hvReady === '1') return;
    fig.dataset.hvReady = '1';

    var video = fig.querySelector('.hero-video__el');
    var playBtn = fig.querySelector('[data-hv-playpause]');
    var loopBtn = fig.querySelector('[data-hv-loop]');
    var scrub = fig.querySelector('[data-hv-scrub]');
    var timeEl = fig.querySelector('[data-hv-time]');
    if (!video || !playBtn || !loopBtn) return;

    var touch = !canHover.matches;
    var idleTimer = null;
    var autoStarted = false;
    var scrubbing = false;

    fig.classList.toggle('is-touch', touch);
    if (reducedMotion.matches) fig.classList.add('is-reduced');

    // Autoplay only works reliably when the browser knows there is no sound.
    video.muted = true;
    video.loop = false;

    /* --- control state --- */
    function syncPlayBtn() {
      var ended = video.ended;
      var paused = video.paused;
      fig.classList.toggle('is-paused', paused && !ended);
      fig.classList.toggle('is-ended', ended);
      var label = ended ? 'Replay' : (paused ? 'Play' : 'Pause');
      playBtn.innerHTML = ended ? ICON.replay : (paused ? ICON.play : ICON.pause);
      playBtn.setAttribute('aria-label', label);
      playBtn.setAttribute('title', label);
    }

    function syncLoopBtn() {
      var on = video.loop;
      loopBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = on ? 'Turn off looping' : 'Loop this video';
      loopBtn.setAttribute('aria-label', label);
      loopBtn.setAttribute('title', label);
      fig.classList.toggle('is-looping', on);
    }

    /* --- playhead --- */
    function fmt(secs) {
      if (!isFinite(secs) || secs < 0) secs = 0;
      var m = Math.floor(secs / 60);
      var s = Math.floor(secs % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }
    // Keeps the track fill, the thumb and the readout in step with the video.
    function syncScrub() {
      if (!scrub) return;
      var dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      var pct;
      if (scrubbing) {
        // Mid-drag the slider leads and the seek trails it, so the slider is the
        // truth; reading currentTime here makes the fill stutter.
        pct = parseFloat(scrub.value) || 0;
      } else {
        pct = dur ? (video.currentTime / dur) * 100 : 0;
        scrub.value = String(pct);
      }
      var at = dur ? (pct / 100) * dur : 0;
      scrub.style.setProperty('--hv-pct', pct.toFixed(2) + '%');
      // The visible readout is aria-hidden, so the slider carries the spoken value.
      scrub.setAttribute('aria-valuetext', fmt(at) + ' of ' + fmt(dur));
      if (timeEl) timeEl.textContent = fmt(at) + ' / ' + fmt(dur);
    }
    function seekTo(secs) {
      var dur = isFinite(video.duration) ? video.duration : 0;
      if (!dur) return;
      // Scrubbing to the very end is allowed to finish the video, exactly as
      // playing to the end would: the button becomes Replay, loop restarts it.
      video.currentTime = Math.min(dur, Math.max(0, secs));
    }
    function seekToPct(pct) {
      var dur = isFinite(video.duration) ? video.duration : 0;
      seekTo((pct / 100) * dur);
    }

    /* --- touch: show the controls, then let them fade --- */
    function clearIdle() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    }
    function revealControls() {
      if (!touch) return;
      fig.classList.add('hv-show');
      clearIdle();
      idleTimer = setTimeout(function () {
        fig.classList.remove('hv-show');
        idleTimer = null;
      }, IDLE_HIDE_MS);
    }

    /* --- playback --- */
    function play() {
      if (video.ended) video.currentTime = 0;
      fig.classList.remove('is-blocked');
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          // Some browsers refuse even a muted autoplay. Pin the controls up so
          // there is always a way in, on touch as much as on a desktop.
          fig.classList.add('is-blocked');
          clearIdle();
          fig.classList.add('hv-show');
        });
      }
    }
    function toggle() {
      if (video.paused || video.ended) play(); else video.pause();
    }

    /* --- events --- */
    // `seeked` matters as much as play/pause here: rewinding a finished video is
    // what clears the ended state, and it lands before the play event.
    ['play', 'playing', 'pause', 'seeked'].forEach(function (evt) {
      video.addEventListener(evt, syncPlayBtn);
    });
    ['loadedmetadata', 'durationchange', 'timeupdate', 'seeking', 'seeked', 'progress'].forEach(function (evt) {
      video.addEventListener(evt, syncScrub);
    });
    video.addEventListener('ended', function () {
      syncPlayBtn();
      if (touch) revealControls();
    });

    // Clicking or tapping the video itself toggles playback and, on touch,
    // brings the controls back for a few seconds.
    video.addEventListener('click', function () {
      toggle();
      revealControls();
    });

    playBtn.addEventListener('click', function () {
      toggle();
      revealControls();
    });

    loopBtn.addEventListener('click', function () {
      var turningOn = !video.loop;
      video.loop = turningOn;
      syncLoopBtn();
      // Looping a finished video should start it over and keep it going.
      if (turningOn && (video.ended || video.paused)) play();
      revealControls();
    });

    if (scrub) {
      // `input` fires throughout a drag and on every arrow key; `change` ends it.
      scrub.addEventListener('input', function () {
        scrubbing = true;
        seekToPct(parseFloat(scrub.value));
        syncScrub();
        revealControls();
      });
      scrub.addEventListener('change', function () { scrubbing = false; syncScrub(); });
      scrub.addEventListener('blur', function () { scrubbing = false; syncScrub(); });
      // Arrow keys step by 0.05% of the clip natively, which is far too fine to
      // be useful. Take them over and move in seconds instead.
      scrub.addEventListener('keydown', function (e) {
        var dur = isFinite(video.duration) ? video.duration : 0;
        if (!dur) return;
        var step = e.shiftKey ? 5 : 1;
        var to = null;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') to = video.currentTime - step;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') to = video.currentTime + step;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = dur;
        if (to === null) return;
        e.preventDefault();
        e.stopPropagation();
        seekTo(to);
        syncScrub();
        revealControls();
      });
    }

    // Touch: any tap in the player area keeps the controls alive.
    if (touch) {
      fig.addEventListener('touchstart', revealControls, { passive: true });
    }

    /* --- autoplay once it is actually on screen --- */
    function startWhenSeen() {
      if (reducedMotion.matches) { syncPlayBtn(); return; }
      if (!('IntersectionObserver' in window)) { autoStarted = true; play(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || autoStarted) return;
          autoStarted = true;
          io.disconnect();
          play();
          // Touch has no hover to discover the controls with, so flash them once
          // as the video starts and let them fade on the usual idle timer.
          revealControls();
        });
      }, { threshold: VISIBLE_RATIO });
      io.observe(fig);
    }

    syncPlayBtn();
    syncLoopBtn();
    syncScrub();
    startWhenSeen();
  }

  /* ---------- public: wire up whatever is on the page now ---------- */
  function mount(root) {
    var scope = root || document;
    var list = scope.querySelectorAll('[data-hero-video]');
    for (var i = 0; i < list.length; i++) setUp(list[i]);
  }

  window.CSLVideo = { mount: mount, ICON: ICON };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mount(); });
  } else {
    mount();
  }
})();
