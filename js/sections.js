/* Method scroll story, capability map, contact network. */
(function () {
  'use strict';
  var PF = window.PF;

  /* =========================================================
     Method: one example (the churn project) through six stages
     ========================================================= */
  var NS = 'http://www.w3.org/2000/svg';
  function grid(cols, rows, bad, fixed) {
    var s = '', cw = 26, ch = 18, x0 = 70, y0 = 70;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var k = r + '-' + c, cls = 'm-cell';
      if (bad && bad.indexOf(k) > -1) cls = fixed ? 'm-fix' : 'm-bad';
      s += '<rect class="' + cls + '" x="' + (x0 + c * (cw + 3)) + '" y="' + (y0 + r * (ch + 3)) + '" width="' + cw + '" height="' + ch + '" rx="3"/>';
    }
    return s;
  }
  var BAD = ['1-6', '3-6', '5-6'];
  var VIZ = [
    function () { return '<text x="200" y="120" text-anchor="middle" font-size="27" font-family="Fraunces, serif">Which customers will leave,</text><text x="200" y="150" text-anchor="middle" font-size="27" font-family="Fraunces, serif">and why?</text><text x="200" y="196" text-anchor="middle" font-size="17" class="m-muted">A retention team needs a list it can act on</text>'; },
    function () { return '<text x="70" y="52" font-size="17" class="m-muted">tele_data.csv</text>' + grid(9, 7) + '<text x="70" y="248" font-size="18">7,043 customers × 21 columns</text>'; },
    function (fixed) { return '<text x="70" y="52" font-size="17" class="m-muted">TotalCharges column</text>' + grid(9, 7, BAD, fixed) + '<text x="70" y="248" font-size="18">' + (fixed ? '11 missing values → filled with median' : '11 missing values found') + '</text>'; },
    function () {
      var rows = [['Month-to-month', 42.7], ['One year', 11.3], ['Two year', 2.8]], s = '<text x="40" y="52" font-size="17" class="m-muted">Churn rate by contract</text>';
      rows.forEach(function (r, i) { var y = 84 + i * 56, w = r[1] / 45 * 230; s += '<text x="40" y="' + (y - 8) + '" font-size="17">' + r[0] + '</text><rect class="' + (i ? 'm-bar' : 'm-hi') + '" x="40" y="' + y + '" width="' + w.toFixed(1) + '" height="16" rx="3"/><text x="' + (48 + w).toFixed(1) + '" y="' + (y + 13) + '" font-size="17" font-family="Plex Mono, monospace">' + r[1] + '%</text>'; });
      return s;
    },
    function () { return '<rect x="40" y="90" width="140" height="84" rx="10" class="m-cell"/><text x="110" y="124" text-anchor="middle" font-size="18">Month-to-month</text><text x="110" y="146" text-anchor="middle" font-size="18">first year</text><path d="M188 132 H222" class="m-acc"/><path d="M216 125 L224 132 L216 139" class="m-acc"/><rect x="230" y="90" width="140" height="84" rx="10" class="m-hi" opacity=".25"/><text x="300" y="124" text-anchor="middle" font-size="18">Retention offer</text><text x="300" y="146" text-anchor="middle" font-size="18">+ 1-year upgrade</text><text x="200" y="214" text-anchor="middle" font-size="17" class="m-muted">Recommendation from the analysis</text>'; },
    function () { return '<text x="40" y="52" font-size="17" class="m-muted">Planned measurement, not yet run</text><path d="M40 210 H360" class="m-line"/><path d="M40 120 C120 124 200 128 360 132" class="m-line" stroke-dasharray="5 5" stroke-width="2"/><path d="M40 120 C120 140 220 170 360 178" class="m-acc" stroke-dasharray="5 5"/><text x="300" y="124" font-size="15" class="m-muted">comparison group</text><text x="300" y="196" font-size="15">targeted group</text><text x="40" y="240" font-size="17">Compare churn over 3 months</text>'; }
  ];
  function paint(container, i, animate) {
    container.innerHTML = '<svg class="mv' + (animate ? ' mv-anim' : '') + '" viewBox="0 0 400 290" xmlns="' + NS + '" role="img" aria-hidden="true">' + VIZ[i](i === 2 ? false : undefined) + '</svg>';
    if (i === 2) {
      var after = function () { container.innerHTML = '<svg class="mv" viewBox="0 0 400 290" xmlns="' + NS + '" aria-hidden="true">' + VIZ[2](true) + '</svg>'; };
      PF.reduce ? after() : setTimeout(after, 900);
    }
  }
  var steps = document.getElementById('methodSteps'), viz = document.getElementById('methodViz');
  if (steps) {
    var items = Array.prototype.slice.call(steps.children);
    items.forEach(function (li, i) { paint(li.querySelector('.method__mini'), i, false); });
    var active = -1;
    function activate(i) {
      if (i === active) return; active = i;
      items.forEach(function (li, j) { li.classList.toggle('on', j <= i); });
      var top = items[i].offsetTop, total = items[items.length - 1].offsetTop || 1;
      steps.style.setProperty('--mprog', (top / total * 100).toFixed(1) + '%');
      paint(viz, i, !PF.reduce);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(items.indexOf(en.target)); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      items.forEach(function (li) { io.observe(li); });
    }
    activate(0);
  }

  /* =========================================================
     Capability map
     ========================================================= */
  var CM = {
    ba: { tools: ['Requirements gathering', 'BRD writing', 'AS-IS / TO-BE mapping', 'Gap analysis', 'Root cause analysis', 'Stakeholder management', 'Jira', 'Lucidchart'], work: ['ihro', 'smart', 'rca'],
      how: 'At IHRO I gathered requirements, mapped AS-IS and TO-BE flows, wrote the BRD and ran the renewal root cause analysis. The RCA engine turns that same diagnostic thinking into software.' },
    da: { tools: ['SQL (MySQL, SQLite, BigQuery)', 'Window functions & CTEs', 'Python', 'Pandas', 'NumPy', 'scikit-learn', 'Data cleaning', 'Validation'], work: ['churn', 'retail', 'csv', 'rca', 'wf'],
      how: 'SQL and Pandas do the heavy lifting in the churn and retail projects; the CSV audit and RCA engine are about trusting the data before reporting on it.' },
    bi: { tools: ['Power BI', 'DAX', 'Excel (pivot tables, VLOOKUP)', 'KPI reporting', 'Google Analytics 4', 'Search Console'], work: ['wf', 'churn', 'ihro', 'pl300'],
      how: 'Power BI dashboards with DAX measures in the workforce and churn projects, GA4 and Search Console for IHRO’s digital outreach, backed by the PL-300 certification.' },
    dev: { tools: ['Python', 'Flask', 'REST APIs', 'Git', 'Automated tests'], work: ['churn', 'rca', 'retail', 'csv'],
      how: 'The churn model is served through a Flask app, the RCA engine exposes REST APIs, and the retail SQL and CSV audit projects ship with automated tests.' }
  };
  var cmap = document.getElementById('cmap');
  if (cmap) {
    var toolsEl = document.getElementById('cmapTools'), work = Array.prototype.slice.call(document.querySelectorAll('#cmapWork li'));
    var how = document.getElementById('cmapHow'), lines = document.getElementById('cmapLines'), curBtn = null, curKey = 'ba';
    function drawLines() {
      lines.innerHTML = '';
      if (!curBtn || getComputedStyle(lines).display === 'none') return;
      var box = cmap.getBoundingClientRect(), b = curBtn.getBoundingClientRect();
      var chips = Array.prototype.slice.call(toolsEl.children); if (!chips.length) return;
      var tr = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      chips.forEach(function (c) { var r = c.getBoundingClientRect(); tr.l = Math.min(tr.l, r.left); tr.r = Math.max(tr.r, r.right); tr.t = Math.min(tr.t, r.top); tr.b = Math.max(tr.b, r.bottom); });
      lines.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      var segs = [];
      var sx = b.right - box.left, sy = b.top + b.height / 2 - box.top, ex = tr.l - box.left - 6, ey = tr.t - box.top + 18;
      segs.push([sx, sy, ex, ey]);
      var fx = tr.r - box.left + 8, fy = (tr.t + tr.b) / 2 - box.top;
      CM[curKey].work.forEach(function (w) {
        var li = work.filter(function (x) { return x.dataset.w === w; })[0]; if (!li) return;
        var r = li.getBoundingClientRect(); segs.push([fx, fy, r.left - box.left - 4, r.top + r.height / 2 - box.top]);
      });
      segs.forEach(function (sg, i) {
        var mx = (sg[0] + sg[2]) / 2, p = document.createElementNS(NS, 'path');
        p.setAttribute('d', 'M' + sg[0] + ' ' + sg[1] + ' C' + mx + ' ' + sg[1] + ' ' + mx + ' ' + sg[3] + ' ' + sg[2] + ' ' + sg[3]);
        lines.appendChild(p);
        p.style.setProperty('--len', p.getTotalLength()); p.style.animationDelay = (i ? 200 + i * 70 : 0) + 'ms';
      });
    }
    function show(btn) {
      curBtn = btn; curKey = btn.dataset.c; var c = CM[curKey];
      toolsEl.innerHTML = '';
      c.tools.forEach(function (t, i) { var s = PF.el('span', null, t); s.style.animationDelay = (PF.reduce ? 0 : i * 40) + 'ms'; toolsEl.appendChild(s); });
      work.forEach(function (li) { li.classList.toggle('on', c.work.indexOf(li.dataset.w) > -1); });
      how.textContent = c.how;
      setTimeout(drawLines, PF.reduce ? 0 : 60 + c.tools.length * 40);
    }
    var t = PF.tabs(cmap.querySelector('.cmap__cats'), show);
    show(t.buttons[0]);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawLines, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLines);
  }

  /* Contact network settles into place */
  var net = document.getElementById('net');
  if (net) PF.onView(net, function () { net.classList.add('in'); }, 0.4);
})();
