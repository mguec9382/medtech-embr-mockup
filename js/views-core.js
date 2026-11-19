(function (root) {
  const E = (root.EMBR = root.EMBR || {});
  const { el, icon, badge, fmt, fmtDate, toast, dialog, table, progress } = E.ui;
  const S = E.store;
  const V = (E.views = E.views || {});

  const state = { mbrVersion: {}, step: {} };

  const pageHead = (title, sub, ...actions) =>
    el('div', { class: 'page-head' },
      el('div', { class: 'titles' }, el('h1', {}, title), sub ? el('p', { class: 'muted' }, sub) : null),
      actions.length ? el('div', { class: 'actions cc-no-print' }, actions) : null);

  const done = (res, okMsg) => {
    toast(res.ok ? okMsg || res.msg || 'Gespeichert' : res.msg, res.ok ? 'ok' : 'bad');
    E.rerender();
  };

  async function signed({ title, intro, meaning, run, okMsg }) {
    const res = await dialog({ title, intro, sign: true, meaning, submit: 'Signieren' });
    if (res) done(run(), okMsg);
  }

  const permHint = (perm) => `Erfordert Berechtigung: ${E.PERM_LABEL[perm]} (aktuelle Rolle: ${S.user().roleLabel})`;

  function actionButton(label, perm, onclick, extra) {
    const allowed = S.can(perm);
    return el('button', { type: 'button', class: `btn ${extra || ''}`, disabled: !allowed, title: allowed ? null : permHint(perm), onclick }, label);
  }

  function openDevs() { return S.get().deviations.filter((d) => d.status !== 'Geschlossen'); }

  function tasksFor(u) {
    const out = [];
    const s = S.get();
    s.batches.forEach((b) => {
      const status = S.batchStatus(b);
      if (status === 'Freigegeben') return;
      const i = S.activeIndex(b);
      if (i >= 0) {
        const st = S.stepState(b, i);
        const step = S.stepsOf(b)[i];
        if (u.role === 'operator' && st === 'active') out.push({ text: `${b.id}: Schritt ${step.no} „${step.title}“ ausführen`, href: `#/batches/${b.id}` });
        if (u.role === 'verifier' && st === 'verify') out.push({ text: `${b.id}: Schritt ${step.no} „${step.title}“ verifizieren`, href: `#/batches/${b.id}` });
      }
      if (u.role === 'qa' && status === 'Review ausstehend') out.push({ text: `${b.id}: Chargenfreigabe prüfen`, href: '#/release' });
    });
    if (u.role === 'qa') openDevs().forEach((d) => out.push({ text: `${d.id} bewerten und schließen`, href: '#/deviations' }));
    s.mbrs.forEach((m) => m.versions.forEach((v) => {
      const href = `#/mbr/${m.id}`;
      if (u.role === 'author' && v.status === 'Entwurf') out.push({ text: `${m.id} v${v.v} zur Prüfung einreichen`, href });
      if (u.role === 'ra' && v.status === 'In Prüfung') out.push({ text: `${m.id} v${v.v} fachlich prüfen`, href });
      if (u.role === 'qa' && v.status === 'Freigabe ausstehend') out.push({ text: `${m.id} v${v.v} freigeben`, href });
    }));
    return out;
  }

  // ---------- Dashboard ----------
  V.dashboard = function () {
    const s = S.get();
    const u = S.user();
    const chain = S.verifyChain();
    const byStatus = (st) => s.batches.filter((b) => S.batchStatus(b) === st).length;
    const failed = s.outbox.filter((m) => m.status !== 'Gesendet').length;
    const kpis = [
      { num: byStatus('In Ausführung'), lbl: 'Chargen in Ausführung', href: '#/batches', cls: 'grp' },
      { num: byStatus('Review ausstehend'), lbl: 'Warten auf QA-Freigabe', href: '#/release', cls: 'grp-primary' },
      { num: openDevs().length, lbl: 'Offene Abweichungen', href: '#/deviations', cls: 'grp-manage' },
      { num: chain.ok ? 'Intakt' : 'Gebrochen', lbl: `Audit-Kette (${chain.count} Ereignisse)`, href: '#/audit', cls: chain.ok ? 'grp' : 'grp-manage' },
      { num: failed, lbl: 'BC-Nachrichten mit Fehler', href: '#/system', cls: failed ? 'grp-manage' : 'grp-support' },
    ];
    const tasks = tasksFor(u);
    return el('div', { class: 'stack' },
      pageHead('Übersicht', `Willkommen, ${u.name}. Rolle: ${u.roleLabel}.`),
      el('div', { class: 'grid cols-4' }, kpis.map((k) => el('a', { class: `card ${k.cls}`, href: k.href }, el('div', { class: 'kpi' }, el('span', { class: 'num' }, k.num), el('span', { class: 'lbl' }, k.lbl))))),
      el('div', { class: 'grid cols-2' },
        el('section', { class: 'card grp' },
          el('h2', {}, 'Meine Aufgaben'),
          tasks.length
            ? el('ul', { class: 'plain' }, tasks.map((t) => el('li', {}, el('a', { href: t.href }, t.text))))
            : el('p', { class: 'muted' }, 'Keine offenen Aufgaben für diese Rolle. Wechseln Sie oben die Rolle, um andere Sichten zu sehen.')),
        el('section', { class: 'card grp' },
          el('h2', {}, 'Compliance-Status'),
          el('ul', { class: 'plain' },
            el('li', {}, 'Audit Trail: ', badge(chain.ok ? 'Kette intakt' : `Bruch bei #${chain.brokenAt}`, chain.ok ? 'ok' : 'bad')),
            el('li', {}, 'Wirksame MBR-Versionen: ', String(s.mbrs.filter((m) => m.versions.some((v) => v.status === 'Wirksam')).length), ' von ', String(s.mbrs.length)),
            el('li', {}, 'Equipment mit überfälliger Kalibrierung: ', String(s.equipment.filter((e) => S.equipmentIssue(e)).length)),
            el('li', {}, 'Validierungsstatus: ', badge('Mockup, nicht validiert', 'warn'))))),
      el('section', { class: 'card grp' },
        el('h2', {}, 'Chargen'),
        batchTable(s.batches)));
  };

  function batchTable(batches) {
    return table(['Batch Record', 'Produkt', 'BC-Auftrag', 'Los', 'Fortschritt', 'Status', ''],
      batches.map((b) => {
        const n = S.stepsOf(b).length;
        const d = S.stepsOf(b).filter((_, i) => S.stepDone(b, i)).length;
        const pct = Math.round((d / n) * 100);
        return { cells: [el('b', {}, b.id), S.mbr(b.mbrId).title, b.bcOrder, `${b.lot} (${b.qty} Stk)`,
          el('div', { class: 'row' }, progress(pct), el('span', { class: 'small' }, `${d}/${n}`)), badge(S.batchStatus(b)), el('a', { href: `#/batches/${b.id}` }, 'Öffnen')] };
      }));
  }

  // ---------- MBR ----------
  V.mbrList = function () {
    const s = S.get();
    return el('div', { class: 'stack' },
      pageHead('Master Batch Records (Vorlagen)', 'Versionierte, signierte Herstellvorschriften. Nur wirksame Versionen können in der Fertigung gestartet werden.'),
      el('section', { class: 'card grp' }, table(['MBR', 'Produkt', 'Klasse', 'Wirksame Version', 'Neueste Version', ''],
        s.mbrs.map((m) => {
          const eff = m.versions.find((v) => v.status === 'Wirksam');
          const last = m.versions[m.versions.length - 1];
          return { cells: [el('b', {}, m.id), `${m.title} (${m.product})`, m.cls, eff ? `v${eff.v}` : '—', el('span', {}, `v${last.v} `, badge(last.status)), el('a', { href: `#/mbr/${m.id}` }, 'Öffnen')] };
        }))));
  };

  const LIFECYCLE = ['Entwurf', 'In Prüfung', 'Freigabe ausstehend', 'Wirksam'];
  const NEXT_ACTION = {
    Entwurf: { meaning: 'Eingereicht', label: 'Zur Prüfung einreichen', perm: 'author' },
    'In Prüfung': { meaning: 'Geprüft', label: 'Fachlich prüfen (Review)', perm: 'review' },
    'Freigabe ausstehend': { meaning: 'Freigegeben', label: 'Version freigeben', perm: 'approve' },
  };

  V.mbrDetail = function (id) {
    const m = S.mbr(id);
    if (!m) return el('p', {}, 'MBR nicht gefunden.');
    const last = m.versions[m.versions.length - 1].v;
    const selV = state.mbrVersion[id] || (m.versions.find((v) => v.status !== 'Ersetzt' && v.status !== 'Wirksam') || m.versions.find((v) => v.status === 'Wirksam') || m.versions[m.versions.length - 1]).v;
    const v = m.versions.find((x) => x.v === selV) || m.versions.find((x) => x.v === last);
    const act = NEXT_ACTION[v.status];
    const idx = LIFECYCLE.indexOf(v.status);
    return el('div', { class: 'stack' },
      pageHead(`${m.id} · ${m.title}`, `${m.product} · ${m.cls} · UDI-DI ${m.udiDi}`, el('a', { class: 'btn secondary', href: '#/mbr' }, 'Alle Vorlagen')),
      el('div', { class: 'row cc-no-print', role: 'tablist', 'aria-label': 'Versionen' },
        m.versions.map((x) => el('button', { type: 'button', role: 'tab', class: `btn ${x.v === v.v ? '' : 'secondary'}`, 'aria-selected': String(x.v === v.v), onclick: () => { state.mbrVersion[id] = x.v; E.rerender(); } }, `v${x.v} · ${x.status}`))),
      el('section', { class: 'card grp' },
        el('h2', {}, `Version ${v.v}`, ' ', badge(v.status)),
        el('p', {}, v.change),
        el('p', { class: 'muted small' }, v.effective ? `Wirksam seit ${fmtDate(v.effective)}` : 'Noch nicht wirksam'),
        el('ol', { class: 'row', style: 'list-style:none;padding:0;margin:var(--space-2) 0' }, LIFECYCLE.map((st, i) => el('li', {}, badge(st, v.status === 'Ersetzt' ? '' : i < idx ? 'ok' : i === idx ? 'info' : '')))),
        act
          ? el('div', { class: 'row' }, actionButton(act.label, act.perm, () => signed({
            title: act.label, intro: `${m.id} v${v.v}: ${v.change}`, meaning: act.meaning,
            run: () => S.mbrTransition(m.id, v.v, act.meaning), okMsg: `Status: ${act.meaning}`,
          })), el('span', { class: 'muted small' }, 'Funktionstrennung: jede Person darf pro Version nur einmal signieren.'))
          : el('p', { class: 'muted small' }, v.status === 'Wirksam' ? 'Version ist wirksam und gesperrt. Änderungen nur über neue Version (Change Control).' : 'Keine weiteren Aktionen.'),
        el('h3', { style: 'margin-top:var(--space-3)' }, 'Signaturen'),
        v.signs.length
          ? el('div', { class: 'sign-list' }, v.signs.map((sg) => el('div', {}, badge(sg.meaning, 'ok'), el('span', {}, `${sg.user}, ${fmt(sg.ts)}`))))
          : el('p', { class: 'muted small' }, 'Noch keine Signaturen.')),
      v.diff ? el('section', { class: 'card grp-manage' }, el('h2', {}, `Änderungen gegenüber letzter wirksamer Version`),
        table(['Feld', 'Bisher', 'Neu', 'Begründung'], v.diff.map((d) => ({ cells: [d.field, d.old, el('b', {}, d.next), d.reason] })))) : null,
      el('section', { class: 'card grp' }, el('h2', {}, 'Herstellschritte'),
        table(['Nr.', 'Schritt', 'Typ', 'Parameter und Grenzen', 'Vier-Augen', 'Referenz'],
          m.steps.map((st) => ({ cells: [st.no, el('span', {}, st.title, st.special ? [' ', badge('Spezialprozess', 'warn')] : null),
            TYPE_LABEL[st.type], (st.params || []).length ? el('ul', { class: 'plain' }, st.params.map((p) => el('li', {}, `${p.name}: ${p.min}–${p.max} ${p.unit}`, p.critical ? [' ', badge('CTQ', 'bad')] : null))) : (st.checks ? `${st.checks.length} Prüfpunkte` : '—'),
            st.verify ? 'Ja' : 'Nein', st.ref] })))));
  };

  // ---------- Chargen ----------
  V.batches = function () {
    const s = S.get();
    return el('div', { class: 'stack' },
      pageHead('Batch Records', 'Ausgeführte Chargendokumentation. Beim Start wird die wirksame MBR-Version als Snapshot eingefroren.',
        actionButton('Charge aus BC-Auftrag starten', 'execute', startBatchDialog)),
      el('section', { class: 'card grp' }, batchTable(s.batches)));
  };

  async function startBatchDialog() {
    const s = S.get();
    const free = E.BC_ORDERS.filter((o) => !s.batches.some((b) => b.bcOrder === o.no));
    if (!free.length) { toast('Keine freigegebenen BC-Fertigungsaufträge ohne Batch Record', 'bad'); return; }
    const res = await dialog({
      title: 'Charge aus BC-Fertigungsauftrag starten',
      intro: 'Aufträge werden live aus Business Central gelesen (simuliert).',
      fields: [{ name: 'order', label: 'BC-Fertigungsauftrag', type: 'select', options: free.map((o) => `${o.no} · ${S.mbr(o.mbrId).title} · ${o.qty} Stk`) }],
      submit: 'Starten',
    });
    if (!res) return;
    const r = S.startBatch(res.order.split(' ')[0]);
    toast(r.msg, r.ok ? 'ok' : 'bad');
    if (r.ok) location.hash = `#/batches/${r.id}`; else E.rerender();
  }

  const TYPE_LABEL = { check: 'Prüfung', material: 'Material', process: 'Prozess', inspection: 'Inspektion', packaging: 'Verpackung' };

  V.batchDetail = function (id) {
    const b = S.batch(id);
    if (!b) return el('p', {}, 'Batch Record nicht gefunden.');
    const steps = S.stepsOf(b);
    const active = S.activeIndex(b);
    let sel = state.step[id];
    if (sel === undefined || sel >= steps.length) sel = active >= 0 ? active : steps.length - 1;
    const m = S.mbr(b.mbrId);
    const events = S.get().audit.filter((a) => a.entity.startsWith(b.id)).slice(-8).reverse();
    const stLabel = { done: 'Abgeschlossen', active: 'Aktiv', verify: 'Wartet auf Verifizierung', pending: 'Ausstehend' };
    return el('div', { class: 'stack' },
      pageHead(`${b.id}`, `${m.title} · Los ${b.lot} · ${b.qty} Stk · BC ${b.bcOrder} · MBR ${b.mbrId} v${b.mbrVersion} (eingefroren)`,
        badge(S.batchStatus(b)), el('a', { class: 'btn secondary', href: `#/dhr/${b.id}` }, 'DHR-Ansicht'), el('a', { class: 'btn secondary', href: '#/batches' }, 'Alle Chargen')),
      el('div', { class: 'split' },
        el('nav', { 'aria-label': 'Herstellschritte' }, el('ol', { class: 'steps' }, steps.map((st, i) => {
          const s = S.stepState(b, i);
          return el('li', { class: s }, el('button', { type: 'button', 'aria-current': i === sel ? 'step' : null, onclick: () => { state.step[id] = i; E.rerender(); } },
            el('span', { class: 'no' }, s === 'done' ? '✓' : String(st.no)), el('span', {}, st.title, el('span', { class: 'st' }, stLabel[s]))));
        }))),
        el('div', { class: 'stack' }, stepPanel(b, sel),
          el('section', { class: 'card' }, el('h3', {}, 'Letzte Audit-Ereignisse dieser Charge'),
            events.length ? table(['#', 'Zeit', 'Benutzer', 'Ereignis', 'Detail'], events.map((a) => ({ cells: [a.seq, fmt(a.ts), a.user, a.action, `${a.entity}: ${a.detail}`] }))) : el('p', { class: 'muted' }, 'Noch keine Ereignisse.')))));
  };

  function stepPanel(b, i) {
    const st = S.stepsOf(b)[i];
    const r = b.exec[i];
    const s = S.stepState(b, i);
    const editable = s === 'active' && S.can('execute');
    const blockers = s === 'active' ? S.stepBlockers(b, i) : [];
    const node = el('section', { class: 'card grp' });
    node.append(
      el('div', { class: 'row' }, el('h2', {}, `Schritt ${st.no}: ${st.title}`), badge(TYPE_LABEL[st.type], 'info'), st.special ? badge('Validierter Spezialprozess', 'warn') : null, st.verify ? badge('Vier-Augen', 'warn') : null, el('span', { class: 'muted small spacer' }, st.ref)),
      el('p', { class: 'muted' }, st.instruction));

    if (st.equipmentClass) {
      const options = S.get().equipment.filter((e) => e.cls === st.equipmentClass);
      const sel = el('select', { 'aria-label': 'Equipment', disabled: !editable, onchange: (e) => { const res = S.setEquipment(b, i, e.target.value); toast(res.ok ? 'Equipment übernommen' : res.msg, res.ok ? 'ok' : 'bad'); E.rerender(); } },
        el('option', { value: '' }, 'Equipment wählen …'),
        options.map((e) => el('option', { value: e.id, selected: r.equipment === e.id }, `${e.id} · ${e.name} (Kalibrierung bis ${fmtDate(e.calDue)})${S.equipmentIssue(e) ? ' · gesperrt' : ''}`)));
      node.append(el('label', { class: 'field' }, 'Equipment (Kalibrier- und Qualifizierungsprüfung)', sel));
    }

    if (st.type === 'material') {
      const input = el('input', { type: 'text', 'aria-label': 'Chargennummer scannen', placeholder: 'z. B. TI-26-118', disabled: !editable, value: r.lot || '' });
      const scan = () => { const res = S.scanLot(b, i, input.value); toast(res.msg, res.ok ? 'ok' : 'bad'); E.rerender(); };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); scan(); } });
      node.append(el('div', { class: 'stack' },
        el('p', { class: 'small' }, `Erwartet: ${st.item} · ${st.itemName}. Testchargen: TI-26-118 (frei), TI-26-097 (gesperrt), TI-25-044 (abgelaufen).`),
        el('div', { class: 'row' }, input, el('button', { type: 'button', class: 'btn', disabled: !editable, onclick: scan }, 'Scannen')),
        r.lot ? el('div', { class: 'notice ok' }, `Los ${r.lot}: ${E.LOTS[r.lot].status}, Verfall ${fmtDate(E.LOTS[r.lot].expiry)}, ${E.LOTS[r.lot].supplier}, ${E.LOTS[r.lot].cert}`) : null));
    }

    if (st.checks) {
      node.append(el('fieldset', { style: 'border:0;padding:0;margin:0' }, el('legend', { class: 'small muted' }, 'Prüfpunkte'),
        st.checks.map((c, k) => el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: r.checks[k], disabled: !editable, onchange: (e) => { const res = S.setCheck(b, i, k, e.target.checked); if (!res.ok) toast(res.msg, 'bad'); E.rerender(); } }), el('span', {}, c)))));
    }

    if (st.params) {
      node.append(table(['Parameter', 'Grenzen', 'Wert', 'Status', ''], st.params.map((p) => {
        const v = r.values[p.id];
        const ps = S.paramState(p, v);
        const dev = S.get().deviations.find((d) => r.deviations.includes(d.id) && d.paramId === p.id);
        const input = el('input', { type: 'text', inputmode: 'decimal', class: `value-input ${ps === 'oob' ? 'bad' : ps === 'ok' ? 'good' : ''}`, 'aria-label': `${p.name} in ${p.unit}`, value: v === undefined ? '' : String(v), disabled: !editable || !!st.qaSource,
          onchange: (e) => { const res = S.setValue(b, i, p.id, e.target.value); toast(res.msg || 'Wert erfasst', res.ok && !res.msg ? 'ok' : 'bad'); E.rerender(); } });
        return { cells: [el('span', {}, p.name, p.critical ? [' ', badge('CTQ', 'bad')] : null), `${p.min}–${p.max} ${p.unit}`, el('div', { class: 'row' }, input, p.unit),
          ps === 'ok' ? badge('In Grenzen', 'ok') : ps === 'oob' ? badge('Außerhalb', 'bad') : badge('Offen', ''),
          dev ? el('a', { href: '#/deviations' }, dev.id) : ps === 'oob' && !st.qaSource && S.can('deviation.create') && s === 'active'
            ? el('button', { type: 'button', class: 'btn small danger', onclick: () => deviationDialog(b, i, p) }, 'Abweichung anlegen') : null] };
      })));
    }

    if (st.qaSource && s === 'active') {
      node.append(el('div', { class: 'row' },
        el('button', { type: 'button', class: 'btn', disabled: !editable, onclick: () => { const res = S.importQaResult(b, i); toast(res.msg, res.ok ? 'ok' : 'bad'); E.rerender(); } }, `Prüfergebnis aus BC (${st.qaSource}) abrufen`),
        el('span', { class: 'muted small' }, 'Messwerte werden in Business Central erfasst, Grenzwertverletzungen erzeugen hier eine Abweichung.')));
    }

    if (st.udiSource) {
      node.append(el('div', { class: 'notice' }, `UDI-Daten (UDI-DI ${S.mbr(b.mbrId).udiDi}, UDI-PI (21)${b.lot}) stammen aus Business Central (${st.udiSource}). Das eMBR gleicht nur das Etikett ab.`));
    }

    if (s === 'active' && !S.can('execute')) {
      node.append(el('div', { class: 'notice warn' }, `Nur lesend: ${permHint('execute')}. Wechseln Sie oben zur Rolle „Fertigungsmitarbeiterin“.`));
    } else if (s === 'active') {
      node.append(blockers.length
        ? el('div', { class: 'notice warn' }, el('b', {}, 'Signatur gesperrt, weil:'), el('ul', { class: 'plain' }, blockers.map((x) => el('li', {}, x))))
        : el('div', { class: 'notice ok' }, 'Alle Bedingungen erfüllt. Schritt kann signiert werden.'));
      const signBtn = actionButton('Ausführung signieren', 'execute', () => signed({
        title: 'Ausführung signieren', intro: `${b.id} · Schritt ${st.no}: ${st.title}`, meaning: 'Ausgeführt', run: () => S.signStep(b, i, 'Ausgeführt'), okMsg: 'Schritt signiert',
      }));
      if (blockers.length) signBtn.disabled = true;
      node.append(el('div', { class: 'row' }, signBtn));
    }
    if (s === 'verify') {
      node.append(el('div', { class: 'notice warn' }, 'Wartet auf Verifizierung durch eine zweite Person (Vier-Augen-Prinzip).'));
      node.append(el('div', { class: 'row' }, actionButton('Verifizieren (Vier-Augen)', 'verify', () => signed({
        title: 'Verifizieren', intro: `${b.id} · Schritt ${st.no}: ${st.title}. Ich bestätige Werte und Durchführung.`, meaning: 'Verifiziert', run: () => S.signStep(b, i, 'Verifiziert'), okMsg: 'Schritt verifiziert',
      }))));
    }
    if (s === 'pending') node.append(el('div', { class: 'notice' }, 'Schritt ist noch nicht aktiv. Schritte werden strikt in der Reihenfolge der MBR ausgeführt.'));
    if (r.signs.length) node.append(el('div', { class: 'sign-list' }, r.signs.map((sg) => el('div', {}, badge(sg.meaning, 'ok'), el('span', {}, `${sg.user}, ${fmt(sg.ts)}`)))));
    return node;
  }

  async function deviationDialog(b, i, p) {
    const res = await dialog({
      title: 'Abweichung anlegen',
      intro: `${p.name} liegt außerhalb ${p.min}–${p.max} ${p.unit}. Die Charge wird in BC gesperrt.`,
      fields: [
        { name: 'severity', label: 'Schweregrad', type: 'select', options: ['Minor', 'Major', 'Critical'] },
        { name: 'description', label: 'Beschreibung', type: 'textarea' },
        { name: 'action', label: 'Sofortmaßnahme', type: 'textarea' },
      ],
      submit: 'Anlegen',
    });
    if (res) done(S.createDeviation(b, i, p.id, res));
  }

  E.viewHelpers = { pageHead, done, signed, actionButton, permHint, openDevs, batchTable };
})(typeof window !== 'undefined' ? window : globalThis);
