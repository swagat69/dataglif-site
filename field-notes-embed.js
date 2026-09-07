/* ==========================================================================
   Field Notes — shared runtime for the four layout prototypes.

   Two jobs only:
     1. Mount demo iframes lazily, so the section costs nothing until it is
        near the viewport. The live section eagerly loads two iframes and two
        autoplay videos (~8MB) whether or not anyone scrolls to it.
     2. Run the single scroll entrance.

   There is deliberately no scale() anywhere. A demo gets its real width and
   renders at 1:1.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Lazy mount -------------------------------------------------- */

  function mount(el) {
    var src = el.getAttribute('data-src');
    if (!src || el.dataset.mounted) return;
    el.dataset.mounted = '1';

    var well = el.closest('.fn-well');

    // Listeners go on before src, or a cached asset fires them first and the
    // handler never runs.
    if (well) {
      if (el.tagName === 'IFRAME') {
        el.addEventListener('load', function () { well.classList.add('is-live'); }, { once: true });
      } else {
        el.addEventListener('loadeddata', function () { well.classList.add('is-live'); }, { once: true });
      }
      // Never leave the skeleton spinning if the asset stalls or 404s.
      setTimeout(function () { well.classList.add('is-live'); }, 6000);
    }

    el.src = src;

    // Assigning src after parse does not re-arm the autoplay attribute, so
    // start playback explicitly. This has to happen now rather than on
    // loadeddata: preload is "none", so nothing loads until play() asks for
    // it, and waiting for data that play() is meant to trigger deadlocks.
    // Muted playback needs no gesture. Calling load() first would abort it.
    if (el.tagName === 'VIDEO') {
      var go = el.play();
      if (go && go.catch) go.catch(function () {});
    }
  }

  var frames = document.querySelectorAll('[data-src]');

  if ('IntersectionObserver' in window) {
    var mounter = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mount(entry.target);
        mounter.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });

    frames.forEach(function (f) { mounter.observe(f); });
  } else {
    frames.forEach(mount);
  }

  /* Expose for layouts that mount on demand (the stage, the viewer). */
  window.fnMount = mount;

  /* Chrome pauses muted, audio-less video in a background tab to save power,
     and does not resume it on its own. Nudge it when the tab comes back. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    document.querySelectorAll('.fn-well video[data-mounted]').forEach(function (v) {
      if (!v.paused) return;
      var go = v.play();
      if (go && go.catch) go.catch(function () {});
    });
  });

  /* --- 2. Entrance ----------------------------------------------------- */

  var rising = document.querySelectorAll('[data-rise]');

  if (reduced || !('IntersectionObserver' in window)) {
    rising.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var riser = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var delay = parseInt(entry.target.getAttribute('data-rise'), 10) || 0;
      setTimeout(function () { entry.target.classList.add('is-in'); }, delay);
      riser.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  rising.forEach(function (el) { riser.observe(el); });
})();
