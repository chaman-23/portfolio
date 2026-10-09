/* Hero scene: real payroll sparkline, pointer parallax, reduced-motion handling. */
(function () {
  'use strict';
  var PF = window.PF, D = window.PORTFOLIO_DATA;
  var scene = document.getElementById('scene');
  if (!scene) return;
  var svg = scene.querySelector('svg');

  /* Sparkline from the real monthly net payroll */
  var spark = document.getElementById('heroSpark');
  if (spark && D) {
    var vals = D.workforce.all.net, min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var x0 = 32, x1 = 180, y0 = 128, y1 = 96;
    var d = vals.map(function (v, i) {
      var x = x0 + (x1 - x0) * i / (vals.length - 1), y = y0 - (y0 - y1) * (v - min) / (max - min || 1);
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    spark.setAttribute('d', d);
    if (!PF.reduce) {
      var len = spark.getTotalLength();
      spark.style.strokeDasharray = len; spark.style.strokeDashoffset = len;
      spark.getBoundingClientRect();
      spark.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1) .4s';
      spark.style.strokeDashoffset = 0;
    }
  }

  /* Phones: crop the scene to the character (panels are hidden by CSS) */
  var narrow = window.matchMedia('(max-width: 720px)');
  function crop() { svg.setAttribute('viewBox', narrow.matches ? '96 128 380 372' : '0 0 560 500'); }
  crop(); if (narrow.addEventListener) narrow.addEventListener('change', crop);

  /* Reduced motion: stop SMIL packets too */
  if (PF.reduce) { try { svg.pauseAnimations(); } catch (e) {} return; }

  /* Pause everything when the hero is off-screen (saves battery) */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      try { en[0].isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(); } catch (e) {}
      scene.style.setProperty('--play', en[0].isIntersecting ? 'running' : 'paused');
    }).observe(scene);
  }

  /* Pointer parallax (fine pointers only) */
  if (!window.matchMedia('(pointer: fine)').matches) return;
  var layers = Array.prototype.slice.call(svg.querySelectorAll('.layer'));
  var hero = scene.closest('.hero');
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function frame() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    layers.forEach(function (l) {
      var dpt = parseFloat(l.dataset.depth || '0');
      l.style.transform = 'translate(' + (cx * dpt * 14).toFixed(2) + 'px,' + (cy * dpt * 10).toFixed(2) + 'px)';
    });
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(frame); else raf = null;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  hero.addEventListener('pointermove', function (e) {
    var r = scene.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    kick();
  });
  hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  layers.forEach(function (l) { l.style.transition = 'none'; });
})();
