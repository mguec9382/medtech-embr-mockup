const ICONS = {"embr": "<path d=\"M9 3h6v2H9z\"/><path d=\"M7 5H5v16h14V5h-2\"/><path d=\"m9 13 2 2 4-4\"/>", "capa": "<path d=\"M21 12a9 9 0 1 1-3-6.7\"/><path d=\"M21 4v5h-5\"/><path d=\"M12 8v4l2.5 2\"/>", "change": "<path d=\"M7 4v12a3 3 0 0 0 3 3h7\"/><circle cx=\"7\" cy=\"4\" r=\"2\"/><path d=\"m14 16 3 3-3 3\"/>", "supplier": "<path d=\"M3 7h11v9H3z\"/><path d=\"M14 10h4l3 3v3h-7\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/>", "recall": "<path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v5h5\"/><path d=\"M12 8v5\"/><path d=\"M12 16h.01\"/>", "pms": "<path d=\"M4 5h16v11H9l-5 4z\"/><path d=\"M12 8v3\"/><path d=\"M12 13.5h.01\"/>", "calibration": "<path d=\"m3 17 14-14 4 4L7 21z\"/><path d=\"m8 12 2 2M11 9l2 2M14 6l2 2\"/>", "training": "<path d=\"m2 9 10-5 10 5-10 5z\"/><path d=\"M6 11.5V16c3 2.5 9 2.5 12 0v-4.5\"/>", "cleanroom": "<path d=\"M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z\"/><path d=\"M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5\"/>", "audit": "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m21 21-5.5-5.5\"/><path d=\"m8 10.5 2 2 3.5-4\"/>", "sterile": "<path d=\"M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>"};
(function () {
  const GROUPS = [
    { id: 'quality', name: 'Qualität & Produktion', color: 'var(--grp-primary)' },
    { id: 'market', name: 'Rückverfolgung & Markt', color: 'var(--grp-regulated)' },
    { id: 'ops', name: 'Betrieb & Compliance', color: 'var(--grp-support)' }
  ];

  // cosmo: vom Nutzer bestätigte COSMO-Produkte; hint: noch mit Produktmanagement zu klären
  const APPS = [
    {
      id: 'embr', group: 'quality', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'eMBR / eDHR', status: 'mockup', href: 'index.html',
      short: 'Elektronische Chargenakte mit Prüfschritten, Abweichungen und Freigabe.',
      pain: 'Papier-Chargenakten, späte Fehlerentdeckung, aufwendige Freigabe und DHR-Zusammenstellung.',
      idea: 'Geführte Fertigungsschritte am Tablet, Grenzwertprüfung, Signatur, Freigabe-Cockpit und DHR auf Knopfdruck.',
      bc: ['Produktionsaufträge', 'Stücklisten', 'Chargenverfolgung'], cosmo: ['COSMO QA (Prüfergebnisse)', 'COSMO UDI (UDI-DI/PI)'],
      anyfy: 'Datenmodell, Functions (Schritt signieren, QA-Import), Audit-Klasse, Tablet-UI.',
      regs: ['21 CFR 11', 'EU-MDR Anh. II/III', 'ISO 13485 §7.5', 'Annex 11'], kpi: 'Freigabezeit je Charge'
    },
    {
      id: 'capa', group: 'quality', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'CAPA & Abweichungen', status: 'mockup',
      short: 'Maßnahmenverfolgung mit Fristen, Eskalation und Wirksamkeitsprüfung.',
      pain: 'Maßnahmen in Excel und E-Mail, Fristen werden übersehen, Wirksamkeitsprüfung fehlt.',
      idea: 'Abweichung → Ursachenanalyse → Maßnahme → Wirksamkeit als geführter Workflow mit Fristen-Ampel und Eskalation.',
      bc: ['Qualitätsaufträge', 'Aufgaben'], cosmo: ['COSMO QA'],
      anyfy: 'CAPA-Klasse und Workflow-Functions, Eskalationsjobs, Aufgaben-UI.',
      regs: ['ISO 13485 §8.5.2', '21 CFR 820.100'], kpi: 'Überfällige CAPAs, Durchlaufzeit'
    },
    {
      id: 'change', group: 'quality', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Änderungsmanagement', status: 'mockup',
      short: 'Änderungsanträge mit Impact-Analyse und Freigabe-Workflow.',
      pain: 'Freigaben per E-Mail, Auswirkung auf Stücklisten, MBR und Zulassung unklar.',
      idea: 'Antrag mit automatischer Where-used-Analyse, Bewertung durch Fachbereiche, versionierte Freigabe.',
      bc: ['Stücklisten', 'Arbeitspläne', 'Versionen'], cosmo: ['COSMO QA'],
      anyfy: 'Change-Klasse, Impact-Function (liest BC), Freigabe-UI mit Signatur.',
      regs: ['ISO 13485 §7.3.9', 'MDR Art. 10'], kpi: 'Durchlaufzeit je Änderung'
    },
    {
      id: 'supplier', group: 'quality', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Lieferanten & Wareneingang', status: 'mockup',
      short: 'Mobile Wareneingangsprüfung, Zertifikatsüberwachung, Lieferantenbewertung.',
      pain: 'Zertifikate laufen ab, Materialzeugnisse fehlen, Lieferantenaudits sind aufwendig.',
      idea: 'Scan beim Wareneingang, Zertifikatsablage mit Ablaufwarnung, Bewertung aus Reklamationen und Lieferperformance.',
      bc: ['Einkauf', 'Lagerorte', 'Lieferanten'], cosmo: ['COSMO QA (Wareneingangsprüfung)'],
      anyfy: 'Zertifikatsklasse, Ablauf-Jobs, mobile Erfassung.',
      regs: ['ISO 13485 §7.4', 'MDR Art. 10 (11)'], kpi: 'Quote qualifizierter Lieferanten'
    },
    {
      id: 'recall', group: 'market', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Rückverfolgung & Rückruf (FSCA)', status: 'mockup',
      short: 'Von der Charge zu Lager, Kunden und Seriennummern in Minuten.',
      pain: 'Ein Rückruf dauert Tage, Kundenlisten je Charge sind nicht schnell verfügbar.',
      idea: 'Rückrufszenario: Charge wählen → Bestand, Lieferungen und Kunden sehen → Sperre und Kundenschreiben anstoßen.',
      bc: ['Chargenverfolgung', 'Verkaufslieferungen', 'Lagerbestand'], cosmo: ['COSMO UDI'],
      anyfy: 'Rückruf-Klasse, Trace-Function über BC-Daten, Sperr-Outbox.',
      regs: ['MDR Art. 89', 'MEDDEV 2.12-1', '21 CFR 806'], kpi: 'Zeit Charge → Kundenliste'
    },
    {
      id: 'pms', group: 'market', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Reklamationen & Vigilanz', status: 'mockup',
      short: 'Feldmeldungen erfassen, Meldepflicht bewerten, Fristen überwachen.',
      pain: 'Meldefristen werden verpasst, Bewertungen sind inkonsistent, Daten liegen in Silos.',
      idea: 'Strukturierte Erfassung mit Entscheidungshilfe zur Meldepflicht, Fristen-Timer und Verknüpfung zu Charge und CAPA.',
      bc: ['Serviceaufträge', 'Debitoren', 'Serviceartikel'], cosmo: ['COSMO QA', 'COSMO UDI'],
      anyfy: 'Reklamationsklasse, Fristen-Functions, Erfassungs-UI für Außendienst.',
      regs: ['MDR Art. 87–92', 'ISO 13485 §8.2.2'], kpi: 'Einhaltung Meldefristen'
    },
    {
      id: 'calibration', group: 'ops', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Prüfmittel & Kalibrierung', status: 'mockup',
      short: 'Prüfmittel scannen, Kalibrierstatus prüfen, überfällige Geräte sperren.',
      pain: 'Prüfmittel abgelaufen, Nachweis im Audit fehlt, Sperre erfolgt manuell.',
      idea: 'Scan vor Nutzung zeigt Status; überfällige Prüfmittel blockieren den Prüfschritt im eMBR.',
      bc: ['Anlagen', 'Wartung', 'Ressourcen'], cosmo: [],
      hint: 'Branchenprodukt für Prüfmittel mit COSMO klären',
      anyfy: 'Prüfmittel-Klasse, Status-Function, Scan-UI, Integration in eMBR.',
      regs: ['ISO 13485 §7.6', '21 CFR 820.72'], kpi: 'Prüfmittel außerhalb Frist'
    },
    {
      id: 'training', group: 'ops', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Schulung & Befähigung', status: 'mockup',
      short: 'Befähigungsmatrix, die Arbeitsschritte ohne gültige Schulung sperrt.',
      pain: 'Wer was darf, ist lückenhaft dokumentiert; Nachweis im Audit aufwendig.',
      idea: 'Schulungsstatus je Mitarbeiter und Tätigkeit, Warnung vor Ablauf, Prüfung der Befähigung bei der Signatur.',
      bc: ['Personal', 'Ressourcen'], cosmo: [],
      hint: 'Passendes COSMO-Produkt klären',
      anyfy: 'Befähigungsklasse, Function zur Prüfung bei Schrittstart.',
      regs: ['ISO 13485 §6.2', '21 CFR 820.25'], kpi: 'Schritte ohne gültige Befähigung'
    },
    {
      id: 'cleanroom', group: 'ops', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Reinraum & Umgebung', status: 'mockup',
      short: 'Rundgänge am Tablet, Grenzwertalarm und Trendauswertung.',
      pain: 'Papierprotokolle und späte Reaktion auf Grenzwertverletzungen.',
      idea: 'Digitale Messrundgänge, Trend je Raum, automatische Abweichung bei Überschreitung.',
      bc: ['Ressourcen', 'Qualitätsaufträge'], cosmo: ['COSMO QA'],
      anyfy: 'Messpunkt-Klassen, Trend-Functions, optional IoT-Anbindung.',
      regs: ['ISO 14644', 'ISO 13485 §7.5.2'], kpi: 'Reaktionszeit auf Grenzwert'
    },
    {
      id: 'audit', group: 'ops', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Audit-Readiness', status: 'mockup',
      short: 'Nachweise je Charge, Prozess oder Lieferant auf Knopfdruck.',
      pain: 'Auditvorbereitung bindet Wochen; Nachweise liegen in vielen Systemen.',
      idea: 'Auditmodus mit Lesezugriff, Nachweispaketen je Charge und Prüfpfad-Export.',
      bc: ['Alle Module (lesend)'], cosmo: ['COSMO QA', 'COSMO UDI'],
      anyfy: 'Aggregations-Functions und Export; setzt die anderen Apps voraus.',
      regs: ['ISO 13485 §8.2.4', 'MDSAP'], kpi: 'Vorbereitungsaufwand je Audit'
    },
    {
      id: 'sterile', group: 'market', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Sterilisation & Lohnfertigung', status: 'mockup',
      short: 'Dienstleister-Portal für Chargendaten und Freigabe.',
      pain: 'Chargenfreigabe beim Dienstleister ist ein Medienbruch (Papier, PDF, E-Mail).',
      idea: 'Externe Partner erfassen Zyklusdaten und Zertifikate; Eingang löst Prüfung und Freigabe im eMBR aus.',
      bc: ['Fremdfertigung', 'Einkauf', 'Chargenverfolgung'], cosmo: ['COSMO QA'],
      anyfy: 'Externes Portal mit Mandantentrennung, Eingangs-Functions.',
      regs: ['ISO 11135 / 11137', 'ISO 13485 §7.5.7'], kpi: 'Durchlaufzeit Sterilisation'
    }
  ];

  APPS.forEach((a) => { if (!a.href) a.href = 'app.html?id=' + a.id; a.href = 'ipad.html?src=' + encodeURIComponent(a.href); });

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const state = { q: '' };

  function matches(a) {
    const hay = [a.title, a.short, a.pain, a.idea, ...a.bc, ...a.cosmo, ...a.regs].join(' ').toLowerCase();
    return hay.includes(state.q.toLowerCase());
  }

  function tile(a) {
    const tag = a.id === 'embr' ? '<span class="tag live">Mockup</span>' : '<span class="tag live">Mockup</span>';
    const chips = [...a.cosmo.map((c) => `<span class="chip cosmo">${esc(c.split(' (')[0])}</span>`), '<span class="chip anyfy">Anyfy</span>', '<span class="chip bc">Business Central</span>'].join('');
    return `<button class="tile" type="button" data-id="${a.id}">
      <div class="tile-top"><svg class="ico" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[a.id]}</svg>${tag}</div>
      <h3>${esc(a.title)}</h3><p>${esc(a.short)}</p>
      <div class="chips">${chips}</div></button>`;
  }

  function render() {
    const root = $('#groups');
    const parts = GROUPS.map((g) => {
      const list = APPS.filter((a) => a.group === g.id && matches(a));
      if (!list.length) return '';
      return `<section class="group" style="--gc:${g.color}"><h2><i class="dot"></i>${g.name} <span class="count">${list.length}</span></h2><div class="grid">${list.map(tile).join('')}</div></section>`;
    }).join('');
    root.innerHTML = parts || '<p class="empty">Keine Treffer.</p>';
  }

  function list(items, empty) {
    return items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : `<p class="muted">${esc(empty)}</p>`;
  }

  function open(id) {
    const a = APPS.find((x) => x.id === id);
    $('#d-title').textContent = a.title;
    $('#d-body').innerHTML = `
      <div class="two"><div><h4>Schmerzpunkt</h4><p>${esc(a.pain)}</p></div><div><h4>Companion-App</h4><p>${esc(a.idea)}</p></div></div>
      <div class="arch">
        <div class="layer anyfy"><b>COSMO Anyfy</b><p>${esc(a.anyfy)}</p></div>
        <div class="layer bc"><b>Business Central</b>${list(a.bc, '')}</div>
        <div class="layer cosmo"><b>COSMO Branchenprodukte</b>${list(a.cosmo, a.hint || 'Keine')}</div>
      </div>
      <div class="two"><div><h4>Regelwerke</h4>${list(a.regs, '')}</div><div><h4>Steuerungskennzahl</h4><p>${esc(a.kpi)}</p></div></div>
      <p class="muted small">Zuordnung der Produkte und Regelwerke ist ein Entwurf und vor Kundeneinsatz zu prüfen.</p>`;
    const go = $('#d-open');
    go.href = a.href;
    $('#detail').showModal();
  }

  function init() {
    $('#stat-total').textContent = APPS.length;
    $('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
    $('#groups').addEventListener('click', (e) => { const t = e.target.closest('.tile'); if (t) open(t.dataset.id); });
    $('#d-close').addEventListener('click', () => $('#detail').close());
    $('#theme').addEventListener('click', (e) => {
      const dark = document.documentElement.classList.toggle('dark');
      e.currentTarget.textContent = dark ? 'HELL' : 'DUNKEL';
    });
    document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#q').focus(); } });
    render();
  }
  init();
})();
