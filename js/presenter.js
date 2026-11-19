(function () {
  const $ = (s) => document.querySelector(s);
  const P = window.PRES;
  const TITLES = { embr: 'eMBR / eDHR', capa: 'CAPA & Abweichungen', change: 'Änderungsmanagement', supplier: 'Lieferanten & Wareneingang', recall: 'Rückverfolgung & Rückruf', pms: 'Reklamationen & Vigilanz', calibration: 'Prüfmittel & Kalibrierung', training: 'Schulung & Befähigung', cleanroom: 'Reinraum & Umgebung', audit: 'Audit-Readiness', sterile: 'Sterilisation & Lohnfertigung' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ch = new BroadcastChannel('cc-present');
  const q = new URLSearchParams(location.search);
  let id = P.apps[q.get('id')] ? q.get('id') : 'capa';
  let si = 0, ai = 0, win = null, lastSeen = 0, found = null;
  const doneActs = {};

  const src = () => (id === 'embr' ? 'index.html' : 'app.html?id=' + id);
  const app = () => P.apps[id];
  const step = () => app().steps[si];
  const acts = () => step().acts || [];
  const key = () => id + ':' + si;

  function linkTerms(text) {
    const terms = Object.keys(P.glossary).sort((a, b) => b.length - a.length);
    const re = new RegExp('(?<![\\wÄÖÜäöüß-])(' + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\wÄÖÜäöüß])', 'g');
    return esc(text).replace(re, (m) => '<button class="term" data-term="' + m + '">' + m + '</button>');
  }

  function drawSteps() {
    $('#steps').innerHTML = app().steps.map((s, i) => '<button class="step' + (i === si ? ' cur' : '') + (doneActs[id + ':' + i] === (app().steps[i].acts || []).length && (app().steps[i].acts || []).length ? ' done' : '') + '" data-i="' + i + '"><b>' + (i + 1) + '. ' + esc(s.t) + '</b><small>' + (s.min || 0) + ' Min.' + (s.user ? ' · ' + esc(s.user) : '') + '</small></button>').join('');
  }

  function drawStage() {
    const s = step(), A = acts();
    const qa = (app().qa || []).map((x) => '<dt>' + linkTerms(x.q || x[0]) + '</dt><dd>' + linkTerms(x.a || x[1]) + '</dd>').join('');
    $('#stage').innerHTML =
      '<div class="pitch">' + linkTerms(app().pitch) + '</div>' +
      '<h2>' + (si + 1) + '. ' + esc(s.t) + '</h2>' +
      '<div class="meta"><span>' + (s.min || 0) + ' Min.</span>' + (s.user ? '<span>Rolle im Mockup: <b>' + esc(s.user) + '</b></span>' : '') + (s.view ? '<span>Ansicht: ' + esc(s.view) + '</span>' : '') + '</div>' +
      (s.say || []).map((t) => '<p class="say">' + linkTerms(t) + '</p>').join('') +
      (A.length ? '<h3>Bedienung im Mockup (rot umrandet)</h3><ol class="acts">' + A.map((a, i) => {
        const cls = i < ai ? 'done' : i === ai ? 'cur' : '';
        const st = i === ai ? (found === false ? '<span class="st bad">nicht gefunden</span>' : found ? '<span class="st">markiert</span>' : '') : '';
        return '<li class="act ' + cls + '"><span class="l">' + esc(a.l) + '</span>' + st + (i === ai ? '<button class="btn run" id="run">Ausführen ▶</button><button class="btn" id="skip">Überspringen</button>' : '') + '</li>';
      }).join('') + '</ol>' : '') +
      '<div class="bar"><button class="btn" id="prev">← Zurück</button><button class="btn primary" id="next">Nächster Schritt →</button></div>' +
      '<h3>Notizen</h3><textarea id="notes" aria-label="Notizen"></textarea>' +
      (qa ? '<h3>Mögliche Rückfragen</h3><dl class="qa">' + qa + '</dl>' : '');
    $('#notes').value = localStorage.getItem('pres-note:' + key()) || '';
    $('#notes').oninput = (e) => localStorage.setItem('pres-note:' + key(), e.target.value);
    drawGloss();
  }

  function drawGloss(hit) {
    const all = $('#gall').checked, f = $('#gq').value.toLowerCase();
    const list = (all ? Object.keys(P.glossary) : app().terms.filter((t) => P.glossary[t])).filter((t) => !f || (t + ' ' + P.glossary[t]).toLowerCase().includes(f)).sort((a, b) => a.localeCompare(b, 'de'));
    $('#gl').innerHTML = list.map((t) => '<dt id="g-' + encodeURIComponent(t) + '" class="' + (t === hit ? 'hit' : '') + '">' + esc(t) + '</dt><dd>' + esc(P.glossary[t]) + '</dd>').join('') || '<dd>Kein Treffer.</dd>';
    if (hit) { const el = document.getElementById('g-' + encodeURIComponent(hit)); if (el) el.scrollIntoView({ block: 'center' }); }
  }

  function hl() {
    found = null;
    const a = acts()[ai];
    ch.postMessage(a ? { t: 'hl', app: id, act: a } : { t: 'clear', app: id });
  }
  function draw() { drawSteps(); drawStage(); hl(); }

  function go(i) { si = Math.max(0, Math.min(app().steps.length - 1, i)); ai = 0; draw(); }
  function run() {
    const a = acts()[ai];
    if (!a) return;
    ch.postMessage({ t: 'do', app: id, act: a, n: ai });
  }
  function advance() { ai++; doneActs[key()] = Math.max(doneActs[key()] || 0, ai); draw(); }

  function setApp(n) {
    id = n; si = 0; ai = 0;
    $('#title').textContent = 'Referentenansicht · ' + TITLES[id];
    $('#app-sel').value = id;
    history.replaceState(null, '', '?id=' + id);
    if (win && !win.closed) win.location.href = 'ipad.html?src=' + encodeURIComponent(src());
    draw();
  }

  $('#app-sel').innerHTML = Object.keys(P.apps).map((k) => '<option value="' + k + '">' + esc(TITLES[k] || k) + '</option>').join('');
  $('#app-sel').onchange = (e) => setApp(e.target.value);
  $('#open').onclick = () => { win = window.open('ipad.html?src=' + encodeURIComponent(src()), 'ccmock'); };
  $('#reset').onclick = () => { ch.postMessage({ t: 'reset', app: id }); Object.keys(doneActs).forEach((k) => delete doneActs[k]); ai = 0; setTimeout(draw, 400); };
  $('#gq').oninput = () => drawGloss();
  $('#gall').onchange = () => drawGloss();

  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('step')) go(+t.dataset.i);
    else if (t.dataset.term) { if (!app().terms.includes(t.dataset.term)) $('#gall').checked = true; $('#gq').value = ''; drawGloss(t.dataset.term); }
    else if (t.id === 'run') run();
    else if (t.id === 'skip') advance();
    else if (t.id === 'next') go(si + 1);
    else if (t.id === 'prev') go(si - 1);
  });
  document.addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') go(si + 1);
    else if (e.key === 'ArrowLeft') go(si - 1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
  });

  ch.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.app && m.app !== id) return;
    if (m.t === 'ready') { lastSeen = Date.now(); hl(); }
    else if (m.t === 'state') { lastSeen = Date.now(); const f = m.found; if (f !== found) { found = f; drawStage(); } }
    else if (m.t === 'done') { if (m.n === ai && m.ok) advance(); else if (m.n === ai) { found = false; drawStage(); } }
  };

  // Herzschlag: Sperre im Mockup aktiv, solange diese Ansicht offen und das Mockup erreichbar ist.
  function beat() {
    ch.postMessage({ t: 'ping' });
    ch.postMessage({ t: 'lock', on: true });
    const on = Date.now() - lastSeen < 6000;
    const c = $('#conn');
    c.className = 'chip ' + (on ? 'on' : 'off');
    c.textContent = on ? 'Mockup verbunden – Bedienung nur hier' : 'Mockup nicht verbunden';
  }
  setInterval(beat, 2000);
  addEventListener('pagehide', () => ch.postMessage({ t: 'lock', on: false }));

  let t0 = 0, tick = null;
  $('#clock-btn').onclick = () => {
    if (tick) { clearInterval(tick); tick = null; $('#clock-btn').textContent = 'Start'; return; }
    t0 = Date.now() - (t0 ? 0 : 0);
    const base = Date.now();
    tick = setInterval(() => { const s = Math.floor((Date.now() - base) / 1000); $('#clock').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }, 500);
    $('#clock-btn').textContent = 'Stopp';
  };

  setApp(id);
  beat();
})();
