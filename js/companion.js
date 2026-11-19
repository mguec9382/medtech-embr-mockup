(function () {
  const TODAY = '2026-11-19';
  const DAY = 864e5;
  const d = (n) => new Date(Date.parse(TODAY) + n * DAY).toISOString().slice(0, 10);
  const diff = (iso) => Math.round((Date.parse(iso) - Date.parse(TODAY)) / DAY);
  const fmt = (iso) => (iso ? iso.split('-').reverse().join('.') : '–');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const $ = (s) => document.querySelector(s);
  const SYS = { BC: 'sys-bc', Anyfy: 'sys-anyfy', 'COSMO QA': 'sys-cosmo', 'COSMO UDI': 'sys-cosmo' };
  const apps = {};
  const tone = (map) => (v) => { const k = Object.keys(map).find((x) => String(v).startsWith(x)); return k ? map[k] : ''; };

  window.CC = { TODAY, d, diff, fmt, apps, tone, define: (s) => { apps[s.id] = s; }, run };

  let spec, S, ui, tabId;

  const load = () => {
    try { const s = JSON.parse(localStorage.getItem('cc-app-' + spec.id)); if (s) return s; } catch { /* neu starten */ }
    return { e: spec.seed(), log: [], day: TODAY };
  };
  const save = () => localStorage.setItem('cc-app-' + spec.id, JSON.stringify(S));

  function val(col, r) { return col.fn ? col.fn(r, S.e) : r[col.key]; }

  function cell(col, r) {
    const v = val(col, r);
    if (col.kind === 'spark') return spark(r.hist, r.min, r.max);
    if (col.kind === 'date') return esc(fmt(v));
    if (col.tone) return `<span class="chip-s ${col.tone(v, r)}">${esc(v)}</span>`;
    return esc(v);
  }

  function spark(h = [], min, max) {
    if (!h.length) return '';
    const lo = Math.min(min, ...h), hi = Math.max(max, ...h), w = 90, ht = 26;
    const y = (v) => ht - 2 - ((v - lo) / (hi - lo || 1)) * (ht - 4);
    const pts = h.map((v, i) => `${(i / Math.max(h.length - 1, 1)) * w},${y(v)}`).join(' ');
    return `<svg class="spark" width="${w}" height="${ht}" viewBox="0 0 ${w} ${ht}"><line x1="0" x2="${w}" y1="${y(max)}" y2="${y(max)}" stroke="#AA4628" stroke-dasharray="2 2"/><line x1="0" x2="${w}" y1="${y(min)}" y2="${y(min)}" stroke="#AA4628" stroke-dasharray="2 2"/><polyline fill="none" stroke="#B39C4D" stroke-width="2" points="${pts}"/></svg>`;
  }

  function actionButtons(acts, r, key) {
    return (acts || []).map((a, i) => (!a.when || a.when(r, S.e) ? `<button class="ab ${a.danger ? 'danger' : ''}" data-act="${key}|${i}">${esc(a.label)}</button>` : '')).join('');
  }

  function tableTab(t) {
    const all = S.e[t.entity];
    const by = t.filterBy || ((r) => r.status);
    const opts = [...new Set(all.map((r) => by(r, S.e)))];
    const f = ui.filter[t.id] || 'Alle';
    const rows = all.map((r, i) => ({ r, i })).filter((x) => f === 'Alle' || by(x.r, S.e) === f);
    const bar = `<div class="bar">${['Alle', ...opts].map((o) => `<button class="pill" data-filter="${esc(o)}" aria-pressed="${o === f}">${esc(o)}</button>`).join('')}<span class="grow"></span>${t.add ? `<button class="ab" data-add="1">+ ${esc(t.add.label)}</button>` : ''}</div>`;
    const head = t.columns.map((c) => `<th>${esc(c.label)}</th>`).join('') + (t.actions ? '<th></th>' : '');
    const body = rows.map(({ r, i }) => `<tr>${t.columns.map((c) => `<td>${cell(c, r)}</td>`).join('')}${t.actions ? `<td class="acts">${actionButtons(t.actions, r, t.id + '|' + i)}</td>` : ''}</tr>`).join('');
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}${bar}<div class="tbl-wrap"><table class="tbl"><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="9" class="empty">Keine Einträge.</td></tr>`}</tbody></table></div>`;
  }

  function lookupTab(t) {
    const q = ui.q[t.id] || '';
    const all = S.e[t.entity];
    const idx = all.findIndex((r) => String(r[t.key]).toLowerCase() === q.trim().toLowerCase());
    const r = all[idx];
    const samples = all.slice(0, 4).map((x) => `<button class="pill" data-q="${esc(x[t.key])}">${esc(x[t.key])}</button>`).join('');
    let out = '';
    if (q && !r) out = `<p class="verdict bad">Nicht gefunden: ${esc(q)}</p>`;
    if (r) {
      const v = t.verdict && t.verdict(r, S.e);
      out = `<div class="card">${v ? `<div class="verdict ${v.tone}"><b>${esc(v.title)}</b>${v.text ? `<br>${esc(v.text)}` : ''}</div>` : ''}
        <dl>${t.card.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${cell(c, r)}</dd></div>`).join('')}</dl>
        ${(t.related || []).map((rel) => relTable(rel, r)).join('')}
        <div>${actionButtons(t.actions, r, t.id + '|' + idx)}</div></div>`;
    }
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}<div class="look"><div class="row"><input id="lk" value="${esc(q)}" placeholder="${esc(t.placeholder)}" aria-label="${esc(t.placeholder)}"><button class="btn primary" data-go="1">${esc(t.button || 'Suchen')}</button></div><div class="row"><span class="muted small">Beispiele:</span>${samples}</div>${out}</div>`;
  }

  function relTable(rel, r) {
    const rows = S.e[rel.entity].filter((x) => x[rel.by] === r[rel.from || rel.by]);
    return `<div><h3>${esc(rel.title)}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr>${rel.columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map((x) => `<tr>${rel.columns.map((c) => `<td>${cell(c, x)}</td>`).join('')}</tr>`).join('') || '<tr><td class="empty">Keine Einträge.</td></tr>'}</tbody></table></div></div>`;
  }

  function checkTab(t) {
    const v = ui.sel[t.id] || {};
    const selects = t.selects.map((s) => `<label class="small">${esc(s.label)}<br><select data-sel="${s.key}"><option value="">– wählen –</option>${S.e[s.entity].map((r) => `<option value="${esc(s.value(r))}" ${v[s.key] === s.value(r) ? 'selected' : ''}>${esc(s.text(r))}</option>`).join('')}</select></label>`).join('');
    const res = t.selects.every((s) => v[s.key]) ? t.verdict(v, S.e) : null;
    const out = res ? `<div class="verdict ${res.tone}"><b>${esc(res.title)}</b>${res.text ? `<br>${esc(res.text)}` : ''}</div>${t.action && res.tone !== 'bad' ? `<div><button class="ab" data-check="1">${esc(t.action.label)}</button></div>` : ''}` : '';
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}<div class="look"><div class="row">${selects}</div>${out}</div>`;
  }

  function matrixTab(t) {
    const cols = S.e[t.colEntity];
    const head = `<th></th>${cols.map((c) => `<th>${esc(t.colLabel(c))}</th>`).join('')}`;
    const body = S.e[t.rowEntity].map((r) => `<tr><td>${esc(t.rowLabel(r))}</td>${cols.map((c) => { const x = t.cell(r, c, S.e); return `<td><span class="chip-s ${x.tone}">${esc(x.text)}</span></td>`; }).join('')}</tr>`).join('');
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}<div class="tbl-wrap"><table class="tbl matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function logTab() {
    const items = spec.integrations.map((i) => `<div class="card"><span class="sys ${SYS[i.sys]}">${esc(i.sys)}</span><p class="small">${esc(i.text)}</p></div>`).join('');
    const rows = S.log.map((l) => `<tr><td>${esc(l.t)}</td><td><span class="sys ${SYS[l.sys]}">${esc(l.sys)}</span></td><td>${esc(l.text)}</td><td>${esc(l.user)}</td></tr>`).join('');
    return `<p class="note">Jede Aktion wird als Ereignis an die angebundenen Systeme übergeben und im Prüfpfad festgehalten. Im Demonstrator sind die Aufrufe simuliert.</p><div class="int-grid">${items}</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Zeit</th><th>System</th><th>Ereignis</th><th>Benutzer</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="empty">Noch keine Aktionen.</td></tr>'}</tbody></table></div>`;
  }

  function render() {
    const tabs = [...spec.tabs, { id: '_log', title: 'Integration & Prüfpfad' }];
    const t = tabs.find((x) => x.id === tabId) || tabs[0];
    tabId = t.id;
    const body = t.id === '_log' ? logTab() : ({ table: tableTab, lookup: lookupTab, check: checkTab, matrix: matrixTab })[t.type](t);
    $('#app').innerHTML = `<div class="app-head"><div><h1>${esc(spec.title)}</h1><p class="sub">${esc(spec.subtitle)}</p><span class="role">Rolle: ${esc(spec.role)}</span></div>
      <div class="ints">${spec.integrations.map((i) => `<span class="sys ${SYS[i.sys]}" title="${esc(i.text)}">${esc(i.sys)}</span>`).join('')}</div></div>
      <div class="kpis">${spec.kpis.map((k) => { const v = k.fn(S.e); return `<div class="kpi ${k.tone ? k.tone(v) : ''}"><b>${esc(v)}</b><span>${esc(k.label)}</span></div>`; }).join('')}</div>
      <div class="tabs" role="tablist">${tabs.map((x) => `<button role="tab" data-tab="${x.id}" aria-selected="${x.id === tabId}">${esc(x.title)}${x.id === '_log' ? ` (${S.log.length})` : ''}</button>`).join('')}</div>${body}`;
  }

  function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 4500); }

  function emit(evs) {
    [].concat(evs || []).forEach((ev) => {
      S.log.unshift({ t: new Date().toLocaleTimeString('de-DE'), sys: ev.sys, text: ev.text, user: 'M. Beispiel' });
      toast(`${ev.sys}: ${ev.text}`);
    });
    save();
    render();
  }

  function openForm(title, fields, cb) {
    $('#form-title').textContent = title;
    $('#form-fields').innerHTML = fields.map((f) => {
      const opts = typeof f.options === 'function' ? f.options(S.e) : f.options;
      const input = opts ? `<select name="${f.key}" required>${opts.map((o) => `<option>${esc(o)}</option>`).join('')}</select>` : `<input name="${f.key}" type="${f.type || 'text'}" ${f.step ? `step="${f.step}"` : ''} value="${esc(f.value ?? '')}" required>`;
      return `<label>${esc(f.label)}${input}</label>`;
    }).join('');
    const dlg = $('#form-dlg');
    $('#form').onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); dlg.close(); cb(v); };
    dlg.showModal();
  }

  function findTab(id) { return spec.tabs.find((x) => x.id === id); }

  function click(e) {
    const b = e.target.closest('button');
    if (!b) return;
    const t = findTab(tabId);
    if (b.dataset.tab) { tabId = b.dataset.tab; render(); return; }
    if (b.dataset.filter) { ui.filter[tabId] = b.dataset.filter; render(); return; }
    if (b.dataset.q !== undefined) { ui.q[tabId] = b.dataset.q; render(); return; }
    if (b.dataset.go) { ui.q[tabId] = $('#lk').value; render(); return; }
    if (b.dataset.add) { openForm(t.add.label, t.add.fields, (v) => { const r = t.add.make(v, S.e); S.e[t.entity].unshift(r); emit(t.add.event(r, S.e)); }); return; }
    if (b.dataset.check) { emit(t.action.apply(ui.sel[tabId], S.e)); return; }
    if (b.dataset.act) {
      const [, i, ai] = b.dataset.act.split('|');
      const row = S.e[t.entity][Number(i)];
      const act = t.actions[Number(ai)];
      const go = (v) => emit(act.apply(row, S.e, v));
      if (act.fields) openForm(act.label, act.fields, go); else go({});
    }
  }

  function run(id) {
    spec = apps[id];
    if (!spec) { $('#app').innerHTML = '<p class="verdict bad">Unbekannte App.</p>'; return; }
    document.title = `${spec.title} | COSMO CONSULT`;
    $('#app-name').textContent = spec.title;
    S = load();
    ui = { filter: {}, q: {}, sel: {} };
    tabId = spec.tabs[0].id;
    document.addEventListener('click', click);
    document.addEventListener('change', (e) => { if (e.target.dataset.sel) { (ui.sel[tabId] ||= {})[e.target.dataset.sel] = e.target.value; render(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'lk') { ui.q[tabId] = e.target.value; render(); } });
    $('#form-x').onclick = $('#form-cancel').onclick = () => $('#form-dlg').close();
    $('#reset').onclick = () => { localStorage.removeItem('cc-app-' + spec.id); S = load(); ui = { filter: {}, q: {}, sel: {} }; render(); toast('Demodaten zurückgesetzt'); };
    render();
  }
})();
