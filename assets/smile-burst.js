/* Smile burst: a click scatters a pinch of tiny smiley faces from the pointer,
   which tumble out, drop a little and fade, like a sprinkle of salt.

   Decoration only. Every face is aria-hidden and takes no pointer events, so
   nothing about the page changes for a screen reader or for what the click
   lands on. Nothing runs for anyone who has asked for reduced motion, and
   clicks into form fields are left alone so typing is never distracted. */
(function () {
  'use strict';

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!document.body || !document.body.animate) return;

  var PER_BURST = 7;   // faces per click
  var MAX_LIVE = 60;   // ceiling on faces on screen, for a frantic clicker
  var live = 0;

  // Brand greens, darkest first, so most faces read clearly on sand.
  var COLOURS = ['#0f5c31', '#17773f', '#1d8f52', '#1d8f52', '#8fcfab'];

  var FACE =
    '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="10.5" fill="currentColor"/>' +
    '<circle cx="8.6" cy="9.6" r="1.5" fill="#fffdf8"/>' +
    '<circle cx="15.4" cy="9.6" r="1.5" fill="#fffdf8"/>' +
    '<path d="M7.2 13.6a5.2 5.2 0 0 0 9.6 0" fill="none" stroke="#fffdf8" stroke-width="1.9" stroke-linecap="round"/>' +
    '</svg>';

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2147483647';
  document.body.appendChild(layer);

  function rand(min, max) { return min + Math.random() * (max - min); }

  function burst(x, y) {
    var count = Math.min(PER_BURST, MAX_LIVE - live);
    var offset = Math.random() * Math.PI * 2;

    for (var i = 0; i < count; i++) {
      var size = rand(9, 16);
      // Spread the faces round the circle with a little jitter, biased upward.
      var angle = offset + (i / PER_BURST) * Math.PI * 2 + rand(-0.35, 0.35);
      var dist = rand(28, 64);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 14;
      var fall = rand(18, 34);           // extra drop at the end: the "gravity"
      var spin = rand(-220, 220);

      var el = document.createElement('span');
      el.innerHTML = FACE;
      el.style.cssText =
        'position:absolute;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;' +
        'width:' + size + 'px;height:' + size + 'px;will-change:transform,opacity;' +
        'color:' + COLOURS[Math.floor(Math.random() * COLOURS.length)];
      layer.appendChild(el);
      live++;

      var anim = el.animate([
        { transform: 'translate(0,0) scale(0.3) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1) rotate(' + spin * 0.6 + 'deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(' + dx * 1.15 + 'px,' + (dy + fall) + 'px) scale(0.8) rotate(' + spin + 'deg)', opacity: 0 }
      ], {
        duration: rand(650, 950),
        easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
        fill: 'forwards'
      });

      anim.onfinish = (function (node) {
        return function () { node.remove(); live--; };
      })(el);
    }
  }

  document.addEventListener('pointerdown', function (event) {
    if (motion.matches || !event.isPrimary || event.button !== 0) return;
    if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable]')) return;
    burst(event.clientX, event.clientY);
  }, { passive: true });
})();
