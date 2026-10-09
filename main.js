(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById('themeToggle');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function syncThemeLabel() {
    themeBtn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeLabel();
  });
  syncThemeLabel();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Active section indicator ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('#navLinks a'));
  var indicator = document.querySelector('.nav__indicator');
  function moveIndicator(a) {
    links.forEach(function (l) { l.removeAttribute('aria-current'); });
    if (!a) { indicator.style.opacity = '0'; return; }
    a.setAttribute('aria-current', 'true');
    indicator.style.width = a.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    indicator.style.opacity = '1';
  }
  if ('IntersectionObserver' in window) {
    var sectionIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          moveIndicator(links.filter(function (l) { return l.getAttribute('href') === '#' + id; })[0]);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'experience', 'skills', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) sectionIo.observe(el);
    });
    var heroIo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) moveIndicator(null); }, { rootMargin: '-45% 0px -50% 0px' });
    heroIo.observe(document.querySelector('.hero'));
  }

  /* ---------- Hero: query types, runs, draws ---------- */
  var tokens = [
    ['SELECT', 'kw'], [' contract,\n       ', 'id'], ['ROUND', 'fn'], ['(', 'id'], ['AVG', 'fn'], ['(churned) * ', 'id'], ['100', 'num'], [', ', 'id'], ['1', 'num'], [') ', 'id'], ['AS', 'kw'], [' churn_pct\n', 'id'],
    ['FROM', 'kw'], [' customers\n', 'id'],
    ['GROUP BY', 'kw'], [' contract\n', 'id'],
    ['ORDER BY', 'kw'], [' churn_pct ', 'id'], ['DESC', 'kw'], [';', 'id']
  ];
  var sqlEl = document.getElementById('sql');
  var caret = document.getElementById('caret');
  var runBtn = document.getElementById('runBtn');
  var meta = document.getElementById('resMeta');
  var rows = Array.prototype.slice.call(document.querySelectorAll('#bars li'));
  var note = document.getElementById('note');
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function renderAll() {
    sqlEl.innerHTML = '';
    tokens.forEach(function (t) { var s = document.createElement('span'); s.className = t[1]; s.textContent = t[0]; sqlEl.appendChild(s); });
  }
  function resetResult() {
    meta.classList.remove('is-shown'); note.classList.remove('is-shown');
    rows.forEach(function (r) { r.classList.remove('is-shown'); r.querySelector('.bars__fill').style.width = '0'; });
  }
  function showResult(animated) {
    var max = 45;
    meta.classList.add('is-shown');
    rows.forEach(function (r, i) {
      var go = function () { r.classList.add('is-shown'); r.querySelector('.bars__fill').style.width = (parseFloat(r.dataset.v) / max * 100) + '%'; };
      animated ? later(go, 150 + i * 180) : go();
    });
    animated ? later(function () { note.classList.add('is-shown'); runBtn.disabled = false; runBtn.textContent = 'Run again'; }, 1300) : note.classList.add('is-shown');
  }
  function play() {
    clearTimers(); resetResult();
    runBtn.disabled = true; runBtn.textContent = 'Running…';
    caret.classList.remove('is-off');
    sqlEl.innerHTML = '';
    var chars = [];
    tokens.forEach(function (t) {
      var s = document.createElement('span'); s.className = t[1]; sqlEl.appendChild(s);
      for (var i = 0; i < t[0].length; i++) chars.push([s, t[0][i]]);
    });
    var i = 0;
    (function type() {
      if (i >= chars.length) { later(function () { caret.classList.add('is-off'); showResult(true); }, 250); return; }
      chars[i][0].textContent += chars[i][1];
      var ch = chars[i][1]; i++;
      later(type, ch === '\n' ? 80 : 16);
    })();
  }
  if (reduce) {
    renderAll(); caret.classList.add('is-off'); showResult(false); runBtn.textContent = 'Run again';
    runBtn.addEventListener('click', function () { renderAll(); showResult(false); });
  } else {
    later(play, 500);
    runBtn.addEventListener('click', play);
  }

  /* ---------- Draw diagrams when they come into view ---------- */
  function flowSequence(fig) {
    var steps = fig.querySelectorAll('.flow li');
    Array.prototype.forEach.call(steps, function (s, i) {
      reduce ? s.classList.add('on') : setTimeout(function () { s.classList.add('on'); }, 200 + i * 260);
    });
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), sep = el.dataset.sep;
    var fmt = function (v) { var s = v.toFixed(dec); return sep ? Number(s).toLocaleString('en-IN') : s; };
    if (reduce) { el.textContent = fmt(target); return; }
    var start = performance.now(), dur = 1100;
    (function tick(now) {
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var targets = document.querySelectorAll('.viz, .timeline, [data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute('data-count')) countUp(el);
        else { el.classList.add('in'); if (el.classList.contains('viz--flow')) flowSequence(el); }
        io.unobserve(el);
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  } else {
    Array.prototype.forEach.call(targets, function (t) { t.classList.add('in'); });
    document.querySelectorAll('.flow li').forEach(function (s) { s.classList.add('on'); });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  var toast = document.getElementById('toast');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.dataset.email;
    var done = function () { toast.textContent = 'Email address copied'; copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy email address'; toast.textContent = ''; }, 2400); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, function () { toast.textContent = 'Copy failed. The address is ' + email; });
    } else {
      toast.textContent = 'The address is ' + email;
    }
  });
})();
