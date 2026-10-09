/* Project interactives: RCA explorer, data pipeline, workforce dashboard, churn SQL workstation. */
(function () {
  'use strict';
  var PF = window.PF, D = window.PORTFOLIO_DATA;

  function drawLine(path) {
    if (PF.reduce) return;
    var len = path.getTotalLength();
    path.style.transition = 'none';
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)';
    path.style.strokeDashoffset = 0;
  }

  /* =========================================================
     1. RCA explorer (illustrative scenarios, internally consistent)
     ========================================================= */
  var DIMS = ['Time', 'Region', 'Product', 'Category', 'Channel', 'Customer'];
  var SC = {
    revenue: {
      problem: 'Revenue fell 12% in week 7 compared with week 6.', unit: '₹ L', labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],
      series: [10.2, 10.5, 10.4, 10.8, 10.6, 10.9, 9.6, 9.8], tag: '−12%',
      dims: { Time: [['Weekend', 64], ['Weekday', 36]], Region: [['North', 58], ['West', 22], ['South', 12], ['East', 8]], Product: [['Product A', 30], ['Product B', 28], ['Product C', 24], ['Product D', 18]], Category: [['Electronics', 61], ['Home', 25], ['Apparel', 14]], Channel: [['Mobile app', 71], ['Web', 21], ['Store', 8]], Customer: [['Returning', 55], ['New', 45]] },
      cause: 'The drop is concentrated in the mobile app (71%), mostly electronics orders from the North region, starting in week 7. That points to a problem in the app’s checkout that week rather than falling demand.',
      conf: 'Medium confidence', gap: 'Data gap: there are no app release or error logs in the dataset, so the checkout issue needs confirming with the product team.',
      recs: ['Check the week-7 app release and hotfix checkout if it is the cause; watch daily revenue by channel until it recovers.', 'Add an alert that compares app checkout conversion before and after every release.', 'Make channel-level anomaly checks part of the weekly KPI review, so concentrated drops are caught in days, not weeks.']
    },
    returns: {
      problem: 'The return rate jumped from 6.4% to 8.9% in week 7.', unit: '%', labels: ['W1','W2','W3','W4','W5','W6','W7','W8'],
      series: [6.1, 6.0, 6.3, 6.2, 6.1, 6.4, 8.9, 8.7], tag: '+2.5 pts',
      dims: { Time: [['Week-7 orders', 81], ['Earlier orders', 19]], Region: [['West', 31], ['North', 27], ['South', 23], ['East', 19]], Product: [['Slim-fit range', 52], ['Other apparel', 21], ['Footwear', 15], ['Other', 12]], Category: [['Apparel', 68], ['Footwear', 17], ['Electronics', 15]], Channel: [['Web', 49], ['Mobile app', 41], ['Store', 10]], Customer: [['New', 63], ['Returning', 37]] },
      cause: 'The extra returns come mostly from apparel (68%), one slim-fit range (52%) and new customers (63%). Region and channel are spread evenly, so this looks like a product-information problem, such as a wrong size chart, not a delivery issue.',
      conf: 'Medium confidence', gap: 'Data gap: return reasons are free text and need tagging to confirm sizing as the reason.',
      recs: ['Review the size chart and photos for the slim-fit range and add a fit note on the product page.', 'Make the return reason a required dropdown, so the next spike can be diagnosed in hours.', 'Track return rate by product line on the dashboard with a threshold alert.']
    },
    churn: {
      problem: 'Monthly churn rose from 2.2% to 3.4% in month 7.', unit: '%', labels: ['M1','M2','M3','M4','M5','M6','M7','M8'],
      series: [2.1, 2.0, 2.2, 2.1, 2.3, 2.2, 3.4, 3.3], tag: '+1.2 pts',
      dims: { Time: [['First 12 months', 66], ['After 12 months', 34]], Region: [['Metro', 38], ['Urban', 34], ['Rural', 28]], Product: [['Fibre plan', 62], ['DSL plan', 29], ['No internet', 9]], Category: [['Month-to-month', 74], ['One year', 19], ['Two year', 7]], Channel: [['Electronic check', 57], ['Auto-pay', 28], ['Mailed check', 15]], Customer: [['No support add-on', 69], ['With support add-on', 31]] },
      cause: 'The rise is concentrated in month-to-month customers (74%) on fibre plans (62%) in their first year (66%). That suggests a first-year retention problem, possibly around price or service when an introductory offer ends.',
      conf: 'Medium confidence', gap: 'Data gap: no offer-end dates or support tickets, so price versus service is still an open question.',
      recs: ['Contact month-to-month fibre customers approaching month 12 with a targeted retention offer.', 'Test incentives that move first-year customers onto one-year contracts.', 'Add first-year churn by plan as a standing KPI with an alert threshold.']
    }
  };

  var rca = document.getElementById('rca');
  if (rca) {
    var steps = Array.prototype.slice.call(document.querySelectorAll('#rcaSteps li'));
    var chart = document.getElementById('rcaChart'), problem = document.getElementById('rcaProblem');
    var dimsEl = document.getElementById('rcaDims'), contrib = document.getElementById('rcaContrib');
    var causeBtn = document.getElementById('rcaCause'), causePanel = document.getElementById('rcaCausePanel');
    var cur = 'revenue', recTier = 0;

    function light(upto) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= upto); s.classList.toggle('now', i === upto); }); }

    function renderChart(sc) {
      while (chart.childNodes.length > 1) chart.removeChild(chart.lastChild);
      var W = Math.round(chart.getBoundingClientRect().width) || 600, H = 200, L = 44, R = 16, T = 16, B = 24;
      chart.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var min = Math.min.apply(null, sc.series), max = Math.max.apply(null, sc.series), pad = (max - min) * 0.25;
      min -= pad; max += pad;
      var X = function (i) { return L + (W - L - R) * i / (sc.series.length - 1); };
      var Y = function (v) { return T + (H - T - B) * (1 - (v - min) / (max - min)); };
      [0, 0.5, 1].forEach(function (f) {
        var v = min + (max - min) * f, y = Y(v);
        chart.appendChild(PF.svg('line', { x1: L, x2: W - R, y1: y, y2: y, class: 'gd' }));
        var t = PF.svg('text', { x: L - 6, y: y + 3, 'text-anchor': 'end', class: 'tk' }); t.textContent = v.toFixed(1); chart.appendChild(t);
      });
      sc.labels.forEach(function (l, i) { var t = PF.svg('text', { x: X(i), y: H - 4, 'text-anchor': 'middle', class: 'tk' }); t.textContent = l; chart.appendChild(t); });
      var d = sc.series.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
      chart.appendChild(PF.svg('path', { d: d + ' L' + X(sc.series.length - 1) + ' ' + (H - B) + ' L' + L + ' ' + (H - B) + ' Z', class: 'ar' }));
      var line = PF.svg('path', { d: d, class: 'ln' }); chart.appendChild(line); drawLine(line);
      var g = PF.svg('g', { class: 'an' });
      g.appendChild(PF.svg('circle', { cx: X(6), cy: Y(sc.series[6]), r: 5 }));
      var tx = PF.svg('text', { x: X(6) - 10, 'text-anchor': 'end', y: Y(sc.series[6]) + (sc.series[6] < sc.series[5] ? 18 : -10) }); tx.textContent = 'anomaly ' + sc.tag; g.appendChild(tx);
      g.appendChild(PF.svg('circle', { cx: X(6), cy: Y(sc.series[6]), r: 5 }));
      chart.appendChild(g);
      chart.querySelector('title').textContent = sc.problem;
    }

    function topShare(arr) { return Math.max.apply(null, arr.map(function (m) { return m[1]; })); }

    function renderDims(sc) {
      dimsEl.innerHTML = ''; contrib.innerHTML = '';
      var flagged = DIMS.slice().sort(function (a, b) { return topShare(sc.dims[b]) - topShare(sc.dims[a]); }).slice(0, 2);
      DIMS.forEach(function (name) {
        var b = PF.el('button', { role: 'tab', 'aria-selected': 'false', type: 'button', 'data-d': name }, name);
        if (flagged.indexOf(name) > -1) { var f = PF.el('span', { class: 'flag', title: 'Concentrated' }); f.setAttribute('aria-label', '(concentrated)'); b.appendChild(f); }
        dimsEl.appendChild(b);
      });
      PF.tabs(dimsEl, function (btn) { showContrib(sc, btn.dataset.d); });
    }

    function showContrib(sc, name) {
      var members = sc.dims[name], top = topShare(members);
      contrib.innerHTML = '';
      members.forEach(function (m, i) {
        var row = PF.el('div', { class: 'contrib__row' + (m[1] === top ? ' top' : '') });
        row.appendChild(PF.el('span', null, m[0]));
        var tr = PF.el('span', { class: 'contrib__track' }), fl = PF.el('span', { class: 'contrib__fill' });
        tr.appendChild(fl); row.appendChild(tr); row.appendChild(PF.el('span', null, m[1] + '%'));
        contrib.appendChild(row);
        setTimeout(function () { fl.style.width = m[1] + '%'; }, PF.reduce ? 0 : 40 + i * 60);
      });
      var even = top < 40;
      contrib.appendChild(PF.el('p', { class: 'contrib__read' }, even
        ? 'Spread fairly evenly across ' + name.toLowerCase() + ', so this dimension doesn’t explain the change.'
        : members[0][0] + ' accounts for ' + top + '% of the change. That concentration is evidence worth following.'));
      light(4); causeBtn.disabled = false;
    }

    function renderRec(sc) { document.getElementById('rcaRec').textContent = sc.recs[recTier]; }

    function setKpi(key) {
      cur = key; var sc = SC[key];
      problem.textContent = sc.problem;
      renderChart(sc); renderDims(sc);
      causePanel.hidden = true; causeBtn.disabled = true; causeBtn.textContent = 'Show root cause';
      light(2);
    }

    causeBtn.addEventListener('click', function () {
      var sc = SC[cur];
      var open = causePanel.hidden;
      causePanel.hidden = !open;
      causeBtn.textContent = open ? 'Hide root cause' : 'Show root cause';
      if (open) {
        document.getElementById('rcaCauseText').textContent = sc.cause;
        document.getElementById('rcaConf').textContent = sc.conf;
        document.getElementById('rcaGap').textContent = sc.gap;
        renderRec(sc); light(6);
      } else light(4);
    });
    PF.tabs(document.getElementById('rcaRecTabs'), function (b) { recTier = +b.dataset.tier; renderRec(SC[cur]); });
    PF.tabs(document.getElementById('rcaKpis'), function (b) { setKpi(b.dataset.kpi); });
    var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (problem.textContent) renderChart(SC[cur]); }, 150); });
    light(0);
    PF.onView(rca, function () { setKpi('revenue'); }, 0.25);
  }

  /* =========================================================
     2. Data pipeline
     ========================================================= */
  var PIPE = [
    ['Business datasets such as sales, orders, customers and inventory, imported from more than one source.', 'CSV and structured business data'],
    ['Detects each source’s schema and maps its fields onto one standard model.', 'Python · Pandas'],
    ['Checks types and required fields, finds duplicates and gives each dataset a data-quality score.', 'Python · Pandas · data-quality rules'],
    ['Cleans and reshapes the data into the standardised analytical model the KPIs run on.', 'Pandas · SQL'],
    ['Calculates KPIs such as Revenue, AOV, Margin, Return Rate, Churn and Inventory, and flags anomalies.', 'Python · NumPy · SQL'],
    ['Drills into time, region, product, category, channel and customer to find what drove a change; an AI layer drafts recommendations.', 'Python · AI/LLM'],
    ['Executive dashboard and automated reports: KPI scorecards, trends, RCA findings and recommendations.', 'REST APIs · web dashboard']
  ];
  var pipe = document.getElementById('pipe');
  if (pipe) {
    var wrap = pipe.parentElement, what = document.getElementById('pipeWhat'), tech = document.getElementById('pipeTech');
    var btns = Array.prototype.slice.call(pipe.querySelectorAll('button')), pinned = null;
    Array.prototype.forEach.call(pipe.children, function (li, i) { li.style.setProperty('--i', i); });
    function show(i) {
      btns.forEach(function (b, j) { b.classList.toggle('on', i === j); });
      if (i == null) { what.textContent = 'Hover or select a stage to see what it does.'; tech.textContent = ''; return; }
      what.textContent = PIPE[i][0]; tech.textContent = PIPE[i][1];
    }
    btns.forEach(function (b, i) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('mouseenter', function () { wrap.classList.add('paused'); show(i); });
      b.addEventListener('mouseleave', function () { wrap.classList.remove('paused'); show(pinned); });
      b.addEventListener('focus', function () { show(i); });
      b.addEventListener('blur', function () { show(pinned); });
      b.addEventListener('click', function () {
        pinned = pinned === i ? null : i;
        btns.forEach(function (x, j) { x.setAttribute('aria-pressed', String(pinned === j)); });
        show(pinned);
      });
    });
  }

  /* =========================================================
     3. Workforce dashboard (real project data)
     ========================================================= */
  var dash = document.getElementById('dash');
  if (dash && D) {
    var W = D.workforce, MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var mLabel = function (m) { var p = m.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; };
    var state = { dept: 'All', p: 12 };
    var deptList = document.getElementById('dashDept');
    ['All'].concat(W.depts).forEach(function (d, i) {
      deptList.appendChild(PF.el('button', { role: 'tab', 'aria-selected': String(i === 0), type: 'button', 'data-d': d }, d));
    });
    var deptTabs = PF.tabs(deptList, function (b) { state.dept = b.dataset.d; render(); });
    PF.tabs(document.getElementById('dashPeriod'), function (b) { state.p = +b.dataset.p; render(); });

    var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
    var slice = function (a) { return a.slice(a.length - state.p); };
    var trend = document.getElementById('dashTrend'), tip = document.getElementById('dashTip');
    var bars = document.getElementById('dashBars'), mix = document.getElementById('dashMix'), insight = document.getElementById('dashInsight');

    function setKpi(k, txt) { var dd = dash.querySelector('[data-k="' + k + '"]'); if (dd.textContent !== txt) { dd.textContent = txt; dd.classList.remove('flash'); void dd.offsetWidth; dd.classList.add('flash'); } }

    function renderTrend(block) {
      trend.innerHTML = '';
      var vals = slice(block.net), months = slice(W.months);
      var Wd = Math.round(trend.getBoundingClientRect().width) || 520, H = 220, L = 60, R = 12, T = 14, B = 26;
      trend.setAttribute('viewBox', '0 0 ' + Wd + ' ' + H);
      var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), pad = Math.max((max - min) * 0.3, max * 0.02);
      min = Math.max(0, min - pad); max += pad;
      var X = function (i) { return vals.length === 1 ? (L + Wd - R) / 2 : L + (Wd - L - R) * i / (vals.length - 1); };
      var Y = function (v) { return T + (H - T - B) * (1 - (v - min) / (max - min)); };
      [0, 0.5, 1].forEach(function (f) {
        var v = min + (max - min) * f, y = Y(v);
        trend.appendChild(PF.svg('line', { x1: L, x2: Wd - R, y1: y, y2: y, class: 'gd' }));
        var t = PF.svg('text', { x: L - 8, y: y + 3, 'text-anchor': 'end', class: 'tk' }); t.textContent = '₹' + (v / 100000).toFixed(2) + 'L'; trend.appendChild(t);
      });
      months.forEach(function (m, i) {
        if (state.p === 12 && i % 2) return;
        var t = PF.svg('text', { x: X(i), y: H - 6, 'text-anchor': 'middle', class: 'tk' }); t.textContent = MON[+m.split('-')[1] - 1]; trend.appendChild(t);
      });
      var d = vals.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' ');
      trend.appendChild(PF.svg('path', { d: d + ' L' + X(vals.length - 1) + ' ' + (H - B) + ' L' + X(0) + ' ' + (H - B) + ' Z', class: 'ar' }));
      var ln = PF.svg('path', { d: d, class: 'ln' }); trend.appendChild(ln); drawLine(ln);
      vals.forEach(function (v, i) {
        var c = PF.svg('circle', { cx: X(i), cy: Y(v), r: 4, class: 'pt', tabindex: '0', role: 'img', 'aria-label': mLabel(months[i]) + ': ' + PF.fmtINR(v) });
        var showTip = function () {
          tip.hidden = false; tip.textContent = mLabel(months[i]) + ' · ' + PF.fmtINR(v);
          var box = trend.getBoundingClientRect(), sx = box.width / Wd, sy = box.height / H;
          tip.style.left = (X(i) * sx) + 'px'; tip.style.top = (Y(v) * sy) + 'px';
        };
        c.addEventListener('mouseenter', showTip); c.addEventListener('focus', showTip);
        c.addEventListener('mouseleave', function () { tip.hidden = true; }); c.addEventListener('blur', function () { tip.hidden = true; });
        trend.appendChild(c);
      });
    }

    function renderBars() {
      var totals = W.depts.map(function (d) { return [d, sum(slice(W.byDept[d].net))]; });
      var mx = Math.max.apply(null, totals.map(function (t) { return t[1]; }));
      bars.innerHTML = '';
      totals.sort(function (a, b) { return b[1] - a[1]; }).forEach(function (t, i) {
        var li = PF.el('li'), b = PF.el('button', { type: 'button', 'aria-pressed': String(state.dept === t[0]), class: state.dept === t[0] ? 'on' : '' });
        b.appendChild(PF.el('span', null, t[0]));
        var tr = PF.el('span', { class: 'tr' }), fl = PF.el('span', { class: 'fl' }); tr.appendChild(fl); b.appendChild(tr);
        b.appendChild(PF.el('span', { class: 'vl' }, PF.fmtINR(t[1])));
        b.setAttribute('aria-label', t[0] + ': ' + PF.fmtINR(t[1]) + '. Select to filter.');
        b.addEventListener('click', function () { deptTabs.select(state.dept === t[0] ? 0 : W.depts.indexOf(t[0]) + 1, false); });
        li.appendChild(b); bars.appendChild(li);
        setTimeout(function () { fl.style.width = (t[1] / mx * 100) + '%'; }, PF.reduce ? 0 : 30 + i * 70);
      });
      mix.innerHTML = '';
      mix.appendChild(document.createTextNode('Headcount: ' + W.depts.map(function (d) { return d + ' ' + W.byDept[d].employees; }).join(' · ')));
      var mb = PF.el('span', { class: 'mixbar' });
      W.depts.forEach(function (d) { var s = PF.el('span', { class: state.dept === d ? 'on' : '' }); s.style.flex = W.byDept[d].employees; mb.appendChild(s); });
      mix.appendChild(mb);
    }

    function render() {
      var block = state.dept === 'All' ? W.all : W.byDept[state.dept];
      var net = sum(slice(block.net)), bonus = sum(slice(block.bonus)), allNet = sum(slice(W.all.net));
      setKpi('employees', String(block.employees));
      setKpi('net', PF.fmtINR(net));
      setKpi('avg', PF.fmtINR(block.avgBase));
      setKpi('bonus', PF.fmtINR(bonus));
      renderTrend(block); renderBars();
      if (state.dept === 'All') {
        var shares = W.depts.map(function (d) { return [d, sum(slice(W.byDept[d].net)) / allNet, W.byDept[d].employees]; }).sort(function (a, b) { return b[1] - a[1]; });
        var t = shares[0];
        insight.textContent = t[0] + ' has ' + t[2] + ' of ' + W.all.employees + ' employees but ' + Math.round(t[1] * 100) + '% of net payroll in this period.';
      } else {
        var s = slice(block.net);
        insight.textContent = state.dept + ': ' + block.employees + ' employee' + (block.employees > 1 ? 's' : '') + ', ' + Math.round(net / allNet * 100) + '% of net payroll. Monthly payroll went from ' + PF.fmtINR(s[0]) + ' to ' + PF.fmtINR(s[s.length - 1]) + ' over the period.';
      }
    }
    PF.onView(dash, render, 0.2);
    var rz2; window.addEventListener('resize', function () { tip.hidden = true; clearTimeout(rz2); rz2 = setTimeout(function () { if (trend.childNodes.length) renderTrend(state.dept === 'All' ? W.all : W.byDept[state.dept]); }, 150); });
  }

  /* =========================================================
     4. Churn SQL workstation (precomputed from tele_data.csv)
     ========================================================= */
  var CH = D && D.churn;
  var CHURN_EXPR = ["       ROUND(100.0 * AVG(CASE WHEN Churn = 'Yes'", "                          THEN 1 ELSE 0 END), 1) AS churn_pct"];
  var WS = {
    contract: {
      sql: ['SELECT Contract,', '       COUNT(*) AS customers,', CHURN_EXPR[0], CHURN_EXPR[1], 'FROM telco_customers', 'GROUP BY Contract', 'ORDER BY churn_pct DESC;'],
      rows: CH && CH.contract,
      insight: 'Month-to-month customers churn at 42.7%, about 15 times the two-year rate. Contract length is the strongest single signal.'
    },
    tenure: {
      sql: ['SELECT CASE', "         WHEN tenure <= 12 THEN '0–12'", "         WHEN tenure <= 24 THEN '13–24'", "         WHEN tenure <= 48 THEN '25–48'", "         ELSE '49–72'", '       END AS tenure_months,', '       COUNT(*) AS customers,', CHURN_EXPR[0], CHURN_EXPR[1], 'FROM telco_customers', 'GROUP BY tenure_months', 'ORDER BY MIN(tenure);'],
      rows: CH && CH.tenure,
      insight: 'Churn is highest in a customer’s first year (47.4%) and falls steadily to 9.5% after four years. Early-life retention matters most.'
    },
    payment: {
      sql: ['SELECT PaymentMethod,', '       COUNT(*) AS customers,', CHURN_EXPR[0], CHURN_EXPR[1], 'FROM telco_customers', 'GROUP BY PaymentMethod', 'ORDER BY churn_pct DESC;'],
      rows: CH && CH.payment,
      insight: 'Electronic-check payers churn at 45.3%, roughly three times the rate of customers on automatic payments.'
    }
  };
  var ws = document.getElementById('ws');
  if (ws && CH) {
    var KW = /\b(SELECT|FROM|GROUP BY|ORDER BY|CASE|WHEN|THEN|ELSE|END|AS|DESC)\b/g, FN = /\b(COUNT|ROUND|AVG|MIN)\b/g;
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    function hl(line) {
      var out = '', parts = line.split(/('[^']*')/);
      parts.forEach(function (p) {
        if (/^'.*'$/.test(p)) { out += '<span class="str">' + esc(p) + '</span>'; return; }
        out += esc(p).replace(KW, '<span class="kw">$1</span>').replace(FN, '<span class="fn">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
      });
      return out;
    }
    var code = document.getElementById('wsSql'), runBtn = document.getElementById('wsRun'), prog = document.getElementById('wsProg');
    var tbody = ws.querySelector('tbody'), barsEl = document.getElementById('wsBars'), ins = document.getElementById('wsInsight'), cnt = document.getElementById('wsCount');
    var key = 'contract', timers = [];
    var later = function (fn, ms) { timers.push(setTimeout(fn, PF.reduce ? 0 : ms)); };

    function load(k) {
      timers.forEach(clearTimeout); timers = []; key = k;
      code.innerHTML = WS[k].sql.map(function (l) { return '<span class="l">' + hl(l) + '</span>'; }).join('');
      tbody.innerHTML = ''; barsEl.innerHTML = ''; ins.textContent = ''; cnt.textContent = '';
      prog.classList.remove('go');
      runBtn.disabled = false; runBtn.textContent = 'Run analysis';
    }
    function run() {
      var sc = WS[key], rows = sc.rows, top = Math.max.apply(null, rows.map(function (r) { return r[2]; }));
      timers.forEach(clearTimeout); timers = [];
      runBtn.disabled = true; runBtn.textContent = 'Running…';
      tbody.innerHTML = ''; barsEl.innerHTML = ''; ins.textContent = '';
      var lines = Array.prototype.slice.call(code.querySelectorAll('.l'));
      lines.forEach(function (l, i) { later(function () { l.classList.add('hl'); }, i * 55); });
      later(function () { prog.classList.remove('go'); void prog.offsetWidth; prog.classList.add('go'); }, lines.length * 55);
      var t0 = lines.length * 55 + 650;
      later(function () {
        lines.forEach(function (l) { l.classList.remove('hl'); });
        cnt.textContent = rows.length + ' rows · ' + CH.rows.toLocaleString('en-IN') + ' customers';
        rows.forEach(function (r, i) {
          var tr = PF.el('tr', { class: 'pending' + (r[2] === top ? ' top' : '') });
          tr.appendChild(PF.el('td', null, r[0])); tr.appendChild(PF.el('td', null, r[1].toLocaleString('en-IN'))); tr.appendChild(PF.el('td', null, r[2].toFixed(1)));
          tbody.appendChild(tr);
          later(function () { tr.classList.remove('pending'); }, i * 110);
          var li = PF.el('li', { class: r[2] === top ? 'top' : '' }), k = PF.el('span', { class: 'k' });
          k.appendChild(document.createTextNode(r[0])); k.appendChild(PF.el('b', null, r[2].toFixed(1) + '%'));
          var trk = PF.el('span', { class: 'tr' }), fl = PF.el('span', { class: 'fl' }); trk.appendChild(fl);
          li.appendChild(k); li.appendChild(trk); barsEl.appendChild(li);
          later(function () { fl.style.width = (r[2] / 50 * 100) + '%'; }, 250 + i * 110);
        });
        later(function () { ins.textContent = sc.insight; runBtn.disabled = false; runBtn.textContent = 'Run again'; }, 250 + rows.length * 110 + 500);
      }, t0);
    }
    runBtn.addEventListener('click', run);
    PF.tabs(document.getElementById('wsTabs'), function (b) { load(b.dataset.s); });
    load('contract');
    PF.onView(ws, run, 0.35);
  }
})();
