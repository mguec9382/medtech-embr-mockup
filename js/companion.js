(function () {
  const TODAY = '2026-11-19';
  const DAY = 864e5;
  const PIN = '1234';
  const d = (n) => new Date(Date.parse(TODAY) + n * DAY).toISOString().slice(0, 10);
  const diff = (iso) => Math.round((Date.parse(iso) - Date.parse(TODAY)) / DAY);
  const fmt = (iso) => (iso ? iso.split('-').reverse().join('.') : '–');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const $ = (s) => document.querySelector(s);
  const SYS = { BC: 'sys-bc', Anyfy: 'sys-anyfy', 'COSMO QA': 'sys-cosmo', 'COSMO UDI': 'sys-cosmo' };
  const USERS = [
    { id: 'u1', name: 'A. Weber', role: 'QA' },
    { id: 'u2', name: 'S. Hoffmann', role: 'RA' },
    { id: 'u3', name: 'K. Braun', role: 'Produktion' },
    { id: 'u4', name: 'M. Richter', role: 'Einkauf' },
    { id: 'u5', name: 'Dr. P. Lange', role: 'Leitung' },
    { id: 'u6', name: 'J. Auditor', role: 'Auditor' }
  ];
  const apps = {};
  const enh = {};
  const tone = (map) => (v) => { const k = Object.keys(map).find((x) => String(v).startsWith(x)); return k ? map[k] : ''; };

  window.CC = { TODAY, d, diff, fmt, apps, tone, define: (s) => { apps[s.id] = s; }, enhance: (id, tabId, map) => { (enh[id] ||= []).push([tabId, map]); }, run };

  let spec, S, ui, tabId;

  const cur = () => USERS.find((u) => u.id === S.user) || USERS[0];
  const allowed = (a) => cur().role !== 'Auditor' && (!a.roles || a.roles.includes(cur().role));
  const refOf = (t, r) => String(t.type === 'lookup' ? r[t.key] : t.columns && t.columns[0].key ? r[t.columns[0].key] : '');
  const hashOf = (l) => window.EMBR.sha256(JSON.stringify([l.seq, l.t, l.sys, l.text, l.user, l.role, l.ref, l.sig, l.prev]));

  function chain(s, ev) {
    const prev = s.log.length ? s.log[s.log.length - 1].hash : 'GENESIS';
    const u = ev.by || { name: cur0(s).name, role: cur0(s).role };
    const l = { seq: s.log.length + 1, t: new Date().toISOString(), sys: ev.sys, text: ev.text, user: u.name, role: u.role, ref: ev.ref || '', sig: ev.sig || null, prev };
    l.hash = hashOf(l);
    s.log.push(l);
  }
  const cur0 = (s) => USERS.find((u) => u.id === s.user) || USERS[0];

  const load = () => {
    try { const s = JSON.parse(localStorage.getItem('cc-app-' + spec.id)); if (s && s.log && s.log.every((l) => l.hash)) return s; } catch { /* neu starten */ }
    const s = { e: spec.seed(), log: [], user: (USERS.find((u) => u.role === spec.start) || USERS[0]).id };
    chain(s, { sys: 'BC', text: 'Demo-Bestand aus Business Central übernommen (Stammdaten, Chargen, Aufträge)', by: { name: 'System', role: 'System' } });
    return s;
  };
  const save = () => localStorage.setItem('cc-app-' + spec.id, JSON.stringify(S));

  function applyEnh() {
    if (spec._enh) return;
    spec._enh = true;
    (enh[spec.id] || []).forEach(([tid, map]) => {
      if (tid === '_') { Object.assign(spec, map); return; }
      const t = spec.tabs.find((x) => x.id === tid);
      if (!t) return;
      Object.entries(map).forEach(([k, v]) => {
        if (k === '_flow') t.flow = v;
        else (t.actions || []).filter((a) => a.label.startsWith(k)).forEach((a) => Object.assign(a, v));
      });
    });
  }

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
    return (acts || []).map((a, i) => {
      if (a.when && !a.when(r, S.e)) return '';
      const ok = allowed(a);
      const why = ok ? (a.sign ? 'Mit elektronischer Signatur' : 'Mit Bestätigung') : (cur().role === 'Auditor' ? 'Auditor: nur Lesezugriff' : `Erfordert Rolle ${a.roles.join(' / ')}`);
      return `<button class="ab ${a.danger ? 'danger' : ''}" data-act="${key}|${i}" ${ok ? '' : 'disabled'} title="${esc(why)}">${esc(a.label)}${a.sign ? ' ✎' : ''}</button>`;
    }).join('');
  }

  function csv(name, head, rows) {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const txt = '\ufeff' + [head, ...rows].map((r) => r.map(q).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv' }));
    a.download = name + '.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return rows.length;
  }

  function tableTab(t) {
    const all = S.e[t.entity];
    const by = t.filterBy || ((r) => r.status);
    const opts = [...new Set(all.map((r) => by(r, S.e)))];
    const f = ui.filter[t.id] || 'Alle';
    const s = (ui.s[t.id] || '').toLowerCase();
    const rows = all.map((r, i) => ({ r, i })).filter((x) => (f === 'Alle' || by(x.r, S.e) === f) && (!s || t.columns.map((c) => val(c, x.r)).join(' ').toLowerCase().includes(s)));
    const bar = `<div class="bar">${['Alle', ...opts].map((o) => `<button class="pill" data-filter="${esc(o)}" aria-pressed="${o === f}">${esc(o)}</button>`).join('')}<span class="grow"></span><input class="srch" data-search="1" value="${esc(ui.s[t.id] || '')}" placeholder="Suchen …" aria-label="Suchen"><button class="ab" data-csv="${t.id}">CSV</button>${t.add ? `<button class="ab" data-add="1" ${cur().role === 'Auditor' ? 'disabled' : ''}>+ ${esc(t.add.label)}</button>` : ''}</div>`;
    const head = t.columns.map((c) => `<th>${esc(c.label)}</th>`).join('') + (t.actions ? '<th></th>' : '');
    const body = rows.map(({ r, i }) => `<tr class="clk" data-row="${t.id}|${i}" tabindex="0">${t.columns.map((c) => `<td>${cell(c, r)}</td>`).join('')}${t.actions ? `<td class="acts">${actionButtons(t.actions, r, t.id + '|' + i)}</td>` : ''}</tr>`).join('');
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
      const hist = S.log.filter((l) => l.ref === String(r[t.key])).reverse();
      out = `<div class="card">${v ? `<div class="verdict ${v.tone}"><b>${esc(v.title)}</b>${v.text ? `<br>${esc(v.text)}` : ''}</div>` : ''}
        <dl>${t.card.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${cell(c, r)}</dd></div>`).join('')}</dl>
        ${(t.related || []).map((rel) => relTable(rel, r)).join('')}
        <div>${actionButtons(t.actions, r, t.id + '|' + idx)}</div>
        ${hist.length ? `<div><h3>Verlauf</h3>${timeline(hist)}</div>` : ''}</div>`;
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
    const out = res ? `<div class="verdict ${res.tone}"><b>${esc(res.title)}</b>${res.text ? `<br>${esc(res.text)}` : ''}</div>${t.action && res.tone !== 'bad' ? `<div><button class="ab" data-check="1" ${cur().role === 'Auditor' ? 'disabled' : ''}>${esc(t.action.label)}</button></div>` : ''}` : '';
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}<div class="look"><div class="row">${selects}</div>${out}</div>`;
  }

  function matrixTab(t) {
    const cols = S.e[t.colEntity];
    const head = `<th></th>${cols.map((c) => `<th>${esc(t.colLabel(c))}</th>`).join('')}`;
    const body = S.e[t.rowEntity].map((r) => `<tr><td>${esc(t.rowLabel(r))}</td>${cols.map((c) => { const x = t.cell(r, c, S.e); return `<td><span class="chip-s ${x.tone}">${esc(x.text)}</span></td>`; }).join('')}</tr>`).join('');
    return `${t.note ? `<p class="note">${esc(t.note)}</p>` : ''}<div class="tbl-wrap"><table class="tbl matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function timeline(items) {
    return `<ul class="tl">${items.map((l) => `<li><span class="sys ${SYS[l.sys] || ''}">${esc(l.sys)}</span> ${esc(l.text)}${l.sig ? ` <span class="chip-s ok">E-Signatur: ${esc(l.sig.meaning)}</span>` : ''}<small>${new Date(l.t).toLocaleString('de-DE')} · ${esc(l.user)} (${esc(l.role)}) · freigegeben durch Mensch</small></li>`).join('')}</ul>`;
  }

  function tasksFor() {
    const seen = new Set();
    const tasks = [];
    spec.tabs.filter((t) => t.type === 'table').forEach((t) => S.e[t.entity].forEach((r, i) => {
      const k = t.entity + i;
      if (seen.has(k)) return;
      const acts = (t.actions || []).filter((a) => (!a.when || a.when(r, S.e)) && allowed(a));
      if (acts.length) { seen.add(k); tasks.push({ t, r, i }); }
    }));
    return tasks;
  }

  const unread = () => S.log.filter((l) => l.seq > ((S.seen || {})[S.user] || 0) && l.user !== cur().name);

  function locate(ref) {
    for (const t of spec.tabs.filter((x) => x.type === 'table')) {
      const i = S.e[t.entity].findIndex((r) => refOf(t, r) === ref);
      if (i >= 0) return `${t.id}|${i}`;
    }
    return '';
  }

  function renderBell() {
    const tasks = tasksFor();
    const un = unread();
    const n = tasks.length + un.length;
    const b = $('#bell-n');
    b.textContent = n > 99 ? '99+' : n;
    b.hidden = !n;
    $('#bell').setAttribute('aria-label', `Benachrichtigungen, ${n} neu`);
    const p = $('#notif');
    if (p.hidden) return;
    const task = tasks.slice(0, 5).map(({ t, r, i }) => `<li><button class="nitem" data-row="${t.id}|${i}"><b>Entscheidung erforderlich</b><span>${esc(refOf(t, r))} · ${esc(t.title)}</span></button></li>`).join('');
    const chg = un.slice().reverse().slice(0, 6).map((l) => { const loc = l.ref ? locate(l.ref) : ''; return `<li><button class="nitem" ${loc ? `data-row="${loc}"` : 'data-nop="1"'}><b>${esc(l.user)} · ${esc(l.sys)}</b><span>${esc(l.text)}</span><small>${new Date(l.t).toLocaleTimeString('de-DE')}${l.sig ? ' · E-Signatur' : ''}</small></button></li>`; }).join('');
    p.innerHTML = `<header><b>Mitteilungen</b><button class="ab" data-readall="1">Alle gelesen</button></header>
      <h4>Warten auf Ihre Entscheidung (${tasks.length})</h4><ul>${task || '<li class="muted small">Keine offenen Entscheidungen.</li>'}</ul>
      <h4>Änderungen durch andere (${un.length})</h4><ul>${chg || '<li class="muted small">Keine neuen Änderungen. Wechseln Sie den Benutzer, um Änderungen anderer zu sehen.</li>'}</ul>`;
  }

  function overview() {
    const tasks = tasksFor();
    const rows = tasks.slice(0, 8).map(({ t, r, i }) => `<tr class="clk" data-row="${t.id}|${i}" tabindex="0"><td>${esc(refOf(t, r))}</td><td>${esc(t.title)}</td><td>${esc(t.columns[1] ? val(t.columns[1], r) : '')}</td><td class="acts"><button class="ab" data-row="${t.id}|${i}">Prüfen &amp; entscheiden</button></td></tr>`).join('');
    const tbls = [];
    const ents = new Set();
    spec.tabs.filter((t) => t.type === 'table' && !ents.has(t.entity) && ents.add(t.entity)).forEach((t) => tbls.push(t));
    const charts = tbls.map((t) => {
      const by = t.filterBy || ((r) => r.status);
      const cnt = {};
      S.e[t.entity].forEach((r) => { const k = by(r, S.e); cnt[k] = (cnt[k] || 0) + 1; });
      const max = Math.max(...Object.values(cnt), 1);
      const col = t.columns.find((c) => c.tone);
      return `<div class="card"><h3>${esc(t.title)}</h3>${Object.entries(cnt).map(([k, n]) => { let tn = ''; try { tn = col ? col.tone(k, {}) : ''; } catch { /* neutral */ } return `<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><i class="${tn}" style="width:${(n / max) * 100}%"></i></div><b>${n}</b></div>`; }).join('')}</div>`;
    }).join('');
    const bySys = {};
    S.log.forEach((l) => { bySys[l.sys] = (bySys[l.sys] || 0) + 1; });
    return `<div class="hitl"><b>Human in the Loop:</b> Das System macht nur Vorschläge. Jede Änderung, jeder Aufruf an Business Central, COSMO-Produkte und Anyfy und jede Meldung wird erst nach Prüfung der Vorschau und Bestätigung durch einen berechtigten Menschen ausgeführt. Kritische Schritte brauchen zusätzlich eine elektronische Signatur und das Vier-Augen-Prinzip.</div>
      <h2 class="h2">Aufgaben für ${esc(cur().name)} (${esc(cur().role)})</h2>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Vorgang</th><th>Bereich</th><th>Bezeichnung</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="empty">Keine offenen Entscheidungen für diese Rolle.</td></tr>'}</tbody></table></div>
      <h2 class="h2">Status</h2><div class="int-grid">${charts}<div class="card"><h3>Aktivität nach System</h3>${Object.entries(bySys).map(([k, n]) => `<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><i style="width:${(n / Math.max(...Object.values(bySys))) * 100}%"></i></div><b>${n}</b></div>`).join('')}</div></div>`;
  }

  function verify() {
    let prev = 'GENESIS';
    for (const l of S.log) {
      if (l.prev !== prev || l.hash !== hashOf(l)) return { ok: false, seq: l.seq };
      prev = l.hash;
    }
    return { ok: true, n: S.log.length };
  }

  function logTab() {
    const items = spec.integrations.map((i) => `<div class="card"><span class="sys ${SYS[i.sys]}">${esc(i.sys)}</span><p class="small">${esc(i.text)}</p></div>`).join('');
    const v = ui.verify;
    const banner = v ? `<div class="verdict ${v.ok ? 'ok' : 'bad'}"><b>${v.ok ? `Prüfpfad unverändert (${v.n} Einträge, Hash-Kette lückenlos)` : `Manipulation erkannt ab Eintrag ${v.seq}`}</b></div>` : '';
    const rows = S.log.slice().reverse().map((l) => `<tr${v && !v.ok && l.seq === v.seq ? ' class="broken"' : ''}><td>${l.seq}</td><td>${new Date(l.t).toLocaleString('de-DE')}</td><td><span class="sys ${SYS[l.sys] || ''}">${esc(l.sys)}</span></td><td>${esc(l.text)}</td><td>${esc(l.user)} (${esc(l.role)})</td><td>${l.sig ? `<span class="chip-s ok">${esc(l.sig.meaning)}</span>` : ''}</td><td><code>${l.hash.slice(0, 10)}</code></td></tr>`).join('');
    return `<p class="note">Jeder bestätigte Schritt wird als Ereignis an die angebundenen Systeme übergeben und in einer Hash-Kette festgehalten (SHA-256, jeder Eintrag enthält den Hash des Vorgängers). Im Demonstrator sind die Aufrufe simuliert.</p><div class="int-grid">${items}</div>
      <div class="bar"><button class="ab" data-verify="1">Integrität prüfen</button><button class="ab danger" data-tamper="1">Manipulation simulieren</button><span class="grow"></span><button class="ab" data-csv="_log">CSV</button></div>${banner}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Zeit</th><th>System</th><th>Ereignis</th><th>Benutzer</th><th>Signatur</th><th>Hash</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function stepper(t, r) {
    if (!t.flow) return '';
    const by = (t.filterBy || ((x) => x.status))(r, S.e);
    const i = t.flow.indexOf(by);
    return `<ol class="stepper">${t.flow.map((s, n) => `<li class="${i === n ? 'now' : i > n ? 'done' : ''}">${esc(s)}</li>`).join('')}</ol>${i < 0 ? `<p class="small muted">Aktueller Status: ${esc(by)}</p>` : ''}`;
  }

  function renderDetail() {
    const dlg = $('#detail-dlg');
    if (!ui.detail) { if (dlg.open) dlg.close(); return; }
    const [tid, i] = ui.detail.split('|');
    const t = findTab(tid);
    const r = t && S.e[t.entity][Number(i)];
    if (!r) { ui.detail = null; if (dlg.open) dlg.close(); return; }
    const ref = refOf(t, r);
    $('#detail').innerHTML = `<header><h2>${esc(ref)} · ${esc(t.columns[1] ? val(t.columns[1], r) : t.title)}</h2><button type="button" class="x" data-close="detail" aria-label="Schließen">×</button></header>
      <div class="fields">${stepper(t, r)}<dl class="dl">${t.columns.map((c) => `<div><dt>${esc(c.label)}</dt><dd>${cell(c, r)}</dd></div>`).join('')}</dl>
      <div class="det-acts">${actionButtons(t.actions, r, t.id + '|' + i) || '<span class="muted small">Keine Aktion verfügbar.</span>'}</div>
      <h3>Verlauf &amp; Signaturen</h3>${timeline(S.log.filter((l) => l.ref === ref).reverse()) || ''}${S.log.some((l) => l.ref === ref) ? '' : '<p class="muted small">Noch keine Einträge.</p>'}</div>`;
    if (!dlg.open) dlg.showModal();
  }

  function render() {
    const tabs = [{ id: '_ov', title: 'Übersicht' }, ...spec.tabs, { id: '_log', title: 'Prüfpfad & Integration' }];
    const t = tabs.find((x) => x.id === tabId) || tabs[0];
    tabId = t.id;
    const body = t.id === '_log' ? logTab() : t.id === '_ov' ? overview() : ({ table: tableTab, lookup: lookupTab, check: checkTab, matrix: matrixTab })[t.type](t);
    $('#user-sel').value = S.user;
    $('#app').innerHTML = `<div class="app-head"><div><h1>${esc(spec.title)}</h1><p class="sub">${esc(spec.subtitle)}</p><span class="role">Fachbereich: ${esc(spec.role)}</span></div>
      <div class="ints">${spec.integrations.map((i) => `<span class="sys ${SYS[i.sys]}" title="${esc(i.text)}">${esc(i.sys)}</span>`).join('')}</div></div>
      <div class="kpis">${spec.kpis.map((k) => { const v = k.fn(S.e); return `<div class="kpi ${k.tone ? k.tone(v) : ''}"><b>${esc(v)}</b><span>${esc(k.label)}</span></div>`; }).join('')}</div>
      <div class="tabs" role="tablist">${tabs.map((x) => `<button role="tab" data-tab="${x.id}" aria-selected="${x.id === tabId}">${esc(x.title)}${x.id === '_log' ? ` (${S.log.length})` : ''}</button>`).join('')}</div>${body}`;
    renderDetail();
    renderBell();
  }

  function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 4500); }

  function emit(evs, opts = {}) {
    [].concat(evs || []).forEach((ev) => {
      chain(S, { ...ev, ref: opts.ref, sig: opts.sig });
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

  // Human in the Loop: jede Aktion zeigt zuerst die Vorschau der Folgen und wartet auf die Bestätigung.
  function confirmStep({ title, ref, act, preview, sign }, cb) {
    const dlg = $('#sign-dlg');
    $('#sign-title').textContent = sign ? 'Prüfen und elektronisch signieren' : 'Prüfen und bestätigen';
    $('#sign-what').textContent = `${title}${ref ? ' · ' + ref : ''}`;
    $('#sign-user').textContent = `${cur().name} (${cur().role})`;
    $('#sign-prev').innerHTML = preview.length ? preview.map((p) => `<li><span class="sys ${SYS[p.sys] || ''}">${esc(p.sys)}</span> ${esc(p.text)}</li>`).join('') : '<li class="muted">Keine Aufrufe an externe Systeme.</li>';
    $('#sign-sig').hidden = !sign;
    $('#sign-meaning').textContent = sign || '';
    $('#sign-pw').required = !!sign;
    $('#sign-pw').value = '';
    $('#sign-err').hidden = true;
    $('#sign-ok').textContent = sign ? 'Signieren und ausführen' : 'Bestätigen und ausführen';
    $('#sign-form').onsubmit = (e) => {
      e.preventDefault();
      if (sign && $('#sign-pw').value !== PIN) {
        chain(S, { sys: 'Anyfy', text: `E-Signatur abgelehnt: Re-Authentifizierung für ${cur().name} fehlgeschlagen (${sign})`, ref });
        save();
        $('#sign-err').hidden = false;
        $('#sign-pw').select();
        return;
      }
      dlg.close();
      cb(sign ? { meaning: sign, user: cur().name, role: cur().role } : null);
    };
    dlg.showModal();
    if (sign) $('#sign-pw').focus();
  }

  function dry(fn) {
    const real = S.e;
    S.e = JSON.parse(JSON.stringify(real));
    try { return [].concat(fn(S.e) || []); } finally { S.e = real; }
  }

  function findTab(id) { return spec.tabs.find((x) => x.id === id); }

  function runAction(tid, i, ai) {
    const t = findTab(tid);
    const row = S.e[t.entity][Number(i)];
    const act = t.actions[Number(ai)];
    const ref = refOf(t, row);
    if (!allowed(act)) { toast('Keine Berechtigung für diese Aktion'); return; }
    if (act.sod && (row._by || []).includes(cur().id)) {
      chain(S, { sys: 'Anyfy', text: `Funktionstrennung: ${cur().name} war bereits an ${ref} beteiligt, „${act.label}“ abgelehnt`, ref });
      save(); render();
      toast('Vier-Augen-Prinzip: Sie waren bereits an diesem Vorgang beteiligt. Bitte eine zweite Person.');
      return;
    }
    const go = (v) => {
      const preview = dry((e) => act.apply(e[t.entity][Number(i)], e, v));
      confirmStep({ title: act.label, ref, preview, sign: act.sign }, (sig) => {
        const evs = act.apply(row, S.e, v);
        (row._by ||= []).push(cur().id);
        emit(evs, { ref, sig });
      });
    };
    if (act.fields) openForm(act.label, act.fields, go); else go({});
  }

  function click(e) {
    if (e.target.closest('#bell')) { const p = $('#notif'); p.hidden = !p.hidden; renderBell(); return; }
    if (e.target.closest('[data-readall]')) { (S.seen ||= {})[S.user] = S.log.length; save(); render(); return; }
    const np = e.target.closest('#notif');
    if (!np && !$('#notif').hidden) $('#notif').hidden = true;
    if (np) { const nb = e.target.closest('[data-row]'); if (nb) { $('#notif').hidden = true; ui.detail = nb.dataset.row; renderDetail(); } return; }
    const c = e.target.closest('[data-close]');
    if (c) { ui.detail = null; $('#detail-dlg').close(); return; }
    const b = e.target.closest('button');
    const row = e.target.closest('[data-row]');
    if ((!b || (b.dataset.row && !b.dataset.act)) && row) { ui.detail = row.dataset.row; renderDetail(); return; }
    if (!b) return;
    const t = findTab(tabId);
    if (b.dataset.tab) { tabId = b.dataset.tab; render(); return; }
    if (b.dataset.filter) { ui.filter[tabId] = b.dataset.filter; render(); return; }
    if (b.dataset.q !== undefined) { ui.q[tabId] = b.dataset.q; render(); return; }
    if (b.dataset.go) { ui.q[tabId] = $('#lk').value; render(); return; }
    if (b.dataset.verify) { ui.verify = verify(); render(); return; }
    if (b.dataset.tamper) {
      const l = S.log[Math.min(1, S.log.length - 1)];
      l.text += ' [nachträglich geändert]';
      save(); ui.verify = null; render(); toast('Eintrag direkt im Speicher verändert. Jetzt „Integrität prüfen“.');
      return;
    }
    if (b.dataset.csv) {
      if (b.dataset.csv === '_log') { const n = csv(`${spec.id}-pruefpfad`, ['Nr', 'Zeit', 'System', 'Ereignis', 'Benutzer', 'Rolle', 'Signatur', 'Hash'], S.log.map((l) => [l.seq, l.t, l.sys, l.text, l.user, l.role, l.sig ? l.sig.meaning : '', l.hash])); toast(`Prüfpfad exportiert (${n} Zeilen)`); return; }
      const tt = findTab(b.dataset.csv);
      const n = csv(`${spec.id}-${tt.id}`, tt.columns.map((x) => x.label), S.e[tt.entity].map((r) => tt.columns.map((x) => val(x, r))));
      emit({ sys: 'Anyfy', text: `Export ${tt.title} (${n} Zeilen) erstellt` });
      return;
    }
    if (b.dataset.add) {
      openForm(t.add.label, t.add.fields, (v) => {
        const r = t.add.make(v, S.e);
        const ev = t.add.event(r, S.e);
        const preview = [].concat(ev || []);
        confirmStep({ title: t.add.label, ref: refOf(t, r), preview }, () => { S.e[t.entity].unshift(r); emit(ev, { ref: refOf(t, r) }); });
      });
      return;
    }
    if (b.dataset.check) {
      const preview = dry((en) => t.action.apply(ui.sel[tabId], en));
      confirmStep({ title: t.action.label, ref: '', preview }, () => emit(t.action.apply(ui.sel[tabId], S.e)));
      return;
    }
    if (b.dataset.act) { const [tid, i, ai] = b.dataset.act.split('|'); runAction(tid, i, ai); }
  }

  function run(id) {
    spec = apps[id];
    if (!spec) { $('#app').innerHTML = '<p class="verdict bad">Unbekannte App.</p>'; return; }
    applyEnh();
    document.title = `${spec.title} | COSMO CONSULT`;
    $('#app-name').textContent = spec.title;
    S = load();
    ui = { filter: {}, q: {}, sel: {}, s: {}, detail: null, verify: null };
    tabId = '_ov';
    $('#user-sel').innerHTML = USERS.map((u) => `<option value="${u.id}">${esc(u.name)} · ${esc(u.role)}</option>`).join('');
    $('#user-sel').onchange = (e) => { S.user = e.target.value; save(); render(); toast(`Angemeldet als ${cur().name} (${cur().role})`); };
    document.addEventListener('click', click);
    document.addEventListener('change', (e) => {
      if (e.target.dataset.sel) { (ui.sel[tabId] ||= {})[e.target.dataset.sel] = e.target.value; render(); }
      if (e.target.dataset.search) { ui.s[tabId] = e.target.value; render(); const i = document.querySelector('.srch'); if (i) i.focus(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'lk') { ui.q[tabId] = e.target.value; render(); }
      if (e.key === 'Enter' && e.target.dataset && e.target.dataset.row && e.target.tagName === 'TR') { ui.detail = e.target.dataset.row; renderDetail(); }
    });
    $('#detail-dlg').addEventListener('close', () => { ui.detail = null; });
    $('#form-x').onclick = $('#form-cancel').onclick = () => $('#form-dlg').close();
    $('#sign-cancel').onclick = $('#sign-x').onclick = () => $('#sign-dlg').close();
    $('#reset').onclick = () => { localStorage.removeItem('cc-app-' + spec.id); S = load(); ui = { filter: {}, q: {}, sel: {}, s: {}, detail: null, verify: null }; tabId = '_ov'; render(); toast('Demodaten zurückgesetzt'); };
    $('#print').onclick = () => window.print();
    render();
  }
})();
