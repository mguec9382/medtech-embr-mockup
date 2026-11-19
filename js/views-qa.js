(function (root) {
  const E = (root.EMBR = root.EMBR || {});
  const { el, badge, fmt, fmtDate, toast, dialog, table, progress } = E.ui;
  const S = E.store;
  const V = (E.views = E.views || {});
  const { pageHead, done, signed, actionButton, openDevs } = E.viewHelpers;

  const ui = { auditFilter: '', auditResult: null, relBatch: null, trace: 'TI-26-118' };

  // ---------- Abweichungen ----------
  V.deviations = function () {
    const devs = S.get().deviations.slice().reverse();
    return el('div', { class: 'stack' },
      pageHead('Abweichungen', 'Jede Grenzwertverletzung erzeugt eine Abweichung und sperrt die Charge in Business Central, bis QA sie bewertet hat.'),
      el('div', { class: 'stack' }, devs.map((d) => {
        const p = (() => { const b = S.batch(d.batchId); const st = S.stepsOf(b).find((x) => x.no === d.stepNo); return st.params.find((q) => q.id === d.paramId); })();
        return el('section', { class: `card ${d.status === 'Offen' ? 'grp-manage' : 'grp'}` },
          el('div', { class: 'row' }, el('h2', {}, d.id), badge(d.status), badge(d.severity), el('a', { class: 'spacer', href: `#/batches/${d.batchId}` }, `${d.batchId}, Schritt ${d.stepNo}`)),
          el('p', {}, d.description),
          el('p', { class: 'small muted' }, `Messwert ${d.value} ${p.unit} (Grenzen ${p.min}–${p.max}) · angelegt von ${d.createdBy}, ${fmt(d.createdAt)}`),
          el('p', { class: 'small' }, el('b', {}, 'Sofortmaßnahme: '), d.action || '—'),
          d.status === 'Geschlossen'
            ? el('div', { class: 'notice ok' }, `Bewertung: ${d.disposition} · ${d.closedBy}, ${fmt(d.closedAt)}`)
            : el('div', { class: 'row' }, actionButton('Bewerten und schließen', 'deviation.close', async () => {
              const res = await dialog({ title: `${d.id} bewerten`, fields: [{ name: 'disp', label: 'Entscheidung', type: 'select', options: ['Verwendung wie besehen mit Begründung', 'Nacharbeit nach genehmigter Anweisung', 'Ausschuss'] }, { name: 'why', label: 'Begründung / CAPA-Verweis', type: 'textarea' }], sign: true, meaning: 'Abweichung bewertet', submit: 'Signieren und schließen' });
              if (res) done(S.closeDeviation(d.id, `${res.disp}${res.why ? `: ${res.why}` : ''}`), `${d.id} geschlossen`);
            })));
      })));
  };

  // ---------- QA-Freigabe ----------
  function reviewChecks(b) {
    const steps = S.stepsOf(b);
    const devs = S.get().deviations;
    const paramsOk = steps.every((st, i) => (st.params || []).every((p) => {
      const r = b.exec[i];
      return S.paramState(p, r.values[p.id]) === 'ok' || devs.some((d) => r.deviations.includes(d.id) && d.paramId === p.id);
    }));
    const lotsOk = steps.every((st, i) => st.type !== 'material' || (b.exec[i].lot && !S.lotIssue(b.exec[i].lot, st.item)));
    const eqOk = steps.every((st, i) => !st.equipmentClass || (b.exec[i].equipment && !S.equipmentIssue(S.equipmentById(b.exec[i].equipment))));
    const bcOk = !S.get().outbox.some((m) => m.key.includes(b.id) && m.status === 'Fehler');
    return [
      { label: 'Alle Schritte ausgeführt und, wo gefordert, verifiziert', ok: S.activeIndex(b) === -1 },
      { label: 'Alle Messwerte in Grenzen oder durch Abweichung abgedeckt', ok: paramsOk },
      { label: 'Eingesetzte Materialchargen in BC freigegeben und nicht abgelaufen', ok: lotsOk },
      { label: 'Equipment zum Stichtag kalibriert und qualifiziert', ok: eqOk },
      { label: 'Alle Abweichungen geschlossen', ok: S.devsOf(b).every((d) => d.status === 'Geschlossen') },
      { label: 'BC-Buchungen ohne Fehler übermittelt', ok: bcOk },
      { label: 'Audit-Kette intakt', ok: S.verifyChain().ok },
    ];
  }

  V.release = function () {
    const batches = S.get().batches;
    const queue = batches.filter((b) => S.batchStatus(b) !== 'Freigegeben');
    const sel = batches.find((b) => b.id === ui.relBatch) || queue[0] || batches[0];
    const checks = reviewChecks(sel);
    const status = S.batchStatus(sel);
    const readyToSign = status === 'Review ausstehend';
    const exceptions = [];
    S.devsOf(sel).forEach((d) => exceptions.push(el('li', {}, el('a', { href: '#/deviations' }, d.id), ` (${d.severity}, ${d.status}): ${d.description}`)));
    S.stepsOf(sel).forEach((st, i) => { if (st.special) exceptions.push(el('li', {}, `Schritt ${st.no}: validierter Spezialprozess, Parameter ${(st.params || []).map((p) => `${p.name} ${sel.exec[i].values[p.id] ?? '—'} ${p.unit}`).join(', ')}`)); });
    return el('div', { class: 'stack' },
      pageHead('QA-Chargenfreigabe', 'Review by Exception: Das System prüft alles Regelkonforme automatisch. QA bewertet nur Ausnahmen und gibt frei.'),
      el('div', { class: 'split' },
        el('nav', { 'aria-label': 'Chargen' }, el('ol', { class: 'steps' }, batches.map((b) => el('li', {}, el('button', { type: 'button', 'aria-current': b.id === sel.id ? 'step' : null, onclick: () => { ui.relBatch = b.id; E.rerender(); } },
          el('span', { class: 'no' }, '•'), el('span', {}, b.id, el('span', { class: 'st' }, S.batchStatus(b)))))))),
        el('div', { class: 'stack' },
          el('section', { class: 'card grp' },
            el('div', { class: 'row' }, el('h2', {}, sel.id), badge(status), el('span', { class: 'muted small spacer' }, `${S.mbr(sel.mbrId).title} · Los ${sel.lot} · ${sel.qty} Stk`)),
            el('h3', {}, 'Automatische Prüfungen'),
            el('ul', { class: 'plain', style: 'list-style:none;padding:0' }, checks.map((c) => el('li', { class: 'row' }, badge(c.ok ? 'OK' : 'Nicht erfüllt', c.ok ? 'ok' : 'bad'), c.label)))),
          el('section', { class: 'card grp-primary' }, el('h3', {}, 'Ausnahmen zur Bewertung'),
            exceptions.length ? el('ul', { class: 'plain' }, exceptions) : el('p', { class: 'muted' }, 'Keine Ausnahmen. Charge wurde vollständig innerhalb der Spezifikation gefertigt.')),
          el('section', { class: 'card grp' },
            sel.release
              ? el('div', { class: 'stack' }, el('div', { class: 'notice ok' }, `Freigegeben von ${sel.release.user}, ${fmt(sel.release.ts)}`), el('p', { class: 'mono' }, `Dokument-Hash: ${sel.release.hash}`), el('div', { class: 'row' }, el('a', { class: 'btn', href: `#/dhr/${sel.id}` }, 'DHR öffnen')))
              : el('div', { class: 'row' },
                (() => {
                  const btn = actionButton('Charge freigeben', 'release', () => signed({
                    title: 'Chargenfreigabe', intro: `${sel.id}: Ich bestätige, dass Herstellung und Dokumentation geprüft wurden und die Charge freigegeben werden kann.`, meaning: 'Chargenfreigabe', run: () => S.releaseBatch(sel), okMsg: 'Charge freigegeben, Status an BC gesendet',
                  }));
                  if (!readyToSign) btn.disabled = true;
                  return btn;
                })(),
                !readyToSign ? el('span', { class: 'muted small' }, `Freigabe nicht möglich: Status „${status}“.`) : null))))
    );
  };

  // ---------- DHR ----------
  V.dhr = function (id) {
    const b = S.batch(id);
    if (!b) return el('p', {}, 'Batch Record nicht gefunden.');
    const m = S.mbr(b.mbrId);
    const hash = b.release ? b.release.hash : S.recordHash(b);
    const valid = b.release ? S.recordHash(b) === b.release.hash : null;
    const devs = S.devsOf(b);
    return el('div', { class: 'stack' },
      pageHead('Device History Record (DHR)', `Nachweis der Herstellung nach ISO 13485 §7.5.1 für ${b.id}`,
        el('button', { type: 'button', class: 'btn', onclick: () => window.print() }, 'Drucken / PDF'), el('a', { class: 'btn secondary', href: `#/batches/${b.id}` }, 'Zurück')),
      el('article', { class: 'dhr' },
        b.release ? null : el('span', { class: 'watermark' }, 'Entwurf, nicht freigegeben'),
        el('h2', { class: 'dhr-title' }, m.title),
        table(['Feld', 'Wert'], [
          ['Batch Record', b.id], ['Los / Seriennummernkreis', b.lot], ['Menge', `${b.qty} Stk`], ['BC-Fertigungsauftrag', b.bcOrder],
          ['MBR (Snapshot)', `${m.id} v${b.mbrVersion}`], ['UDI-DI / UDI-PI', `${m.udiDi} / (21)${b.lot}`], ['Klassifizierung', m.cls], ['Fertigungsstart', fmt(b.startedAt)],
        ].map((r) => ({ cells: r }))),
        el('h2', {}, 'Herstellschritte'),
        table(['Nr.', 'Schritt', 'Material / Equipment', 'Messwerte', 'Signaturen'], S.stepsOf(b).map((st, i) => {
          const r = b.exec[i];
          return { cells: [st.no, st.title, [r.lot ? `Los ${r.lot}` : null, r.equipment ? `${r.equipment}` : null].filter(Boolean).join(', ') || '—',
            (st.params || []).map((p) => `${p.name}: ${r.values[p.id] ?? '—'} ${p.unit}`).join('; ') || (st.checks ? `${r.checks.filter(Boolean).length}/${st.checks.length} Prüfpunkte` : '—'),
            r.signs.length ? el('div', { class: 'sign-list' }, r.signs.map((sg) => el('div', {}, `${sg.meaning}: ${sg.user}, ${fmt(sg.ts)}`))) : '—'] };
        })),
        el('h2', {}, 'Abweichungen'),
        devs.length ? table(['ID', 'Schweregrad', 'Beschreibung', 'Status / Bewertung'], devs.map((d) => ({ cells: [d.id, d.severity, d.description, d.status === 'Geschlossen' ? `${d.disposition} (${d.closedBy}, ${fmt(d.closedAt)})` : 'Offen'] }))) : el('p', { class: 'muted' }, 'Keine Abweichungen.'),
        el('h2', {}, 'Chargenfreigabe'),
        b.release ? el('p', {}, `Freigegeben von ${b.release.user} am ${fmt(b.release.ts)}.`) : el('p', { class: 'muted' }, 'Noch nicht freigegeben.'),
        el('p', { class: 'mono' }, `SHA-256 des Records: ${hash}`),
        valid === null ? null : el('div', { class: `notice ${valid ? 'ok' : 'bad'}` }, valid ? 'Integritätsprüfung bestanden: Record entspricht dem Hash zum Zeitpunkt der Freigabe.' : 'Integritätsprüfung fehlgeschlagen: Record wurde nach Freigabe verändert.'),
        el('p', { class: 'small muted', style: 'margin-top:var(--space-2)' }, 'Mockup: Ziel ist PDF/A mit eingebettetem JSON im unveränderlichen Archiv (Aufbewahrung 10 bzw. 15 Jahre).')));
  };

  // ---------- Rückverfolgung ----------
  const rawLots = (b) => { const set = new Set(); S.stepsOf(b).forEach((st, i) => { if (st.type === 'material' && b.exec[i].lot) set.add(b.exec[i].lot); }); return [...set]; };

  V.trace = function () {
    const q = ui.trace.trim();
    const s = S.get();
    const isRaw = !!E.LOTS[q];
    const finished = s.batches.find((b) => b.lot === q);
    const input = el('input', { type: 'search', name: 'q', value: q, list: 'lots', 'aria-label': 'Los suchen' });
    const body = [];
    if (isRaw) {
      const used = s.batches.filter((b) => rawLots(b).includes(q));
      const ship = used.flatMap((b) => (E.SHIPMENTS[b.lot] || []).map((x) => ({ ...x, lot: b.lot })));
      body.push(el('div', { class: 'grid cols-2' },
        el('section', { class: 'card grp' }, el('h2', {}, 'Rückwärts: Herkunft'),
          el('p', {}, `Rohmaterial ${q}: ${E.LOTS[q].item}, ${E.LOTS[q].supplier}`), el('p', { class: 'small muted' }, `${E.LOTS[q].cert}, Status ${E.LOTS[q].status}`)),
        el('section', { class: 'card grp-primary' }, el('h2', {}, 'Vorwärts: Verwendung'),
          used.length ? table(['Batch Record', 'Fertigungslos', 'Status'], used.map((b) => ({ cells: [el('a', { href: `#/batches/${b.id}` }, b.id), b.lot, badge(S.batchStatus(b))] }))) : el('p', { class: 'muted' }, 'Noch nicht verwendet.'))),
      shipmentCard(ship, `Rückruf-Szenario für Rohmateriallos ${q}`));
    } else if (finished) {
      const ship = (E.SHIPMENTS[finished.lot] || []).map((x) => ({ ...x, lot: finished.lot }));
      const eq = [...new Set(finished.exec.map((r) => r.equipment).filter(Boolean))];
      body.push(el('div', { class: 'grid cols-2' },
        el('section', { class: 'card grp' }, el('h2', {}, 'Rückwärts: Herkunft'),
          el('ul', { class: 'plain' },
            el('li', {}, 'Batch Record: ', el('a', { href: `#/batches/${finished.id}` }, finished.id), ` (MBR ${finished.mbrId} v${finished.mbrVersion})`),
            el('li', {}, 'Rohmaterial: ', rawLots(finished).join(', ') || 'noch nicht gescannt'),
            el('li', {}, 'Equipment: ', eq.join(', ') || '—'),
            el('li', {}, 'BC-Auftrag: ', finished.bcOrder))),
        el('section', { class: 'card grp-primary' }, el('h2', {}, 'Vorwärts: Verbleib'), ship.length ? el('p', {}, `${ship.reduce((a, x) => a + x.qty, 0)} Stk an ${ship.length} Empfänger geliefert.`) : el('p', { class: 'muted' }, 'Noch keine Auslieferung.'))),
      shipmentCard(ship, `Auslieferungen Los ${q}`));
    } else {
      body.push(el('div', { class: 'notice warn' }, `Los „${q}“ ist unbekannt.`));
    }
    return el('div', { class: 'stack' },
      pageHead('Rückverfolgung', 'Vorwärts- und Rückwärtsverfolgung von Rohmaterial bis zum Kunden (ISO 13485 §7.5.9, MDR).'),
      el('form', { class: 'card grp row cc-no-print', onsubmit: (e) => { e.preventDefault(); ui.trace = input.value; E.rerender(); } },
        el('label', { class: 'field', style: 'flex:1 1 240px' }, 'Los oder Charge', input),
        el('datalist', { id: 'lots' }, [...Object.keys(E.LOTS), ...s.batches.map((b) => b.lot)].map((l) => el('option', { value: l }))),
        el('button', { class: 'btn', type: 'submit' }, 'Suchen'),
        ['TI-26-118', 'L26-0476', 'TI-26-097'].map((l) => el('button', { type: 'button', class: 'btn secondary small', onclick: () => { ui.trace = l; E.rerender(); } }, l))),
      body);
  };

  function shipmentCard(ship, title) {
    return el('section', { class: 'card grp-manage' }, el('h2', {}, title),
      ship.length ? [table(['Lieferschein', 'Los', 'Kunde', 'Datum', 'Menge'], ship.map((x) => ({ cells: [x.doc, x.lot, x.customer, fmtDate(x.date), `${x.qty} Stk`] }))),
        el('p', { class: 'notice warn', style: 'margin-top:var(--space-2)' }, `Betroffene Menge im Markt: ${ship.reduce((a, x) => a + x.qty, 0)} Stk bei ${new Set(ship.map((x) => x.customer)).size} Kunden.`)]
        : el('p', { class: 'muted' }, 'Keine Auslieferungen vorhanden.'));
  }

  // ---------- Audit Trail ----------
  V.audit = function () {
    const s = S.get();
    const f = ui.auditFilter.toLowerCase();
    const rows = s.audit.filter((a) => !f || `${a.user} ${a.action} ${a.entity} ${a.detail}`.toLowerCase().includes(f)).slice().reverse();
    const res = ui.auditResult;
    const filter = el('input', { type: 'search', value: ui.auditFilter, 'aria-label': 'Audit Trail filtern', placeholder: 'Filter (Benutzer, Ereignis, Objekt) …' });
    filter.addEventListener('input', () => { ui.auditFilter = filter.value; const pos = filter.selectionStart; E.rerender(); const n = document.querySelector('input[aria-label="Audit Trail filtern"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } });
    return el('div', { class: 'stack' },
      pageHead('Audit Trail', 'Jedes Ereignis enthält den Hash des Vorgängers. Eine nachträgliche Änderung bricht die Kette ab dieser Stelle (21 CFR 11.10(e)).',
        el('button', { type: 'button', class: 'btn', onclick: () => { ui.auditResult = S.verifyChain(); E.rerender(); } }, 'Kette prüfen'),
        el('button', { type: 'button', class: 'btn secondary', onclick: () => { const q = S.tamper(); toast(`Ereignis #${q} nachträglich verändert (Demo)`, 'bad'); ui.auditResult = null; E.rerender(); } }, 'Manipulation simulieren'),
        el('button', { type: 'button', class: 'btn secondary', onclick: () => { S.reset(); ui.auditResult = null; toast('Mockup-Daten zurückgesetzt', 'ok'); E.rerender(); } }, 'Daten zurücksetzen'),
        el('button', { type: 'button', class: 'btn secondary', onclick: () => exportAudit() }, 'JSON-Export')),
      res ? el('div', { class: `notice ${res.ok ? 'ok' : 'bad'}`, role: 'status' }, res.ok ? `Kette intakt: ${res.count} Ereignisse geprüft.` : `Kette gebrochen bei Ereignis #${res.brokenAt} von ${res.count}. Manipulation erkannt.`) : null,
      el('section', { class: 'card grp' }, el('label', { class: 'field' }, 'Filter', filter),
        el('div', { style: 'margin-top:var(--space-2)' }, table(['#', 'Zeit', 'Benutzer', 'Ereignis', 'Objekt', 'Detail', 'Hash'],
          rows.map((a) => ({ cls: res && !res.ok && a.seq === res.brokenAt ? 'sel' : '', cells: [a.seq, fmt(a.ts), el('span', {}, a.user, el('br'), el('span', { class: 'muted small' }, a.role)), a.action, a.entity, a.detail, el('span', { class: 'mono' }, a.hash.slice(0, 12))] }))))));
  };

  function exportAudit() {
    const blob = new Blob([JSON.stringify(S.get().audit, null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'audit-trail.json' });
    document.body.append(a);
    a.click();
    a.remove();
  }

  // ---------- System und Compliance ----------
  V.system = function () {
    const s = S.get();
    const st = { mock: ['Im Mockup gezeigt', 'ok'], verify: ['Anyfy klären', 'warn'], process: ['Prozess/SOP', 'info'] };
    const perms = Object.keys(E.PERM_LABEL);
    return el('div', { class: 'stack' },
      pageHead('System und Compliance', 'Zielarchitektur, BC-Integration, Anforderungsabdeckung und Validierungsplan.'),
      el('section', { class: 'card grp' }, el('h2', {}, 'Zielarchitektur'),
        el('div', { class: 'arch' },
          el('div', { class: 'layer' }, el('b', {}, 'Companion App in COSMO Anyfy (CPA)'), el('div', { class: 'chips' }, ['Extension Bundle (React/Fluent UI)', 'Meta Service (CpClass/CpType)', 'Data Service, CP Functions, Trigger, Jobs', 'Auth Service, Rollen, Typberechtigungen'].map((c) => el('span', { class: 'chip' }, c)))),
          el('div', { class: 'layer bc' }, el('div', { class: 'row' }, el('img', { class: 'logo-img', src: 'assets/icons/BC_Life-Sciences.svg', alt: 'Business Central Life Sciences' }), el('img', { class: 'logo-img', src: 'assets/icons/BC_Process-Manufacturing.svg', alt: 'Business Central Process Manufacturing' }), el('b', {}, 'Business Central (führend für Artikel, Stückliste, Fertigungsauftrag, Lager, Chargen)')),
            el('div', { class: 'chips' }, ['COSMO Asset Anyfy Core Interface', 'Type Mappings / System Connector', 'Outbox mit Idempotenzschlüssel'].map((c) => el('span', { class: 'chip' }, c)))),
          el('div', { class: 'layer arc' }, el('b', {}, 'Archiv'), el('div', { class: 'chips' }, ['PDF/A + JSON + Hash', 'Unveränderlicher Speicher (WORM)', 'Aufbewahrung je Produkt 10 / 15 Jahre'].map((c) => el('span', { class: 'chip' }, c)))))),
      el('section', { class: 'card grp' }, el('h2', {}, 'Anyfy-Zielmodell'),
        el('div', { class: 'stack' },
          table(['Ontologie-Klasse', 'Eigenschaften', 'BC-Bezug'], Object.entries(E.ANYFY.classes).map(([n, c]) => ({ cells: [el('span', { class: 'mono' }, n), c.props.join(', '), c.mapping || c.note || ''] }))),
          table(['Function', 'Aufgabe', 'Recht'], E.ANYFY.functions.map((f) => ({ cells: [el('span', { class: 'mono' }, f.name), f.does, f.perm] }))),
          table(['Type-Mapping', 'Richtung', 'Über'], E.ANYFY.typeMappings.map((t) => ({ cells: [t.name, t.direction, t.via] }))),
          el('ol', { class: 'plain' }, E.ANYFY.migration.map((m) => el('li', {}, m))))),
      el('section', { class: 'card grp-primary' }, el('h2', {}, 'BC-Integration (simulierte Outbox)'),
        table(['ID', 'Typ', 'Ziel in BC', 'Detail', 'Zeit', 'Status', ''], s.outbox.map((m) => ({ cells: [m.id, m.type, m.target, el('span', {}, m.detail, el('br'), el('span', { class: 'mono muted' }, m.key)), fmt(m.ts), badge(m.status),
          m.status === 'Fehler' ? el('button', { type: 'button', class: 'btn small', onclick: () => { S.retryOutbox(m.id); toast('Wiederholt, keine Doppelbuchung durch Idempotenzschlüssel', 'ok'); E.rerender(); } }, 'Wiederholen') : null] })))),
      el('section', { class: 'card grp' }, el('h2', {}, 'Anforderungsabdeckung'),
        table(['Anforderung', 'Quelle', 'Funktion im Mockup', 'Status'], E.COMPLIANCE.map((c) => ({ cells: [c.req, c.source, el('span', {}, el('a', { href: c.screen }, c.feature), c.note ? el('span', { class: 'muted small' }, ` · ${c.note}`) : null), badge(st[c.status][0], st[c.status][1])] })))),
      el('div', { class: 'grid cols-2' },
        el('section', { class: 'card grp-support' }, el('h2', {}, 'Validierungsplan (Beispielstand)'),
          el('div', { class: 'stack' }, E.VALIDATION.map((v) => el('div', { class: 'bar-row' }, v.phase, progress(v.pct), `${v.pct}%`)))),
        el('section', { class: 'card grp-manage' }, el('h2', {}, 'Offene Entscheidungen'), el('ol', { class: 'plain' }, E.DECISIONS.map((d) => el('li', {}, d))))),
      el('section', { class: 'card grp' }, el('h2', {}, 'Rollen und Rechte'),
        table(['Berechtigung', ...s.users.map((u) => `${u.name} (${u.roleLabel})`)], perms.map((p) => ({ cells: [E.PERM_LABEL[p], ...s.users.map((u) => (S.can(p, u) ? '✓' : '—'))] })))));
  };
})(typeof window !== 'undefined' ? window : globalThis);
