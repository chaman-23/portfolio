/* Experience: scroll-progress timeline, IHRO stage explorer, AS-IS / TO-BE comparison, SmartHomie path. */
(function () {
  'use strict';
  var PF = window.PF;

  /* Timeline line fills as you scroll */
  var journey = document.getElementById('journey');
  if (journey) {
    var items = Array.prototype.slice.call(journey.querySelectorAll('.journey__item'));
    var ticking = false;
    function update() {
      ticking = false;
      var r = journey.getBoundingClientRect(), mid = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      journey.style.setProperty('--prog', (p * 100).toFixed(1) + '%');
      items.forEach(function (it) { it.classList.toggle('reached', it.getBoundingClientRect().top + 14 < mid); });
    }
    if (PF.reduce) { journey.style.setProperty('--prog', '100%'); items.forEach(function (it) { it.classList.add('reached'); }); }
    else {
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* IHRO stage explorer */
  var rail = document.querySelector('.stages__rail');
  if (rail) {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.stages__panels .stage'));
    var fill = document.getElementById('stagesFill');
    var t = PF.tabs(rail, function (btn, i) {
      panels.forEach(function (p, j) { p.hidden = i !== j; if (i === j) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); } });
      t && t.buttons.forEach(function (b, j) { b.classList.toggle('done', j < i); });
      fill.style.width = (i / 4 * 100) + '%';
    });
    panels.forEach(function (p, j) { p.hidden = j !== 0; });
  }

  /* AS-IS / TO-BE grievance workflow (illustrative) */
  var flows = {
    asis: [
      { s: 'Complaint arrives', d: 'Phone, email, walk-in or social media.', c: '', why: '' },
      { s: 'Logged inconsistently', d: 'Free-text notes; no standard case categories.', c: 'b', why: 'Bottleneck: cases can’t be grouped or counted' },
      { s: 'Picked up informally', d: 'Whoever is available takes it on.', c: 'g', why: 'Ownership gap: no named owner' },
      { s: 'Follow-up when remembered', d: 'No status or time limit.', c: 'b', why: 'Bottleneck: cases stall without escalation' },
      { s: 'Closed off the record', d: 'Resolution isn’t captured for reporting.', c: 'g', why: 'Gap: leadership can’t see outcomes' }
    ],
    tobe: [
      { s: 'One registration step', d: 'Every channel feeds the same case form.', c: 'f', why: 'Standardised case registration' },
      { s: 'Categorised on entry', d: 'Case categories defined in the BRD.', c: 'f', why: 'Cases can be grouped and counted' },
      { s: 'Owner assigned', d: 'Each category maps to a responsible team.', c: 'f', why: 'Clear ownership' },
      { s: 'Escalation rules', d: 'Overdue or serious cases move up automatically.', c: 'f', why: 'Nothing stalls silently' },
      { s: 'Tracked to closure', d: 'Status and reporting fields on every case.', c: 'f', why: 'Outcomes visible to leadership' }
    ]
  };
  var flowEl = document.getElementById('flow');
  function renderFlow(v) {
    flowEl.innerHTML = '';
    flows[v].forEach(function (st, i) {
      var li = PF.el('li', { class: st.c });
      li.style.animationDelay = (PF.reduce ? 0 : i * 70) + 'ms';
      li.appendChild(PF.el('b', null, st.s));
      li.appendChild(document.createTextNode(st.d));
      if (st.why) li.appendChild(PF.el('span', { class: 'why' }, st.why));
      flowEl.appendChild(li);
    });
  }
  if (flowEl) { renderFlow('asis'); PF.tabs(document.getElementById('flowTabs'), function (b) { renderFlow(b.dataset.v); }); }

  /* SmartHomie path */
  var path = document.getElementById('path');
  if (path) {
    Array.prototype.forEach.call(path.children, function (li, i) { li.style.setProperty('--i', i); });
    PF.onView(path, function () { path.classList.add('in'); }, 0.5);
  }
})();
