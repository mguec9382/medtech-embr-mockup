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
      id: 'capa', group: 'quality', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'CAPA & Abweichungen', status: 'konzept',
      short: 'Maßnahmenverfolgung mit Fristen, Eskalation und Wirksamkeitsprüfung.',
      pain: 'Maßnahmen in Excel und E-Mail, Fristen werden übersehen, Wirksamkeitsprüfung fehlt.',
      idea: 'Abweichung → Ursachenanalyse → Maßnahme → Wirksamkeit als geführter Workflow mit Fristen-Ampel und Eskalation.',
      bc: ['Qualitätsaufträge', 'Aufgaben'], cosmo: ['COSMO QA'],
      anyfy: 'CAPA-Klasse und Workflow-Functions, Eskalationsjobs, Aufgaben-UI.',
      regs: ['ISO 13485 §8.5.2', '21 CFR 820.100'], kpi: 'Überfällige CAPAs, Durchlaufzeit'
    },
    {
      id: 'change', group: 'quality', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Änderungsmanagement', status: 'konzept',
      short: 'Änderungsanträge mit Impact-Analyse und Freigabe-Workflow.',
      pain: 'Freigaben per E-Mail, Auswirkung auf Stücklisten, MBR und Zulassung unklar.',
      idea: 'Antrag mit automatischer Where-used-Analyse, Bewertung durch Fachbereiche, versionierte Freigabe.',
      bc: ['Stücklisten', 'Arbeitspläne', 'Versionen'], cosmo: ['COSMO QA'],
      anyfy: 'Change-Klasse, Impact-Function (liest BC), Freigabe-UI mit Signatur.',
      regs: ['ISO 13485 §7.3.9', 'MDR Art. 10'], kpi: 'Durchlaufzeit je Änderung'
    },
    {
      id: 'supplier', group: 'quality', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Lieferanten & Wareneingang', status: 'konzept',
      short: 'Mobile Wareneingangsprüfung, Zertifikatsüberwachung, Lieferantenbewertung.',
      pain: 'Zertifikate laufen ab, Materialzeugnisse fehlen, Lieferantenaudits sind aufwendig.',
      idea: 'Scan beim Wareneingang, Zertifikatsablage mit Ablaufwarnung, Bewertung aus Reklamationen und Lieferperformance.',
      bc: ['Einkauf', 'Lagerorte', 'Lieferanten'], cosmo: ['COSMO QA (Wareneingangsprüfung)'],
      anyfy: 'Zertifikatsklasse, Ablauf-Jobs, mobile Erfassung.',
      regs: ['ISO 13485 §7.4', 'MDR Art. 10 (11)'], kpi: 'Quote qualifizierter Lieferanten'
    },
    {
      id: 'recall', group: 'market', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Rückverfolgung & Rückruf (FSCA)', status: 'konzept',
      short: 'Von der Charge zu Lager, Kunden und Seriennummern in Minuten.',
      pain: 'Ein Rückruf dauert Tage, Kundenlisten je Charge sind nicht schnell verfügbar.',
      idea: 'Rückrufszenario: Charge wählen → Bestand, Lieferungen und Kunden sehen → Sperre und Kundenschreiben anstoßen.',
      bc: ['Chargenverfolgung', 'Verkaufslieferungen', 'Lagerbestand'], cosmo: ['COSMO UDI'],
      anyfy: 'Rückruf-Klasse, Trace-Function über BC-Daten, Sperr-Outbox.',
      regs: ['MDR Art. 89', 'MEDDEV 2.12-1', '21 CFR 806'], kpi: 'Zeit Charge → Kundenliste'
    },
    {
      id: 'pms', group: 'market', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Reklamationen & Vigilanz', status: 'konzept',
      short: 'Feldmeldungen erfassen, Meldepflicht bewerten, Fristen überwachen.',
      pain: 'Meldefristen werden verpasst, Bewertungen sind inkonsistent, Daten liegen in Silos.',
      idea: 'Strukturierte Erfassung mit Entscheidungshilfe zur Meldepflicht, Fristen-Timer und Verknüpfung zu Charge und CAPA.',
      bc: ['Serviceaufträge', 'Debitoren', 'Serviceartikel'], cosmo: ['COSMO QA', 'COSMO UDI'],
      anyfy: 'Reklamationsklasse, Fristen-Functions, Erfassungs-UI für Außendienst.',
      regs: ['MDR Art. 87–92', 'ISO 13485 §8.2.2'], kpi: 'Einhaltung Meldefristen'
    },
    {
      id: 'calibration', group: 'ops', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Prüfmittel & Kalibrierung', status: 'konzept',
      short: 'Prüfmittel scannen, Kalibrierstatus prüfen, überfällige Geräte sperren.',
      pain: 'Prüfmittel abgelaufen, Nachweis im Audit fehlt, Sperre erfolgt manuell.',
      idea: 'Scan vor Nutzung zeigt Status; überfällige Prüfmittel blockieren den Prüfschritt im eMBR.',
      bc: ['Anlagen', 'Wartung', 'Ressourcen'], cosmo: [],
      hint: 'Branchenprodukt für Prüfmittel mit COSMO klären',
      anyfy: 'Prüfmittel-Klasse, Status-Function, Scan-UI, Integration in eMBR.',
      regs: ['ISO 13485 §7.6', '21 CFR 820.72'], kpi: 'Prüfmittel außerhalb Frist'
    },
    {
      id: 'training', group: 'ops', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Schulung & Befähigung', status: 'konzept',
      short: 'Befähigungsmatrix, die Arbeitsschritte ohne gültige Schulung sperrt.',
      pain: 'Wer was darf, ist lückenhaft dokumentiert; Nachweis im Audit aufwendig.',
      idea: 'Schulungsstatus je Mitarbeiter und Tätigkeit, Warnung vor Ablauf, Prüfung der Befähigung bei der Signatur.',
      bc: ['Personal', 'Ressourcen'], cosmo: [],
      hint: 'Passendes COSMO-Produkt klären',
      anyfy: 'Befähigungsklasse, Function zur Prüfung bei Schrittstart.',
      regs: ['ISO 13485 §6.2', '21 CFR 820.25'], kpi: 'Schritte ohne gültige Befähigung'
    },
    {
      id: 'cleanroom', group: 'ops', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Reinraum & Umgebung', status: 'konzept',
      short: 'Rundgänge am Tablet, Grenzwertalarm und Trendauswertung.',
      pain: 'Papierprotokolle und späte Reaktion auf Grenzwertverletzungen.',
      idea: 'Digitale Messrundgänge, Trend je Raum, automatische Abweichung bei Überschreitung.',
      bc: ['Ressourcen', 'Qualitätsaufträge'], cosmo: ['COSMO QA'],
      anyfy: 'Messpunkt-Klassen, Trend-Functions, optional IoT-Anbindung.',
      regs: ['ISO 14644', 'ISO 13485 §7.5.2'], kpi: 'Reaktionszeit auf Grenzwert'
    },
    {
      id: 'audit', group: 'ops', icon: 'assets/icons/BC_Life-Sciences.svg', title: 'Audit-Readiness', status: 'konzept',
      short: 'Nachweise je Charge, Prozess oder Lieferant auf Knopfdruck.',
      pain: 'Auditvorbereitung bindet Wochen; Nachweise liegen in vielen Systemen.',
      idea: 'Auditmodus mit Lesezugriff, Nachweispaketen je Charge und Prüfpfad-Export.',
      bc: ['Alle Module (lesend)'], cosmo: ['COSMO QA', 'COSMO UDI'],
      anyfy: 'Aggregations-Functions und Export; setzt die anderen Apps voraus.',
      regs: ['ISO 13485 §8.2.4', 'MDSAP'], kpi: 'Vorbereitungsaufwand je Audit'
    },
    {
      id: 'sterile', group: 'market', icon: 'assets/icons/BC_Process-Manufacturing.svg', title: 'Sterilisation & Lohnfertigung', status: 'konzept',
      short: 'Dienstleister-Portal für Chargendaten und Freigabe.',
      pain: 'Chargenfreigabe beim Dienstleister ist ein Medienbruch (Papier, PDF, E-Mail).',
      idea: 'Externe Partner erfassen Zyklusdaten und Zertifikate; Eingang löst Prüfung und Freigabe im eMBR aus.',
      bc: ['Fremdfertigung', 'Einkauf', 'Chargenverfolgung'], cosmo: ['COSMO QA'],
      anyfy: 'Externes Portal mit Mandantentrennung, Eingangs-Functions.',
      regs: ['ISO 11135 / 11137', 'ISO 13485 §7.5.7'], kpi: 'Durchlaufzeit Sterilisation'
    }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const state = { q: '', status: 'all' };

  function matches(a) {
    if (state.status !== 'all' && a.status !== state.status) return false;
    const hay = [a.title, a.short, a.pain, a.idea, ...a.bc, ...a.cosmo, ...a.regs].join(' ').toLowerCase();
    return hay.includes(state.q.toLowerCase());
  }

  function tile(a) {
    const tag = a.status === 'mockup' ? '<span class="tag live">Mockup verfügbar</span>' : '<span class="tag">Konzept</span>';
    const chips = [...a.cosmo.map((c) => `<span class="chip cosmo">${esc(c.split(' (')[0])}</span>`), '<span class="chip anyfy">Anyfy</span>', '<span class="chip bc">Business Central</span>'].join('');
    return `<button class="tile" type="button" data-id="${a.id}">
      <div class="tile-top"><img src="${a.icon}" alt="" width="40" height="40">${tag}</div>
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
    go.hidden = !a.href;
    if (a.href) go.href = a.href;
    $('#detail').showModal();
  }

  function init() {
    $('#stat-total').textContent = APPS.length;
    $('#stat-mock').textContent = APPS.filter((a) => a.status === 'mockup').length;
    $('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
    document.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
      state.status = b.dataset.status;
      document.querySelectorAll('[data-status]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    }));
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
