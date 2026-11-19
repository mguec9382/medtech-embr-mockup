(function () {
  const { d, diff, fmt, tone } = CC;
  const S_ = { BC: 'BC', ANY: 'Anyfy', QA: 'COSMO QA', UDI: 'COSMO UDI' };
  const ev = (sys, text) => ({ sys, text });
  const nextId = (rows, prefix) => `${prefix}${String(rows.length + 100).slice(-3)}`;
  const days = (iso) => { const n = diff(iso); return n < 0 ? `überfällig ${-n} T` : `in ${n} T`; };

  /* ---------- CAPA ---------- */
  const capaTone = tone({ Geschlossen: 'ok', 'In Bearbeitung': 'info', 'Wirksamkeit': 'warn', Offen: '' });
  CC.define({
    id: 'capa', title: 'CAPA & Abweichungen', role: 'Qualitätsmanagerin',
    subtitle: 'Korrektur- und Vorbeugemaßnahmen mit Fristen, Eskalation und Wirksamkeitsprüfung. Abweichungen kommen aus COSMO QA, Maßnahmen werden in Anyfy gesteuert.',
    integrations: [
      { sys: 'COSMO QA', text: 'Abweichungen und Qualitätsaufträge werden gelesen; Wirksamkeitsprüfung erzeugt einen Qualitätsauftrag.' },
      { sys: 'Anyfy', text: 'Workflow, Fristenüberwachung, Eskalation per Teams/E-Mail, Prüfpfad.' },
      { sys: 'BC', text: 'Verantwortliche und Aufgaben (Mitarbeiter, Ressourcen).' }
    ],
    seed: () => ({
      capas: [
        { id: 'CAPA-26-007', title: 'Siegelnaht-Abweichung Linie 2', source: 'D-26-014', owner: 'A. Weber', due: d(-6), status: 'In Bearbeitung' },
        { id: 'CAPA-26-008', title: 'Etikettenverwechslung Verpackung', source: 'D-26-019', owner: 'S. Hoffmann', due: d(12), status: 'Offen' },
        { id: 'CAPA-26-005', title: 'Kalibrierintervall Siegelgerät', source: 'Audit 03/2026', owner: 'K. Braun', due: d(-2), status: 'Wirksamkeit prüfen' },
        { id: 'CAPA-26-009', title: 'Folie außerhalb Toleranz (Lieferant)', source: 'WE-26-0311', owner: 'M. Richter', due: d(25), status: 'Offen' },
        { id: 'CAPA-26-003', title: 'Schulung Reinraumbekleidung', source: 'D-26-006', owner: 'A. Weber', due: d(-40), status: 'Geschlossen' }
      ],
      devs: [
        { id: 'D-26-021', desc: 'Ra-Wert Charge L26-0481 über Grenzwert', source: 'COSMO QA', date: d(-2), status: 'Ohne CAPA' },
        { id: 'D-26-022', desc: 'Temperaturabweichung Reinraum 2', source: 'COSMO QA', date: d(-1), status: 'Ohne CAPA' },
        { id: 'D-26-019', desc: 'Etikett falsch zugeordnet', source: 'eMBR', date: d(-14), status: 'CAPA angelegt' }
      ]
    }),
    kpis: [
      { label: 'Offene Maßnahmen', fn: (e) => e.capas.filter((c) => c.status !== 'Geschlossen').length },
      { label: 'Überfällig', fn: (e) => e.capas.filter((c) => c.status !== 'Geschlossen' && diff(c.due) < 0).length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Abweichungen ohne CAPA', fn: (e) => e.devs.filter((x) => x.status === 'Ohne CAPA').length, tone: (v) => (v ? 'warn' : 'ok') }
    ],
    tabs: [
      {
        id: 'capas', title: 'Maßnahmen', type: 'table', entity: 'capas',
        columns: [
          { key: 'id', label: 'CAPA' }, { key: 'title', label: 'Titel' }, { key: 'source', label: 'Quelle' }, { key: 'owner', label: 'Verantwortlich' },
          { key: 'due', label: 'Frist', kind: 'date' },
          { label: 'Restzeit', fn: (r) => (r.status === 'Geschlossen' ? '–' : days(r.due)), tone: (v) => (v.startsWith('überfällig') ? 'bad' : '') },
          { key: 'status', label: 'Status', tone: capaTone }
        ],
        actions: [
          { label: 'Starten', when: (r) => r.status === 'Offen', apply: (r) => { r.status = 'In Bearbeitung'; return ev(S_.ANY, `${r.id} gestartet, Aufgabe an ${r.owner} erstellt`); } },
          { label: 'Zur Wirksamkeitsprüfung', when: (r) => r.status === 'In Bearbeitung', apply: (r) => { r.status = 'Wirksamkeit prüfen'; return ev(S_.QA, `Qualitätsauftrag zur Wirksamkeitsprüfung für ${r.id} angelegt`); } },
          { label: 'Wirksam – schließen', when: (r) => r.status === 'Wirksamkeit prüfen', fields: [{ key: 'n', label: 'Nachweis der Wirksamkeit' }], apply: (r, e, v) => { r.status = 'Geschlossen'; return ev(S_.QA, `${r.id} geschlossen: ${v.n}`); } },
          { label: 'Eskalieren', danger: true, when: (r) => r.status !== 'Geschlossen' && diff(r.due) < 0, apply: (r) => ev(S_.ANY, `Eskalation für ${r.id} an Bereichsleitung gesendet (Teams)`) }
        ],
        add: {
          label: 'Neue CAPA', fields: [{ key: 'title', label: 'Titel' }, { key: 'owner', label: 'Verantwortlich', options: ['A. Weber', 'S. Hoffmann', 'K. Braun', 'M. Richter'] }, { key: 'days', label: 'Frist in Tagen', type: 'number', value: 30 }],
          make: (v, e) => ({ id: nextId(e.capas, 'CAPA-26-'), title: v.title, source: 'manuell', owner: v.owner, due: d(Number(v.days)), status: 'Offen' }),
          event: (r) => ev(S_.ANY, `${r.id} angelegt`)
        }
      },
      {
        id: 'devs', title: 'Abweichungen aus COSMO QA', type: 'table', entity: 'devs',
        columns: [{ key: 'id', label: 'Abweichung' }, { key: 'desc', label: 'Beschreibung' }, { key: 'source', label: 'Quelle' }, { key: 'date', label: 'Datum', kind: 'date' }, { key: 'status', label: 'Status', tone: tone({ 'Ohne': 'warn', CAPA: 'ok' }) }],
        actions: [{
          label: 'CAPA anlegen', when: (r) => r.status === 'Ohne CAPA',
          apply: (r, e) => { r.status = 'CAPA angelegt'; const id = nextId(e.capas, 'CAPA-26-'); e.capas.unshift({ id, title: r.desc, source: r.id, owner: 'A. Weber', due: d(30), status: 'Offen' }); return ev(S_.ANY, `${id} aus ${r.id} angelegt, Verknüpfung in COSMO QA gesetzt`); }
        }]
      }
    ]
  });

  /* ---------- Änderungsmanagement ---------- */
  CC.define({
    id: 'change', title: 'Änderungsmanagement', role: 'Entwicklung / Regulatory Affairs',
    subtitle: 'Änderungsanträge mit automatischer Where-used-Analyse aus Business Central, Bewertung durch Fachbereiche und signierter Freigabe.',
    integrations: [
      { sys: 'BC', text: 'Where-used aus Stücklisten und Arbeitsplänen, offene Fertigungsaufträge; Freigabe erzeugt neue Versionen.' },
      { sys: 'COSMO QA', text: 'Qualitätsrelevante Prüfpläne werden zur Änderung gelesen.' },
      { sys: 'Anyfy', text: 'Antrags-Workflow, Bewertungsaufgaben je Fachbereich, Signatur, Prüfpfad.' }
    ],
    seed: () => ({
      items: [{ no: 'FO-55', name: 'Folie Peel-Pack 55 µm' }, { no: 'K-200', name: 'Katheter K-200' }, { no: 'K-310', name: 'Katheter K-310' }],
      usage: [
        { item: 'FO-55', kind: 'Stückliste', ref: 'K-200 Rev B', open: '2 Fertigungsaufträge' },
        { item: 'FO-55', kind: 'Stückliste', ref: 'K-310 Rev A', open: '1 Fertigungsauftrag' },
        { item: 'FO-55', kind: 'Arbeitsplan', ref: 'Verpackung Linie 2', open: '–' },
        { item: 'K-200', kind: 'Prüfplan (COSMO QA)', ref: 'QP-K200-END', open: '1 Fertigungsauftrag' },
        { item: 'K-200', kind: 'Stückliste', ref: 'Set S-20 Rev C', open: '–' }
      ],
      ecrs: [
        { id: 'ECR-26-012', title: 'Folienwechsel 55 → 60 µm', item: 'FO-55', owner: 'T. Lang', status: 'Entwurf', impact: '–' },
        { id: 'ECR-26-011', title: 'Neuer Siegelparameter Linie 2', item: 'K-200', owner: 'T. Lang', status: 'Bewertung', impact: '2 Objekte, 1 offener FA' },
        { id: 'ECR-26-009', title: 'Etikettenlayout UDI', item: 'K-310', owner: 'R. Kern', status: 'Freigegeben', impact: '1 Objekt' }
      ]
    }),
    kpis: [
      { label: 'Offene Anträge', fn: (e) => e.ecrs.filter((x) => x.status !== 'Freigegeben').length },
      { label: 'In Bewertung', fn: (e) => e.ecrs.filter((x) => x.status === 'Bewertung').length },
      { label: 'Freigegeben', fn: (e) => e.ecrs.filter((x) => x.status === 'Freigegeben').length, tone: () => 'ok' }
    ],
    tabs: [
      {
        id: 'ecrs', title: 'Änderungsanträge', type: 'table', entity: 'ecrs',
        columns: [{ key: 'id', label: 'Antrag' }, { key: 'title', label: 'Titel' }, { key: 'item', label: 'Artikel' }, { key: 'owner', label: 'Antragsteller' }, { key: 'impact', label: 'Auswirkung' }, { key: 'status', label: 'Status', tone: tone({ Freigegeben: 'ok', Bewertung: 'warn', Impact: 'info' }) }],
        actions: [
          {
            label: 'Impact-Analyse', when: (r) => r.status === 'Entwurf',
            apply: (r, e) => { const u = e.usage.filter((x) => x.item === r.item); r.impact = `${u.length} Objekte`; r.status = 'Impact-Analyse'; return ev(S_.BC, `Where-used für ${r.item}: ${u.length} Stücklisten/Pläne, ${u.filter((x) => x.open !== '–').length} mit offenen Aufträgen`); }
          },
          { label: 'Zur Bewertung', when: (r) => r.status === 'Impact-Analyse', apply: (r) => { r.status = 'Bewertung'; return ev(S_.ANY, `Bewertungsaufgaben an Qualität, Produktion und Regulatory für ${r.id} erstellt`); } },
          { label: 'Freigeben & signieren', when: (r) => r.status === 'Bewertung', fields: [{ key: 'pw', label: 'Passwort (Signatur, simuliert)', type: 'password' }], apply: (r) => { r.status = 'Freigegeben'; return [ev(S_.ANY, `${r.id} signiert und freigegeben`), ev(S_.BC, `Neue Version für ${r.item} zur Zertifizierung angelegt`)]; } },
          { label: 'Ablehnen', danger: true, when: (r) => r.status === 'Bewertung', fields: [{ key: 'g', label: 'Begründung' }], apply: (r, e, v) => { r.status = 'Entwurf'; return ev(S_.ANY, `${r.id} zurückgewiesen: ${v.g}`); } }
        ],
        add: {
          label: 'Neuer Antrag', fields: [{ key: 'title', label: 'Titel' }, { key: 'item', label: 'Artikel', options: ['FO-55', 'K-200', 'K-310'] }],
          make: (v, e) => ({ id: nextId(e.ecrs, 'ECR-26-'), title: v.title, item: v.item, owner: 'M. Beispiel', status: 'Entwurf', impact: '–' }),
          event: (r) => ev(S_.ANY, `${r.id} angelegt`)
        }
      },
      {
        id: 'wu', title: 'Where-used', type: 'lookup', entity: 'items', key: 'no', placeholder: 'Artikelnummer, z. B. FO-55', button: 'Auswirkung zeigen',
        note: 'Live-Abfrage der Verwendungsnachweise aus Business Central.',
        card: [{ key: 'no', label: 'Artikel' }, { key: 'name', label: 'Bezeichnung' }],
        verdict: (r, e) => { const u = e.usage.filter((x) => x.item === r.no); return { tone: u.length ? 'warn' : 'ok', title: `${u.length} Verwendungen`, text: `${u.filter((x) => x.open !== '–').length} davon mit offenen Aufträgen` }; },
        related: [{ entity: 'usage', by: 'item', from: 'no', title: 'Verwendung', columns: [{ key: 'kind', label: 'Objekt' }, { key: 'ref', label: 'Referenz' }, { key: 'open', label: 'Offene Aufträge' }] }]
      }
    ]
  });

  /* ---------- Lieferanten & Wareneingang ---------- */
  const certState = (c) => (diff(c.valid) < 0 ? 'Abgelaufen' : diff(c.valid) < 60 ? 'Läuft bald ab' : 'Gültig');
  const certTone = tone({ Abgelaufen: 'bad', 'Läuft': 'warn', Gültig: 'ok' });
  const supplierState = (name, e) => { const s = e.suppliers.find((x) => x.name === name); if (s && s.blocked) return 'Gesperrt'; const st = e.certs.filter((c) => c.supplier === name).map(certState); return st.includes('Abgelaufen') ? 'Zertifikat abgelaufen' : st.includes('Läuft bald ab') ? 'Zertifikat läuft ab' : 'Qualifiziert'; };
  CC.define({
    id: 'supplier', title: 'Lieferanten & Wareneingang', role: 'Einkauf / Wareneingangsprüfung',
    subtitle: 'Zertifikate überwachen, Lieferanten bewerten und Wareneingänge mobil prüfen. Der Lieferantenstatus wirkt direkt auf die Freigabe.',
    integrations: [
      { sys: 'BC', text: 'Lieferanten, Bestellungen, Wareneingänge, Sperrkennzeichen.' },
      { sys: 'COSMO QA', text: 'Wareneingangsprüfung und Sperrlager-Buchung.' },
      { sys: 'Anyfy', text: 'Zertifikatsablage, Ablauf-Jobs, E-Mail an Lieferanten, mobile Erfassung.' }
    ],
    seed: () => ({
      suppliers: [
        { name: 'PolyFilm GmbH', id: 'LF-1001', cls: 'A', rating: 92 }, { name: 'SterilPack AG', id: 'LF-1002', cls: 'A', rating: 88 },
        { name: 'MetallTec Müller', id: 'LF-1003', cls: 'B', rating: 71 }, { name: 'ChemLab Services', id: 'LF-1004', cls: 'C', rating: 64 }
      ],
      certs: [
        { supplier: 'PolyFilm GmbH', type: 'ISO 13485', valid: d(190) }, { supplier: 'PolyFilm GmbH', type: 'Materialzeugnis F-9921', valid: d(400) },
        { supplier: 'SterilPack AG', type: 'ISO 13485', valid: d(35) }, { supplier: 'MetallTec Müller', type: 'ISO 9001', valid: d(-12) },
        { supplier: 'ChemLab Services', type: 'REACH-Erklärung', valid: d(20) }
      ],
      receipts: [
        { id: 'WE-26-0412', supplier: 'PolyFilm GmbH', item: 'Folie 55 µm', qty: 40, lot: 'F-9921', status: 'Zu prüfen' },
        { id: 'WE-26-0413', supplier: 'MetallTec Müller', item: 'Führungsdraht 0,9 mm', qty: 500, lot: 'MT-2210', status: 'Zu prüfen' },
        { id: 'WE-26-0414', supplier: 'SterilPack AG', item: 'Sterilbarrierebeutel', qty: 2000, lot: 'SP-0707', status: 'Zu prüfen' },
        { id: 'WE-26-0409', supplier: 'ChemLab Services', item: 'Reinigungsmittel IPA', qty: 20, lot: 'CL-118', status: 'Freigegeben' }
      ]
    }),
    kpis: [
      { label: 'Zertifikate abgelaufen', fn: (e) => e.certs.filter((c) => certState(c) === 'Abgelaufen').length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Laufen in 60 Tagen ab', fn: (e) => e.certs.filter((c) => certState(c) === 'Läuft bald ab').length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Wareneingänge zu prüfen', fn: (e) => e.receipts.filter((r) => r.status === 'Zu prüfen').length }
    ],
    tabs: [
      {
        id: 'certs', title: 'Zertifikate', type: 'table', entity: 'certs', filterBy: (r) => certState(r),
        columns: [{ key: 'supplier', label: 'Lieferant' }, { key: 'type', label: 'Nachweis' }, { key: 'valid', label: 'Gültig bis', kind: 'date' }, { label: 'Status', fn: (r) => certState(r), tone: certTone }, { label: 'Maßnahme', fn: (r, e) => (e.suppliers.find((s) => s.name === r.supplier).blocked ? 'Lieferant gesperrt' : r.requested ? 'Erneuerung angefordert' : '–') }],
        actions: [
          { label: 'Erneuerung anfordern', when: (r) => certState(r) !== 'Gültig' && !r.requested, apply: (r) => { r.requested = true; return ev(S_.ANY, `E-Mail an ${r.supplier}: Erneuerung ${r.type} angefordert`); } },
          { label: 'Lieferant sperren', danger: true, when: (r, e) => certState(r) === 'Abgelaufen' && !e.suppliers.find((s) => s.name === r.supplier).blocked, apply: (r, e) => { const s = e.suppliers.find((x) => x.name === r.supplier); s.blocked = true; return ev(S_.BC, `Lieferant ${s.id} gesperrt (Bestellungen blockiert)`); } }
        ]
      },
      {
        id: 'sup', title: 'Lieferantenbewertung', type: 'table', entity: 'suppliers', filterBy: (r, e) => supplierState(r.name, e),
        columns: [{ key: 'id', label: 'Nr.' }, { key: 'name', label: 'Lieferant' }, { key: 'cls', label: 'Klasse' }, { key: 'rating', label: 'Bewertung (Punkte)' }, { label: 'Status', fn: (r, e) => supplierState(r.name, e), tone: tone({ Qualifiziert: 'ok', Gesperrt: 'bad', Zertifikat: 'warn' }) }],
        actions: [{ label: 'Sperre aufheben', when: (r) => r.blocked, apply: (r) => { r.blocked = false; return ev(S_.BC, `Sperrkennzeichen für ${r.id} entfernt`); } }]
      },
      {
        id: 'we', title: 'Wareneingang', type: 'lookup', entity: 'receipts', key: 'id', placeholder: 'Wareneingang, z. B. WE-26-0413', button: 'Prüfung öffnen',
        card: [{ key: 'supplier', label: 'Lieferant' }, { key: 'item', label: 'Artikel' }, { key: 'qty', label: 'Menge' }, { key: 'lot', label: 'Lieferantencharge' }, { key: 'status', label: 'Status', tone: tone({ Freigegeben: 'ok', Gesperrt: 'bad' }) }],
        verdict: (r, e) => { const s = supplierState(r.supplier, e); return s === 'Qualifiziert' ? { tone: 'ok', title: 'Lieferant qualifiziert', text: 'Alle Nachweise gültig.' } : s === 'Zertifikat läuft ab' ? { tone: 'warn', title: 'Lieferant eingeschränkt', text: 'Ein Nachweis läuft in Kürze ab.' } : { tone: 'bad', title: s, text: 'Freigabe nicht zulässig, Ware ins Sperrlager.' }; },
        actions: [
          { label: 'Prüfung bestanden – freigeben', when: (r, e) => r.status === 'Zu prüfen' && !['Gesperrt', 'Zertifikat abgelaufen'].includes(supplierState(r.supplier, e)), apply: (r) => { r.status = 'Freigegeben'; return [ev(S_.QA, `Wareneingangsprüfung ${r.id} bestanden`), ev(S_.BC, `${r.qty} × ${r.item} ins Hauptlager gebucht`)]; } },
          { label: 'Sperren (Sperrlager)', danger: true, when: (r) => r.status === 'Zu prüfen', fields: [{ key: 'g', label: 'Grund' }], apply: (r, e, v) => { r.status = 'Gesperrt'; return [ev(S_.QA, `Qualitätsauftrag zu ${r.id}: ${v.g}`), ev(S_.BC, `Umlagerung ${r.lot} ins Sperrlager`)]; } }
        ]
      }
    ]
  });

  /* ---------- Rückverfolgung & Rückruf ---------- */
  CC.define({
    id: 'recall', title: 'Rückverfolgung & Rückruf (FSCA)', role: 'Qualität / Regulatory Affairs',
    subtitle: 'Von der Charge zu Lagerbestand, Lieferungen und Kunden in Sekunden. Rückruf sperrt den Bestand und steuert die Kundeninformation.',
    integrations: [
      { sys: 'COSMO UDI', text: 'UDI-DI/PI je Charge und Lieferung.' },
      { sys: 'BC', text: 'Chargenverfolgung, Lagerbestand, Verkaufslieferungen; Sperrbuchung der Charge.' },
      { sys: 'Anyfy', text: 'Rückrufprozess, Kundenschreiben, Rücklaufverfolgung, Prüfpfad.' }
    ],
    seed: () => ({
      lots: [
        { lot: 'L26-0481', item: 'Katheter K-200', produced: d(-30), qty: 1200, status: 'Freigegeben', udi: '(01)04012345678901(10)L26-0481' },
        { lot: 'L26-0455', item: 'Katheter K-200', produced: d(-58), qty: 1000, status: 'Freigegeben', udi: '(01)04012345678901(10)L26-0455' },
        { lot: 'L26-0399', item: 'Katheter K-310', produced: d(-120), qty: 800, status: 'Freigegeben', udi: '(01)04012345678918(10)L26-0399' }
      ],
      stock: [{ lot: 'L26-0481', location: 'Hauptlager', qty: 310 }, { lot: 'L26-0481', location: 'Konsignationslager Wien', qty: 40 }, { lot: 'L26-0455', location: 'Hauptlager', qty: 120 }, { lot: 'L26-0399', location: 'Hauptlager', qty: 60 }],
      ships: [
        { lot: 'L26-0481', customer: 'Klinikum Nord', country: 'DE', qty: 400, status: 'Geliefert', back: 0 },
        { lot: 'L26-0481', customer: 'Medicare Distribution', country: 'AT', qty: 250, status: 'Geliefert', back: 0 },
        { lot: 'L26-0481', customer: 'Hôpital Central', country: 'FR', qty: 200, status: 'Geliefert', back: 0 },
        { lot: 'L26-0455', customer: 'MedSupply Iberia', country: 'ES', qty: 600, status: 'Geliefert', back: 0 },
        { lot: 'L26-0399', customer: 'Klinikum Nord', country: 'DE', qty: 300, status: 'Geliefert', back: 0 }
      ]
    }),
    kpis: [
      { label: 'Aktive Rückrufe', fn: (e) => e.lots.filter((l) => l.status === 'Rückruf').length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Kunden ohne Bestätigung', fn: (e) => e.ships.filter((s) => ['Kundeninfo offen', 'Kundeninfo gesendet'].includes(s.status)).length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Rücklaufquote', fn: (e) => { const t = e.ships.filter((s) => e.lots.find((l) => l.lot === s.lot).status === 'Rückruf'); const q = t.reduce((a, s) => a + s.qty, 0); return q ? Math.round((t.reduce((a, s) => a + s.back, 0) / q) * 100) + ' %' : '–'; } }
    ],
    tabs: [
      {
        id: 'lot', title: 'Charge suchen', type: 'lookup', entity: 'lots', key: 'lot', placeholder: 'Charge, z. B. L26-0481', button: 'Rückverfolgen',
        card: [{ key: 'item', label: 'Artikel' }, { key: 'produced', label: 'Produziert', kind: 'date' }, { key: 'qty', label: 'Menge' }, { key: 'udi', label: 'UDI (COSMO UDI)' }, { key: 'status', label: 'Status', tone: tone({ Rückruf: 'bad', Freigegeben: 'ok' }) }],
        verdict: (r, e) => { const s = e.ships.filter((x) => x.lot === r.lot), st = e.stock.filter((x) => x.lot === r.lot); return { tone: r.status === 'Rückruf' ? 'bad' : 'warn', title: `${s.length} Kunden in ${new Set(s.map((x) => x.country)).size} Ländern, ${s.reduce((a, x) => a + x.qty, 0)} Stück beim Kunden, ${st.reduce((a, x) => a + x.qty, 0)} Stück im Lager`, text: 'Rückverfolgung in unter einer Sekunde statt Tagen.' }; },
        related: [
          { entity: 'stock', by: 'lot', title: 'Lagerbestand', columns: [{ key: 'location', label: 'Lagerort' }, { key: 'qty', label: 'Menge' }] },
          { entity: 'ships', by: 'lot', title: 'Lieferungen', columns: [{ key: 'customer', label: 'Kunde' }, { key: 'country', label: 'Land' }, { key: 'qty', label: 'Menge' }, { key: 'status', label: 'Status' }] }
        ],
        actions: [{
          label: 'Rückruf starten', danger: true, when: (r) => r.status !== 'Rückruf', fields: [{ key: 'g', label: 'Grund', options: ['Sterilitätsverdacht', 'Kennzeichnungsfehler', 'Leistungsabweichung'] }],
          apply: (r, e, v) => { r.status = 'Rückruf'; e.ships.filter((s) => s.lot === r.lot).forEach((s) => { s.status = 'Kundeninfo offen'; }); const n = e.stock.filter((x) => x.lot === r.lot).reduce((a, x) => a + x.qty, 0); return [ev(S_.BC, `Charge ${r.lot} gesperrt, ${n} Stück im Lager blockiert`), ev(S_.UDI, `FSCA-Vorgang für ${r.lot} angelegt (${v.g})`), ev(S_.ANY, 'Kundenschreiben je Kunde vorbereitet')]; }
        }]
      },
      {
        id: 'cust', title: 'Kundeninformation', type: 'table', entity: 'ships',
        columns: [{ key: 'lot', label: 'Charge' }, { key: 'customer', label: 'Kunde' }, { key: 'country', label: 'Land' }, { key: 'qty', label: 'Geliefert' }, { key: 'back', label: 'Zurück' }, { key: 'status', label: 'Status', tone: tone({ Bestätigt: 'ok', 'Kundeninfo': 'warn' }) }],
        actions: [
          { label: 'Schreiben senden', when: (r) => r.status === 'Kundeninfo offen', apply: (r) => { r.status = 'Kundeninfo gesendet'; return ev(S_.ANY, `Kundenschreiben an ${r.customer} (${r.country}) versendet`); } },
          { label: 'Rückmeldung erfassen', when: (r) => r.status === 'Kundeninfo gesendet', fields: [{ key: 'q', label: 'Zurückgesendete Menge', type: 'number', value: 0 }], apply: (r, e, v) => { r.back = Number(v.q); r.status = 'Bestätigt'; return ev(S_.BC, `${r.back} Stück Retoure von ${r.customer} gebucht`); } }
        ]
      }
    ]
  });

  /* ---------- Reklamationen & Vigilanz ---------- */
  const decisions = { 'Schwere Gefahr für die öffentliche Gesundheit': 2, 'Tod / unerwartete schwere Verschlechterung': 10, 'Sonstiger schwerwiegender Vorfall': 15, 'Nicht meldepflichtig': 0 };
  CC.define({
    id: 'pms', title: 'Reklamationen & Vigilanz', role: 'Vigilanzbeauftragter',
    subtitle: 'Feldmeldungen erfassen, Meldepflicht bewerten und Fristen überwachen. Die Entscheidungshilfe ist beispielhaft und ersetzt keine regulatorische Bewertung.',
    integrations: [
      { sys: 'COSMO UDI', text: 'Prüft UDI und Charge der gemeldeten Einheit.' },
      { sys: 'BC', text: 'Serviceauftrag/Reklamation und Debitor zum Fall.' },
      { sys: 'COSMO QA', text: 'CAPA und Abweichung zum Fall.' },
      { sys: 'Anyfy', text: 'Bewertungsworkflow, Fristen-Timer, Meldeformular.' }
    ],
    seed: () => ({
      cases: [
        { id: 'RK-26-031', product: 'Katheter K-200', lot: 'L26-0481', country: 'DE', text: 'Siegelnaht beim Öffnen undicht', received: d(-3), status: 'Neu', decision: '–', deadline: '' },
        { id: 'RK-26-029', product: 'Katheter K-310', lot: 'L26-0399', country: 'FR', text: 'Gewebereaktion nach Anwendung', received: d(-8), status: 'Neu', decision: '–', deadline: '' },
        { id: 'RK-26-024', product: 'Katheter K-200', lot: 'L26-0455', country: 'ES', text: 'Verpackung beschädigt', received: d(-20), status: 'Nicht meldepflichtig', decision: 'Nicht meldepflichtig', deadline: '' },
        { id: 'RK-26-020', product: 'Katheter K-200', lot: 'L26-0455', country: 'AT', text: 'Katheterbruch während Einsatz', received: d(-30), status: 'Gemeldet', decision: 'Sonstiger schwerwiegender Vorfall', deadline: d(-15) }
      ]
    }),
    kpis: [
      { label: 'Neu, unbewertet', fn: (e) => e.cases.filter((c) => c.status === 'Neu').length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Meldepflichtig, offen', fn: (e) => e.cases.filter((c) => ['Meldepflichtig', 'Meldung vorbereitet'].includes(c.status)).length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Frist in ≤ 3 Tagen', fn: (e) => e.cases.filter((c) => ['Meldepflichtig', 'Meldung vorbereitet'].includes(c.status) && diff(c.deadline) <= 3).length, tone: (v) => (v ? 'bad' : 'ok') }
    ],
    tabs: [{
      id: 'cases', title: 'Reklamationen', type: 'table', entity: 'cases',
      columns: [{ key: 'id', label: 'Fall' }, { key: 'product', label: 'Produkt' }, { key: 'lot', label: 'Charge' }, { key: 'country', label: 'Land' }, { key: 'text', label: 'Beschreibung' }, { key: 'received', label: 'Eingang', kind: 'date' }, { label: 'Meldefrist', fn: (r) => (!r.deadline ? '–' : ['Gemeldet'].includes(r.status) ? 'erledigt' : `${fmt(r.deadline)} (${days(r.deadline)})`), tone: (v) => (v.includes('überfällig') || /in [0-3] T/.test(v) ? 'bad' : '') }, { key: 'status', label: 'Status', tone: tone({ Gemeldet: 'ok', Nicht: 'ok', Neu: 'warn', Meldepflichtig: 'bad', Meldung: 'info' }) }],
      actions: [
        {
          label: 'Bewerten', when: (r) => r.status === 'Neu', fields: [{ key: 'd', label: 'Einstufung', options: Object.keys(decisions) }],
          apply: (r, e, v) => { r.decision = v.d; const n = decisions[v.d]; if (!n) { r.status = 'Nicht meldepflichtig'; return ev(S_.ANY, `${r.id}: nicht meldepflichtig, Begründung dokumentiert`); } r.status = 'Meldepflichtig'; r.deadline = new Date(Date.parse(r.received) + n * 864e5).toISOString().slice(0, 10); return ev(S_.ANY, `${r.id}: meldepflichtig, Fristen-Timer gestartet (${n} Tage)`); }
        },
        { label: 'Meldung vorbereiten', when: (r) => r.status === 'Meldepflichtig', apply: (r) => { r.status = 'Meldung vorbereitet'; return [ev(S_.UDI, `UDI und Chargendaten zu ${r.lot} geprüft`), ev(S_.ANY, `Meldeformular für ${r.id} vorausgefüllt`)]; } },
        { label: 'Als gemeldet markieren', when: (r) => r.status === 'Meldung vorbereitet', fields: [{ key: 'ref', label: 'Referenznummer der Behörde' }], apply: (r, e, v) => { r.status = 'Gemeldet'; return ev(S_.ANY, `${r.id} gemeldet, Referenz ${v.ref}`); } },
        { label: 'CAPA anlegen', when: (r) => r.status !== 'Neu' && !r.capa, apply: (r) => { r.capa = true; return [ev(S_.QA, `CAPA aus ${r.id} angelegt`), ev(S_.BC, `Serviceauftrag zu ${r.id} verknüpft`)]; } }
      ],
      add: {
        label: 'Reklamation erfassen', fields: [{ key: 'product', label: 'Produkt', options: ['Katheter K-200', 'Katheter K-310'] }, { key: 'lot', label: 'Charge', options: ['L26-0481', 'L26-0455', 'L26-0399'] }, { key: 'country', label: 'Land', options: ['DE', 'AT', 'FR', 'ES'] }, { key: 'text', label: 'Beschreibung' }],
        make: (v, e) => ({ id: nextId(e.cases, 'RK-26-'), ...v, received: d(0), status: 'Neu', decision: '–', deadline: '' }),
        event: (r) => ev(S_.UDI, `${r.id}: Charge ${r.lot} gegen UDI-Daten geprüft`)
      }
    }]
  });

  /* ---------- Prüfmittel & Kalibrierung ---------- */
  const calState = (t) => (diff(t.due) < 0 ? 'Überfällig – gesperrt' : diff(t.due) <= 14 ? 'Fällig bald' : 'Gültig');
  const calTone = tone({ Überfällig: 'bad', Fällig: 'warn', Gültig: 'ok' });
  CC.define({
    id: 'calibration', title: 'Prüfmittel & Kalibrierung', role: 'Prüfmittelverwaltung / Fertigung',
    subtitle: 'Prüfmittel vor Nutzung scannen. Überfällige Geräte sind automatisch gesperrt und können im eMBR nicht verwendet werden.',
    integrations: [
      { sys: 'BC', text: 'Anlagen, Wartungsaufträge und Kalibrierintervalle.' },
      { sys: 'Anyfy', text: 'Scan-Prüfung, Sperrlogik, Verwendungsprotokoll, Zertifikatsanhang.' }
    ],
    seed: () => ({
      tools: [
        { id: 'PM-1001', name: 'Messschieber digital', loc: 'Messraum', last: d(-340), due: d(25) },
        { id: 'PM-1002', name: 'Peelkraft-Prüfgerät', loc: 'Labor', last: d(-374), due: d(-9) },
        { id: 'PM-1003', name: 'Präzisionswaage', loc: 'Wareneingang', last: d(-290), due: d(75) },
        { id: 'PM-1004', name: 'Siegelgerät Linie 2 (Temperatur)', loc: 'Verpackung', last: d(-205), due: d(160) },
        { id: 'PM-1005', name: 'Rauheitsmessgerät (Ra)', loc: 'Endkontrolle', last: d(-357), due: d(8) }
      ]
    }),
    kpis: [
      { label: 'Überfällig / gesperrt', fn: (e) => e.tools.filter((t) => diff(t.due) < 0).length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Fällig in 14 Tagen', fn: (e) => e.tools.filter((t) => diff(t.due) >= 0 && diff(t.due) <= 14).length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Prüfmittel gesamt', fn: (e) => e.tools.length }
    ],
    tabs: [
      {
        id: 'scan', title: 'Scan', type: 'lookup', entity: 'tools', key: 'id', placeholder: 'Prüfmittel-Nr. scannen, z. B. PM-1002', button: 'Prüfen',
        card: [{ key: 'name', label: 'Prüfmittel' }, { key: 'loc', label: 'Standort' }, { key: 'last', label: 'Letzte Kalibrierung', kind: 'date' }, { key: 'due', label: 'Nächste fällig', kind: 'date' }],
        verdict: (r) => { const s = calState(r); return s.startsWith('Überfällig') ? { tone: 'bad', title: 'GESPERRT: Kalibrierung überfällig', text: `Seit ${-diff(r.due)} Tagen. Verwendung im Prüfschritt nicht zulässig.` } : s === 'Fällig bald' ? { tone: 'warn', title: 'Verwendbar, Kalibrierung bald fällig', text: `Noch ${diff(r.due)} Tage.` } : { tone: 'ok', title: 'Verwendbar', text: `Kalibrierung gültig, noch ${diff(r.due)} Tage.` }; },
        actions: [
          { label: 'Im Prüfschritt verwenden', when: (r) => diff(r.due) >= 0, apply: (r) => ev(S_.ANY, `Verwendung von ${r.id} im Prüfschritt protokolliert`) },
          { label: 'Kalibrierung erfassen', when: (r) => diff(r.due) <= 14, fields: [{ key: 'z', label: 'Zertifikatsnummer' }], apply: (r, e, v) => { r.last = d(0); r.due = d(365); return ev(S_.BC, `Wartungsauftrag für ${r.id} abgeschlossen, Zertifikat ${v.z} verknüpft`); } }
        ]
      },
      {
        id: 'list', title: 'Prüfmittelliste', type: 'table', entity: 'tools', filterBy: (r) => calState(r),
        columns: [{ key: 'id', label: 'Nr.' }, { key: 'name', label: 'Prüfmittel' }, { key: 'loc', label: 'Standort' }, { key: 'due', label: 'Fällig am', kind: 'date' }, { label: 'Status', fn: (r) => calState(r), tone: calTone }],
        actions: [{ label: 'Kalibrierung erfassen', when: (r) => diff(r.due) <= 14, fields: [{ key: 'z', label: 'Zertifikatsnummer' }], apply: (r, e, v) => { r.last = d(0); r.due = d(365); return ev(S_.BC, `Wartungsauftrag für ${r.id} abgeschlossen, Zertifikat ${v.z} verknüpft`); } }]
      }
    ]
  });

  /* ---------- Schulung & Befähigung ---------- */
  const qState = (q) => (!q ? 'Keine' : diff(q.valid) < 0 ? 'Abgelaufen' : diff(q.valid) < 30 ? 'Läuft bald ab' : 'Gültig');
  const qTone = tone({ Gültig: 'ok', Abgelaufen: 'bad', Keine: 'bad', 'Läuft': 'warn' });
  const qOf = (e, emp, skill) => e.quals.find((q) => q.emp === emp && q.skill === skill);
  CC.define({
    id: 'training', title: 'Schulung & Befähigung', role: 'Produktionsleitung / Qualität',
    subtitle: 'Befähigungsmatrix je Mitarbeiter und Tätigkeit. Beim Schrittstart und bei der Signatur wird die Befähigung geprüft.',
    integrations: [
      { sys: 'BC', text: 'Mitarbeiter und Ressourcen, Schichtzuordnung.' },
      { sys: 'Anyfy', text: 'Befähigungsklasse, Prüf-Function für den eMBR-Schrittstart, Erinnerungen.' }
    ],
    seed: () => ({
      employees: [{ name: 'A. Weber' }, { name: 'S. Hoffmann' }, { name: 'K. Braun' }, { name: 'L. Vogt' }],
      steps: [{ name: 'Siegelprozess' }, { name: 'Reinraum-Zutritt' }, { name: 'Sterilverpackung' }, { name: 'Endkontrolle' }],
      quals: [
        { emp: 'A. Weber', skill: 'Siegelprozess', valid: d(120) }, { emp: 'A. Weber', skill: 'Reinraum-Zutritt', valid: d(200) }, { emp: 'A. Weber', skill: 'Endkontrolle', valid: d(15) },
        { emp: 'S. Hoffmann', skill: 'Siegelprozess', valid: d(-20) }, { emp: 'S. Hoffmann', skill: 'Sterilverpackung', valid: d(300) },
        { emp: 'K. Braun', skill: 'Endkontrolle', valid: d(400) }, { emp: 'K. Braun', skill: 'Reinraum-Zutritt', valid: d(90) },
        { emp: 'L. Vogt', skill: 'Reinraum-Zutritt', valid: d(60) }
      ]
    }),
    kpis: [
      { label: 'Abgelaufen', fn: (e) => e.quals.filter((q) => qState(q) === 'Abgelaufen').length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Laufen in 30 Tagen ab', fn: (e) => e.quals.filter((q) => qState(q) === 'Läuft bald ab').length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Gültige Befähigungen', fn: (e) => e.quals.filter((q) => qState(q) === 'Gültig').length, tone: () => 'ok' }
    ],
    tabs: [
      {
        id: 'check', title: 'Prüfung vor Schrittstart', type: 'check',
        note: 'Wird beim Start eines eMBR-Schritts und bei der Signatur automatisch aufgerufen.',
        selects: [{ key: 'emp', label: 'Mitarbeiter', entity: 'employees', value: (r) => r.name, text: (r) => r.name }, { key: 'step', label: 'Arbeitsschritt', entity: 'steps', value: (r) => r.name, text: (r) => r.name }],
        verdict: (v, e) => { const s = qState(qOf(e, v.emp, v.step)); return s === 'Gültig' ? { tone: 'ok', title: 'Befähigt', text: `${v.emp} darf „${v.step}“ ausführen.` } : s === 'Läuft bald ab' ? { tone: 'warn', title: 'Befähigt, läuft bald ab', text: 'Schulung rechtzeitig planen.' } : { tone: 'bad', title: s === 'Keine' ? 'Keine Befähigung' : 'Befähigung abgelaufen', text: `${v.emp} darf „${v.step}“ nicht ausführen. Schritt bleibt gesperrt.` }; },
        action: { label: 'Schritt im eMBR starten', apply: (v) => ev(S_.ANY, `Befähigung ${v.emp} / ${v.step} geprüft, Schritt freigegeben`) }
      },
      {
        id: 'matrix', title: 'Befähigungsmatrix', type: 'matrix', rowEntity: 'employees', colEntity: 'steps', rowLabel: (r) => r.name, colLabel: (c) => c.name,
        cell: (r, c, e) => { const s = qState(qOf(e, r.name, c.name)); return { text: s === 'Gültig' ? '✓' : s === 'Keine' ? '–' : s === 'Abgelaufen' ? '✕' : '!', tone: qTone(s) }; },
        note: '✓ gültig · ! läuft bald ab · ✕ abgelaufen · – keine Befähigung'
      },
      {
        id: 'quals', title: 'Befähigungen', type: 'table', entity: 'quals', filterBy: (r) => qState(r),
        columns: [{ key: 'emp', label: 'Mitarbeiter' }, { key: 'skill', label: 'Tätigkeit' }, { key: 'valid', label: 'Gültig bis', kind: 'date' }, { label: 'Status', fn: (r) => (r.booked ? 'Schulung gebucht' : qState(r)), tone: (v) => (v.startsWith('Schulung') ? 'info' : qTone(v)) }],
        actions: [
          { label: 'Schulung buchen', when: (r) => qState(r) !== 'Gültig' && !r.booked, apply: (r) => { r.booked = true; return ev(S_.ANY, `Schulung ${r.skill} für ${r.emp} gebucht, Einladung gesendet`); } },
          { label: 'Befähigung bestätigen', when: (r) => r.booked, fields: [{ key: 't', label: 'Trainer' }], apply: (r, e, v) => { r.booked = false; r.valid = d(730); return ev(S_.ANY, `Befähigung ${r.skill} für ${r.emp} durch ${v.t} bestätigt, gültig bis ${fmt(r.valid)}`); } }
        ]
      }
    ]
  });

  /* ---------- Reinraum & Umgebung ---------- */
  const ptState = (p) => (p.last < p.min || p.last > p.max ? 'Außer Grenzwert' : 'In Ordnung');
  CC.define({
    id: 'cleanroom', title: 'Reinraum & Umgebung', role: 'Reinraum-Monitoring / Qualität',
    subtitle: 'Digitale Messrundgänge am Tablet mit Grenzwertprüfung und Trend. Eine Überschreitung erzeugt automatisch eine Abweichung in COSMO QA.',
    integrations: [
      { sys: 'COSMO QA', text: 'Grenzwerte als Prüfmerkmale, Abweichung bei Überschreitung.' },
      { sys: 'BC', text: 'Räume und Messmittel als Ressourcen.' },
      { sys: 'Anyfy', text: 'Messpunkt-Klassen, Trend, optional Sensor-/IoT-Anbindung.' }
    ],
    seed: () => ({
      points: [
        { id: 'RR-01', room: 'Reinraum 1 (ISO 7)', param: 'Partikel ≥0,5 µm (/m³)', min: 0, max: 352000, hist: [210000, 240000, 255000, 262000, 270000], last: 270000 },
        { id: 'RR-02', room: 'Reinraum 1 (ISO 7)', param: 'Temperatur (°C)', min: 18, max: 24, hist: [21.2, 21.6, 22.4, 23.1, 23.4], last: 23.4 },
        { id: 'RR-03', room: 'Reinraum 2 (ISO 7)', param: 'Rel. Feuchte (%)', min: 30, max: 60, hist: [44, 47, 52, 56, 58], last: 58 },
        { id: 'RR-04', room: 'Schleuse', param: 'Differenzdruck (Pa)', min: 10, max: 25, hist: [16, 15, 14, 12, 11], last: 11 }
      ],
      devs: []
    }),
    kpis: [
      { label: 'Messpunkte außer Grenzwert', fn: (e) => e.points.filter((p) => ptState(p) !== 'In Ordnung').length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Offene Abweichungen', fn: (e) => e.devs.filter((x) => x.status !== 'Geschlossen').length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Messpunkte', fn: (e) => e.points.length }
    ],
    tabs: [
      {
        id: 'round', title: 'Rundgang', type: 'table', entity: 'points', filterBy: (r) => r.room,
        note: 'Messwert eingeben: Beispiel Temperatur RR-02 = 25 löst eine Abweichung aus. Gestrichelte Linien im Trend zeigen die Grenzwerte.',
        columns: [{ key: 'id', label: 'Punkt' }, { key: 'room', label: 'Raum' }, { key: 'param', label: 'Parameter' }, { label: 'Grenzwerte', fn: (r) => `${r.min} – ${r.max}` }, { key: 'last', label: 'Letzter Wert' }, { kind: 'spark', label: 'Trend' }, { label: 'Status', fn: (r) => ptState(r), tone: tone({ 'In': 'ok', Außer: 'bad' }) }],
        actions: [{
          label: 'Messwert erfassen', fields: [{ key: 'v', label: 'Messwert', type: 'number', step: 'any' }],
          apply: (r, e, v) => {
            const x = Number(v.v); r.hist = [...r.hist.slice(-9), x]; r.last = x;
            if (x < r.min || x > r.max) { const id = nextId(e.devs, 'RD-26-'); e.devs.unshift({ id, point: r.id, text: `${r.param}: ${x} außerhalb ${r.min}–${r.max}`, status: 'Offen' }); return [ev(S_.ANY, `${r.id}: Wert ${x} außerhalb der Grenzwerte`), ev(S_.QA, `Abweichung ${id} angelegt`)]; }
            return ev(S_.ANY, `${r.id}: Wert ${x} gespeichert (in Ordnung)`);
          }
        }]
      },
      {
        id: 'devs', title: 'Abweichungen', type: 'table', entity: 'devs',
        columns: [{ key: 'id', label: 'Abweichung' }, { key: 'point', label: 'Messpunkt' }, { key: 'text', label: 'Beschreibung' }, { key: 'status', label: 'Status', tone: tone({ Geschlossen: 'ok', Offen: 'bad', 'In': 'warn' }) }],
        actions: [
          { label: 'Ursache bewerten', when: (r) => r.status === 'Offen', fields: [{ key: 'u', label: 'Ursache' }], apply: (r, e, v) => { r.status = 'In Bewertung'; return ev(S_.QA, `${r.id}: Ursache „${v.u}“ erfasst`); } },
          { label: 'Schließen', when: (r) => r.status === 'In Bewertung', apply: (r) => { r.status = 'Geschlossen'; return ev(S_.QA, `${r.id} geschlossen`); } }
        ]
      }
    ]
  });

  /* ---------- Audit-Readiness ---------- */
  const docs = ['Chargenakte (eMBR)', 'Prüfergebnisse', 'UDI-Daten', 'Wareneingangsprüfungen', 'Kalibrierstatus', 'Schulungsnachweise'];
  const docSys = { 'Chargenakte (eMBR)': 'Anyfy', Prüfergebnisse: 'COSMO QA', 'UDI-Daten': 'COSMO UDI', Wareneingangsprüfungen: 'COSMO QA', Kalibrierstatus: 'BC', Schulungsnachweise: 'Anyfy' };
  CC.define({
    id: 'audit', title: 'Audit-Readiness', role: 'Qualitätsmanagement / Auditbegleitung',
    subtitle: 'Nachweispaket je Charge auf Knopfdruck. Lücken werden vor dem Audit sichtbar, Auditoren erhalten einen zeitlich begrenzten Lesezugriff.',
    integrations: [
      { sys: 'COSMO QA', text: 'Prüfergebnisse und Wareneingangsprüfungen.' },
      { sys: 'COSMO UDI', text: 'UDI-Daten je Charge.' },
      { sys: 'BC', text: 'Kalibrier- und Anlagenstatus, Chargenstamm.' },
      { sys: 'Anyfy', text: 'Aggregation, Export mit Hash, Auditorrolle (nur lesen), Prüfpfad.' }
    ],
    seed: () => ({
      batches: [{ id: 'L26-0481', product: 'Katheter K-200' }, { id: 'L26-0455', product: 'Katheter K-200' }, { id: 'L26-0399', product: 'Katheter K-310' }],
      evidence: [].concat(...['L26-0481', 'L26-0455', 'L26-0399'].map((b) => docs.map((doc) => ({ batch: b, doc, system: docSys[doc], ok: !((b === 'L26-0481' && doc === 'Kalibrierstatus') || (b === 'L26-0399' && ['Schulungsnachweise', 'UDI-Daten'].includes(doc))), requested: false })))),
      audits: [
        { id: 'AU-26-03', auditor: 'Benannte Stelle (MDR)', date: d(21), scope: 'Produktion K-200', status: 'Geplant' },
        { id: 'AU-26-04', auditor: 'Kundenaudit', date: d(60), scope: 'Lieferantenmanagement', status: 'Geplant' }
      ]
    }),
    kpis: [
      { label: 'Nachweislücken', fn: (e) => e.evidence.filter((x) => !x.ok).length, tone: (v) => (v ? 'bad' : 'ok') },
      { label: 'Vollständige Chargen', fn: (e) => e.batches.filter((b) => e.evidence.filter((x) => x.batch === b.id).every((x) => x.ok)).length + ' / ' + e.batches.length },
      { label: 'Nächstes Audit in', fn: (e) => Math.min(...e.audits.filter((a) => a.status !== 'Abgeschlossen').map((a) => diff(a.date))) + ' Tagen' }
    ],
    tabs: [
      {
        id: 'pack', title: 'Nachweispaket', type: 'lookup', entity: 'batches', key: 'id', placeholder: 'Charge, z. B. L26-0481', button: 'Paket prüfen',
        card: [{ key: 'product', label: 'Produkt' }],
        verdict: (r, e) => { const m = e.evidence.filter((x) => x.batch === r.id && !x.ok); return m.length ? { tone: 'bad', title: `${m.length} Nachweis(e) fehlen`, text: m.map((x) => x.doc).join(', ') } : { tone: 'ok', title: 'Nachweispaket vollständig', text: 'Export möglich.' }; },
        related: [{ entity: 'evidence', by: 'batch', from: 'id', title: 'Nachweise', columns: [{ key: 'doc', label: 'Nachweis' }, { key: 'system', label: 'Quelle' }, { label: 'Status', fn: (x) => (x.ok ? 'Vorhanden' : 'Fehlt'), tone: tone({ Vorhanden: 'ok', Fehlt: 'bad' }) }] }],
        actions: [{ label: 'Paket exportieren (PDF + Hash)', when: (r, e) => e.evidence.filter((x) => x.batch === r.id).every((x) => x.ok), apply: (r) => ev(S_.ANY, `Nachweispaket ${r.id} exportiert, SHA-256 im Prüfpfad abgelegt`) }]
      },
      {
        id: 'gaps', title: 'Lücken', type: 'table', entity: 'evidence', filterBy: (r) => (r.ok ? 'Vorhanden' : 'Fehlt'),
        columns: [{ key: 'batch', label: 'Charge' }, { key: 'doc', label: 'Nachweis' }, { key: 'system', label: 'Quelle' }, { label: 'Status', fn: (r) => (r.ok ? 'Vorhanden' : r.requested ? 'Nachforderung offen' : 'Fehlt'), tone: tone({ Vorhanden: 'ok', Fehlt: 'bad', Nachforderung: 'warn' }) }],
        actions: [
          { label: 'Nachforderung anlegen', when: (r) => !r.ok && !r.requested, apply: (r) => { r.requested = true; return ev(S_.ANY, `Aufgabe für ${r.doc} (${r.batch}) an Verantwortlichen in ${r.system} erstellt`); } },
          { label: 'Nachweis ergänzt', when: (r) => !r.ok && r.requested, apply: (r) => { r.ok = true; return ev(r.system, `${r.doc} für ${r.batch} nachgetragen`); } }
        ]
      },
      {
        id: 'audits', title: 'Audittermine', type: 'table', entity: 'audits',
        columns: [{ key: 'id', label: 'Audit' }, { key: 'auditor', label: 'Auditor' }, { key: 'date', label: 'Datum', kind: 'date' }, { key: 'scope', label: 'Umfang' }, { key: 'status', label: 'Status', tone: tone({ Auditmodus: 'warn', Abgeschlossen: 'ok' }) }],
        actions: [
          { label: 'Auditmodus aktivieren', when: (r) => r.status === 'Geplant', apply: (r) => { r.status = 'Auditmodus aktiv'; return ev(S_.ANY, `Auditorrolle (nur lesen, 3 Tage) für ${r.id} aktiviert, Zugriffe werden protokolliert`); } },
          { label: 'Abschließen', when: (r) => r.status === 'Auditmodus aktiv', apply: (r) => { r.status = 'Abgeschlossen'; return ev(S_.ANY, `Auditorzugriff für ${r.id} beendet`); } }
        ]
      }
    ]
  });

  /* ---------- Sterilisation & Lohnfertigung ---------- */
  const doseOk = (o) => o.min >= 25 && o.max <= 40;
  CC.define({
    id: 'sterile', title: 'Sterilisation & Lohnfertigung', role: 'Qualität / Externer Dienstleister',
    subtitle: 'Dienstleister erfassen Zyklusdaten im Portal. Der Eingang löst die Prüfung gegen die Spezifikation und die Chargenfreigabe aus. Spezifikation im Beispiel: Dosis 25–40 kGy.',
    integrations: [
      { sys: 'BC', text: 'Fremdfertigung/Einkaufsbestellung, Lieferschein, Rückbuchung als steril.' },
      { sys: 'COSMO QA', text: 'Prüfung der Zyklusdaten, Abweichung bei Verfehlung.' },
      { sys: 'Anyfy', text: 'Externes Portal mit Mandantentrennung, Eingangs-Function.' }
    ],
    seed: () => ({
      orders: [
        { id: 'ST-26-041', lot: 'L26-0481', partner: 'SteriServe GmbH', qty: 1200, status: 'Geplant', min: null, max: null, cycle: '' },
        { id: 'ST-26-040', lot: 'L26-0455', partner: 'SteriServe GmbH', qty: 1000, status: 'Beim Dienstleister', min: null, max: null, cycle: '' },
        { id: 'ST-26-039', lot: 'L26-0399', partner: 'SteriServe GmbH', qty: 800, status: 'Zyklusdaten erhalten', min: 22, max: 33, cycle: 'Z-5530' },
        { id: 'ST-26-038', lot: 'L26-0371', partner: 'SteriServe GmbH', qty: 900, status: 'Zyklusdaten erhalten', min: 27, max: 36, cycle: 'Z-5511' }
      ]
    }),
    kpis: [
      { label: 'Beim Dienstleister', fn: (e) => e.orders.filter((o) => o.status === 'Beim Dienstleister').length },
      { label: 'Zur Prüfung', fn: (e) => e.orders.filter((o) => o.status === 'Zyklusdaten erhalten').length, tone: (v) => (v ? 'warn' : 'ok') },
      { label: 'Abgelehnt', fn: (e) => e.orders.filter((o) => o.status === 'Abgelehnt').length, tone: (v) => (v ? 'bad' : 'ok') }
    ],
    tabs: [
      {
        id: 'orders', title: 'Aufträge (Hersteller)', type: 'table', entity: 'orders',
        columns: [{ key: 'id', label: 'Auftrag' }, { key: 'lot', label: 'Charge' }, { key: 'partner', label: 'Dienstleister' }, { key: 'qty', label: 'Menge' }, { key: 'status', label: 'Status', tone: tone({ Freigegeben: 'ok', Abgelehnt: 'bad', Zyklusdaten: 'warn', Beim: 'info' }) }],
        actions: [{ label: 'An Dienstleister senden', when: (r) => r.status === 'Geplant', apply: (r) => { r.status = 'Beim Dienstleister'; return [ev(S_.BC, `Bestellung und Lieferschein für ${r.id} erzeugt`), ev(S_.ANY, `${r.partner} im Portal benachrichtigt`)]; } }]
      },
      {
        id: 'portal', title: 'Dienstleister-Portal (extern)', type: 'table', entity: 'orders', filterBy: (r) => r.status,
        note: 'Sicht des Dienstleisters: nur eigene Aufträge, keine Herstellerdaten. Zyklusdaten werden hier übermittelt.',
        columns: [{ key: 'id', label: 'Auftrag' }, { key: 'lot', label: 'Charge' }, { key: 'qty', label: 'Menge' }, { key: 'cycle', label: 'Zyklus' }, { label: 'Dosis (kGy)', fn: (r) => (r.min == null ? '–' : `${r.min} – ${r.max}`) }, { key: 'status', label: 'Status', tone: tone({ Beim: 'info', Zyklusdaten: 'ok' }) }],
        actions: [{ label: 'Zyklusdaten übermitteln', when: (r) => r.status === 'Beim Dienstleister', fields: [{ key: 'c', label: 'Zyklus-Nr.' }, { key: 'min', label: 'Dosis min. (kGy)', type: 'number', step: 'any' }, { key: 'max', label: 'Dosis max. (kGy)', type: 'number', step: 'any' }], apply: (r, e, v) => { r.cycle = v.c; r.min = Number(v.min); r.max = Number(v.max); r.status = 'Zyklusdaten erhalten'; return ev(S_.ANY, `Zyklusdaten ${v.c} zu ${r.id} eingegangen`); } }]
      },
      {
        id: 'check', title: 'Eingangsprüfung', type: 'table', entity: 'orders', filterBy: (r) => r.status,
        columns: [{ key: 'id', label: 'Auftrag' }, { key: 'lot', label: 'Charge' }, { key: 'cycle', label: 'Zyklus' }, { label: 'Dosis (kGy)', fn: (r) => (r.min == null ? '–' : `${r.min} – ${r.max}`) }, { label: 'Spezifikation 25–40', fn: (r) => (r.min == null ? '–' : doseOk(r) ? 'erfüllt' : 'verfehlt'), tone: tone({ erfüllt: 'ok', verfehlt: 'bad' }) }, { key: 'status', label: 'Status', tone: tone({ Freigegeben: 'ok', Abgelehnt: 'bad', Zyklusdaten: 'warn' }) }],
        actions: [{
          label: 'Prüfen & entscheiden', when: (r) => r.status === 'Zyklusdaten erhalten',
          apply: (r) => doseOk(r)
            ? (r.status = 'Freigegeben', [ev(S_.QA, `Sterilisationsprüfung ${r.id} bestanden`), ev(S_.BC, `${r.qty} Stück ${r.lot} als steril ins Hauptlager gebucht`)])
            : (r.status = 'Abgelehnt', [ev(S_.QA, `Abweichung zu ${r.id}: Dosis ${r.min}–${r.max} kGy außerhalb 25–40`), ev(S_.BC, `Charge ${r.lot} bleibt gesperrt`)])
        }]
      }
    ]
  });
})();
