/* Shared helpers and global interactions. Exposes window.PF for the section scripts. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PF = {
    reduce: reduce,
    /* Run cb once when el is sufficiently in view. Falls back to running immediately. */
    onView: function (el, cb, threshold) {
      if (!el) return;
      if (!('IntersectionObserver' in window)) { cb(el); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); cb(el); } });
      }, { threshold: threshold == null ? 0.3 : threshold });
      io.observe(el);
    },
    /* Accessible tablist: arrow keys move focus/selection, click selects. onSelect(button, index). */
    tabs: function (list, onSelect) {
      if (!list) return;
      var btns = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      function select(i, focus) {
        btns.forEach(function (b, j) {
          b.setAttribute('aria-selected', String(i === j));
          b.tabIndex = i === j ? 0 : -1;
        });
        if (focus) btns[i].focus();
        onSelect(btns[i], i);
      }
      btns.forEach(function (b, i) {
        b.tabIndex = b.getAttribute('aria-selected') === 'true' ? 0 : -1;
        b.addEventListener('click', function () { select(i, false); });
        b.addEventListener('keydown', function (e) {
          var k = e.key, n = btns.length, next = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % n;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + n) % n;
          else if (k === 'Home') next = 0; else if (k === 'End') next = n - 1;
          if (next !== null) { e.preventDefault(); select(next, true); }
        });
      });
      return { select: select, buttons: btns };
    },
    fmtINR: function (v) {
      if (v >= 100000) return '₹' + (v / 100000).toFixed(2) + ' L';
      return '₹' + Math.round(v).toLocaleString('en-IN');
    },
    el: function (tag, attrs, text) {
      var e = document.createElement(tag);
      if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text != null) e.textContent = text;
      return e;
    },
    svg: function (tag, attrs) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      return e;
    }
  };
  window.PF = PF;

  /* Theme */
  var themeBtn = document.getElementById('themeToggle');
  function currentTheme() {
    return root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function syncLabel() { themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncLabel();
  });
  syncLabel();

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu');
  function setMenu(open) { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? 'Close' : 'Menu'; }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* Active-section indicator */
  var links = Array.prototype.slice.call(document.querySelectorAll('#navLinks a'));
  var indicator = document.querySelector('.nav__indicator');
  function move(a) {
    links.forEach(function (l) { l.removeAttribute('aria-current'); });
    if (!a) { indicator.style.opacity = '0'; return; }
    a.setAttribute('aria-current', 'true');
    indicator.style.width = a.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    indicator.style.opacity = '1';
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        move(id ? links.filter(function (l) { return l.getAttribute('href') === '#' + id; })[0] : null);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'experience', 'method', 'skills', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    io.observe(document.querySelector('.hero'));
  }

  /* Count-up numbers */
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), sep = el.dataset.sep;
    var fmt = function (v) { var s = v.toFixed(dec); return sep ? Number(s).toLocaleString('en-IN') : s; };
    if (reduce) { el.textContent = fmt(target); return; }
    var start = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - start) / 1100), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) { PF.onView(el, countUp, 0.6); });

  /* Copy email */
  var copyBtn = document.getElementById('copyEmail'), toast = document.getElementById('toast');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.dataset.email;
    var done = function () {
      toast.textContent = 'Email address copied'; copyBtn.textContent = 'Copied';
      setTimeout(function () { copyBtn.textContent = 'Copy email address'; toast.textContent = ''; }, 2400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, function () { toast.textContent = 'Copy failed. The address is ' + email; });
    else toast.textContent = 'The address is ' + email;
  });
})();
