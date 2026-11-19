(function (root) {
  const E = (root.EMBR = root.EMBR || {});

  E.SEED_VERSION = 1;
  // Fester Stichtag, damit Kalibrier- und Verfallsprüfungen im Mockup reproduzierbar bleiben.
  E.MOCK_TODAY = '2026-11-19';

  E.PERMS = {
    operator: ['execute', 'deviation.create'],
    verifier: ['verify', 'deviation.create'],
    qa: ['approve', 'release', 'deviation.close', 'deviation.create'],
    author: ['author', 'deviation.create'],
    ra: ['review'],
  };

  E.PERM_LABEL = {
    execute: 'Schritte ausführen',
    verify: 'Schritte verifizieren (4-Augen)',
    approve: 'MBR-Versionen freigeben',
    release: 'Chargen freigeben',
    'deviation.close': 'Abweichungen schließen',
    'deviation.create': 'Abweichungen anlegen',
    author: 'MBR-Versionen erstellen und einreichen',
    review: 'MBR-Versionen fachlich prüfen',
  };

  E.LOTS = {
    'TI-26-118': { item: 'RM-TI64-45', status: 'Freigegeben', expiry: '2029-03-31', supplier: 'Titanwerk Nord GmbH', cert: 'Werkszeugnis 3.1 (EN 10204)' },
    'TI-26-097': { item: 'RM-TI64-45', status: 'Gesperrt', expiry: '2029-01-31', supplier: 'Titanwerk Nord GmbH', cert: 'QA-Sperre: Zertifikat unvollständig' },
    'TI-25-044': { item: 'RM-TI64-45', status: 'Freigegeben', expiry: '2026-09-30', supplier: 'Titanwerk Nord GmbH', cert: 'Werkszeugnis 3.1 (EN 10204)' },
  };

  E.SHIPMENTS = {
    'L26-0476': [
      { doc: 'LS-88231', customer: 'Klinikum Süd', date: '2026-11-12', qty: 120 },
      { doc: 'LS-88245', customer: 'Orthopädie Zentrum Nord', date: '2026-11-14', qty: 200 },
      { doc: 'LS-88260', customer: 'MedDistribution AG (CH)', date: '2026-11-17', qty: 150 },
    ],
  };

  E.COMPLIANCE = [
    { req: 'Lückenloser, nicht abschaltbarer Audit Trail', source: '21 CFR 11.10(e), EU GMP Annex 11 §9', feature: 'Hash-verkettetes Audit Trail mit Manipulationsprüfung', screen: '#/audit', status: 'mock', note: 'Anyfy-native Audit-Funktionen prüfen' },
    { req: 'Elektronische Signatur (zwei Komponenten, Bedeutung, Zeitpunkt)', source: '21 CFR 11.50 / 11.70 / 11.200', feature: 'Signatur-Dialog mit Re-Authentifizierung und Signaturbedeutung', screen: '#/batches/BR-2026-0481', status: 'verify', note: 'Natives Anyfy-Feature oder Eigenbau klären' },
    { req: 'Funktionstrennung und Vier-Augen-Prinzip', source: '21 CFR 11.10(g), ISO 13485 §4.1.6', feature: 'Rollenmodell, Autor ≠ Prüfer ≠ Freigeber, Bediener ≠ Verifizierer', screen: '#/mbr/MBR-1042', status: 'mock', note: '' },
    { req: 'Kontrollierte Vorlagen und Versionen', source: 'ISO 13485 §4.2.4 / 4.2.5, Medical Device File', feature: 'MBR-Lebenszyklus mit Review und Freigabe', screen: '#/mbr', status: 'mock', note: '' },
    { req: 'Plausibilitäts- und Grenzwertprüfung bei Eingabe', source: '21 CFR 11.10(f), Annex 11 §5', feature: 'Live-Prüfung, Abweichungspflicht, Equipment- und Chargensperre', screen: '#/batches/BR-2026-0481', status: 'mock', note: '' },
    { req: 'Gültigkeit von Prüfmitteln und Equipment', source: 'ISO 13485 §7.6', feature: 'Kalibrier- und Qualifizierungsstatus blockiert Schritt', screen: '#/batches/BR-2026-0480', status: 'mock', note: 'Quelle: Equipment-Stammdaten (noch festzulegen)' },
    { req: 'Rückverfolgbarkeit Charge/Los/Serie', source: 'ISO 13485 §7.5.9, MDR Art. 25', feature: 'Vorwärts- und Rückwärtsverfolgung', screen: '#/trace', status: 'mock', note: '' },
    { req: 'Geräteakte je Charge (DHR) mit Freigabe', source: 'ISO 13485 §7.5.1, 21 CFR 820.184', feature: 'Review-by-Exception, QA-Freigabe, DHR-Export mit Hash', screen: '#/release', status: 'mock', note: '' },
    { req: 'Lesbare Kopien für Inspektionen', source: '21 CFR 11.10(b)', feature: 'DHR-Druckansicht und Export', screen: '#/dhr/BR-2026-0476', status: 'mock', note: 'Ziel: PDF/A in Immutable Storage' },
    { req: 'UDI und Identifikation', source: 'MDR Art. 27, ISO 13485 §7.5.8', feature: 'UDI-DI/PI im DHR, Etikettenabgleich als Prüfschritt', screen: '#/dhr/BR-2026-0476', status: 'mock', note: 'GS1-/HIBCC-Format später' },
    { req: 'Aufbewahrung (≥ 10 Jahre, Implantate 15)', source: 'MDR Anh. IX, ISO 13485 §4.2.5', feature: 'Archiv als unveränderlicher Speicher', screen: '#/system', status: 'verify', note: 'Architekturentscheidung offen' },
    { req: 'Computerisierte-Systeme-Validierung', source: 'ISO 13485 §4.1.6, GAMP 5, FDA CSA', feature: 'Validierungsplan, IQ/OQ/PQ, Traceability-Matrix', screen: '#/system', status: 'process', note: '' },
    { req: 'Lieferantenbewertung Plattform', source: 'ISO 13485 §7.4', feature: 'Audit COSMO/Anyfy/Microsoft', screen: '#/system', status: 'process', note: '' },
    { req: 'Änderungslenkung bei Plattform-Releases', source: 'ISO 13485 §7.5.6, GAMP 5', feature: 'Release-Impact-Assessment, Regressionstests', screen: '#/system', status: 'process', note: 'Anyfy-Release-Branches beachten' },
  ];

  E.VALIDATION = [
    { phase: 'Intended Use und URS', pct: 100 },
    { phase: 'Risikoanalyse (GxP-Impact)', pct: 80 },
    { phase: 'Funktions- und Designspezifikation', pct: 55 },
    { phase: 'IQ — Installationsqualifizierung', pct: 0 },
    { phase: 'OQ — Funktionsqualifizierung', pct: 0 },
    { phase: 'PQ — Leistungsqualifizierung', pct: 0 },
  ];

  E.BC_ORDERS = [
    { no: 'FA-101240', mbrId: 'MBR-1042', qty: 500, lot: 'L26-0484' },
    { no: 'FA-101241', mbrId: 'MBR-3305', qty: 60, lot: 'L26-0485' },
    { no: 'FA-101242', mbrId: 'MBR-2210', qty: 300, lot: 'L26-0486' },
  ];

  E.DECISIONS = [
    'Zielmärkte: nur EU oder auch US (FDA/QMSR)?',
    'Pilotprodukt und Produktklasse (steril, aktiv, Implantat)?',
    'Offline-Fähigkeit am Shopfloor erforderlich?',
    'Führende Chargen-/Seriennummernverwaltung in BC (Process Manufacturing oder Life Sciences)?',
    'System Owner und QA-Freigeber auf Kundenseite?',
  ];

  function steps1042() {
    return [
      { no: 1, title: 'Line Clearance und Raumfreigabe', type: 'check', ref: 'SOP-PRD-014', verify: true,
        instruction: 'Arbeitsplatz, Maschine und Umgebung auf Rückstände der Vorcharge prüfen.',
        checks: ['Keine Materialien oder Etiketten der Vorcharge vorhanden', 'Umgebungsprotokoll der Schicht liegt vor', 'Maschinenreinigung dokumentiert'] },
      { no: 2, title: 'Materialbereitstellung', type: 'material', ref: 'SOP-MAT-003', verify: false, item: 'RM-TI64-45', itemName: 'Stab Ti-6Al-4V ELI Ø6 mm',
        instruction: 'Rohmaterial scannen. Das System prüft Freigabestatus und Verfall gegen Business Central.' },
      { no: 3, title: 'CNC-Drehen und Gewindeschneiden', type: 'process', ref: 'WI-CNC-221', verify: true, equipmentClass: 'CNC',
        instruction: 'Schraubenrohling gemäß Zeichnung fertigen. Kritisches Maß (CTQ) vier-augen-verifizieren.',
        params: [
          { id: 'rpm', name: 'Spindeldrehzahl', unit: 'rpm', min: 4300, max: 4700, target: 4500 },
          { id: 'thd', name: 'Gewinde-Außendurchmesser', unit: 'mm', min: 4.48, max: 4.52, target: 4.5, critical: true },
          { id: 'len', name: 'Gesamtlänge', unit: 'mm', min: 31.9, max: 32.1, target: 32 },
        ] },
      { no: 4, title: 'Reinigung (Ultraschall)', type: 'process', ref: 'WI-CLN-110', verify: false, equipmentClass: 'ULS',
        instruction: 'Teile im Ultraschallbad reinigen. Nur kalibriertes Equipment verwenden.',
        params: [
          { id: 'temp', name: 'Badtemperatur', unit: '°C', min: 55, max: 65, target: 60 },
          { id: 'time', name: 'Reinigungszeit', unit: 'min', min: 10, max: 15, target: 12 },
        ] },
      { no: 5, title: 'Passivierung (validierter Spezialprozess)', type: 'process', ref: 'PV-PAS-2024-07', verify: true, equipmentClass: 'PAS', special: true,
        instruction: 'Passivierung gemäß validiertem Prozess. Parameter außerhalb der Prozessvalidierung sind nicht zulässig.',
        params: [
          { id: 'conc', name: 'Säurekonzentration', unit: '%', min: 18, max: 22, target: 20, critical: true },
          { id: 'ptemp', name: 'Temperatur', unit: '°C', min: 50, max: 60, target: 55 },
          { id: 'ptime', name: 'Einwirkzeit', unit: 'min', min: 28, max: 35, target: 30 },
        ] },
      { no: 6, title: 'Endkontrolle (Stichprobe)', type: 'inspection', ref: 'WI-QC-305', verify: true,
        instruction: 'Stichprobe nach Prüfplan prüfen und Ergebnisse erfassen.',
        params: [
          { id: 'ra', name: 'Rauheit Ra', unit: 'µm', min: 0, max: 0.8, target: 0.6 },
          { id: 'defects', name: 'Sichtfehler (Anzahl)', unit: 'Stk', min: 0, max: 0, target: 0, critical: true },
        ] },
      { no: 7, title: 'Verpackung und UDI-Etikett', type: 'packaging', ref: 'SOP-PKG-021', verify: true,
        instruction: 'Etikettenabgleich und Verpackung nach Vorgabe.',
        checks: ['UDI-Etikett (GTIN, LOT, Verfall) gegen Auftrag abgeglichen', 'Etiketten-Reconciliation: ausgegeben = verbraucht + vernichtet', 'Sterilbarriere unbeschädigt'] },
    ];
  }

  function stepsSimple(prefix) {
    return [
      { no: 1, title: 'Line Clearance', type: 'check', ref: `${prefix}-001`, verify: true, instruction: 'Arbeitsplatz freigeben.', checks: ['Arbeitsplatz frei von Vorcharge'] },
      { no: 2, title: 'Montage', type: 'process', ref: `${prefix}-002`, verify: false, instruction: 'Montage nach Arbeitsanweisung.', params: [{ id: 'torque', name: 'Drehmoment', unit: 'Nm', min: 1.1, max: 1.3, target: 1.2 }] },
      { no: 3, title: 'Funktionsprüfung', type: 'inspection', ref: `${prefix}-003`, verify: true, instruction: 'Funktionsprüfung nach Prüfplan.', params: [{ id: 'flow', name: 'Förderrate', unit: 'ml/h', min: 99, max: 101, target: 100, critical: true }] },
    ];
  }

  const EQUIPMENT = [
    { id: 'EQ-CNC-07', cls: 'CNC', name: 'CNC-Drehfräszentrum L32', calDue: '2027-03-15', qualified: true },
    { id: 'EQ-ULS-02', cls: 'ULS', name: 'Ultraschallreiniger USR-2', calDue: '2026-10-31', qualified: true },
    { id: 'EQ-ULS-03', cls: 'ULS', name: 'Ultraschallreiniger USR-3', calDue: '2027-01-20', qualified: true },
    { id: 'EQ-PAS-01', cls: 'PAS', name: 'Passivierungsanlage PA-1', calDue: '2027-05-02', qualified: true },
  ];

  function mkExec(steps, done, ts0) {
    return steps.map((st, i) => {
      const r = { checks: (st.checks || []).map(() => i < done), lot: null, equipment: null, values: {}, signs: [], deviations: [] };
      if (i >= done) return r;
      if (st.type === 'material') r.lot = 'TI-26-118';
      if (st.equipmentClass) r.equipment = EQUIPMENT.find((e) => e.cls === st.equipmentClass && e.calDue > E.MOCK_TODAY).id;
      (st.params || []).forEach((p) => { r.values[p.id] = p.target; });
      const t = new Date(Date.parse(ts0) + i * 40 * 60000).toISOString();
      r.signs.push({ userId: 'u1', user: 'Anna Weber', role: 'operator', meaning: 'Ausgeführt', ts: t });
      if (st.verify) r.signs.push({ userId: 'u2', user: 'Tom Keller', role: 'verifier', meaning: 'Verifiziert', ts: new Date(Date.parse(t) + 8 * 60000).toISOString() });
      return r;
    });
  }

  E.createSeed = function createSeed() {
    const s1042 = steps1042();
    const b0481 = mkExec(s1042, 2, '2026-11-19T06:10:00+01:00');
    const b0480 = mkExec(s1042, 3, '2026-11-18T06:10:00+01:00');
    b0480[3] = { checks: [], lot: null, equipment: 'EQ-ULS-03', values: { temp: 71, time: 12 }, signs: [], deviations: ['DEV-0097'] };
    const b0479 = mkExec(s1042, 7, '2026-11-17T06:10:00+01:00');
    const b0476 = mkExec(s1042, 7, '2026-11-12T06:10:00+01:00');
    b0476[5].values.ra = 0.82;
    b0476[5].deviations = ['DEV-0091'];

    return {
      version: E.SEED_VERSION,
      userId: 'u1',
      users: [
        { id: 'u1', name: 'Anna Weber', role: 'operator', roleLabel: 'Fertigungsmitarbeiterin' },
        { id: 'u2', name: 'Tom Keller', role: 'verifier', roleLabel: 'Schichtleiter (Verifizierer)' },
        { id: 'u3', name: 'Dr. Lena Roth', role: 'qa', roleLabel: 'Qualitätssicherung / Freigabe' },
        { id: 'u4', name: 'Marc Behrens', role: 'author', roleLabel: 'Prozessentwicklung (Autor)' },
        { id: 'u5', name: 'Sabine Frank', role: 'ra', roleLabel: 'Regulatory Affairs (Prüfer)' },
      ],
      equipment: EQUIPMENT,
      mbrs: [
        { id: 'MBR-1042', title: 'Knochenschraube Ti-6Al-4V Ø4,5 mm', product: 'Orthopädisches Implantat', cls: 'MDR Klasse IIb, steril', udiDi: '04 05123 45678 90 1', steps: s1042,
          versions: [
            { v: '2.0', status: 'Ersetzt', effective: '2025-09-01', change: 'Erstfreigabe nach Prozessvalidierung', signs: [] },
            { v: '3.0', status: 'Wirksam', effective: '2026-06-01', change: 'Prüfplan Endkontrolle erweitert, Etikettenabgleich ergänzt',
              signs: [
                { user: 'Marc Behrens', userId: 'u4', meaning: 'Eingereicht', ts: '2026-05-12T09:15:00+02:00' },
                { user: 'Sabine Frank', userId: 'u5', meaning: 'Geprüft', ts: '2026-05-20T14:02:00+02:00' },
                { user: 'Dr. Lena Roth', userId: 'u3', meaning: 'Freigegeben', ts: '2026-05-28T10:40:00+02:00' },
              ] },
            { v: '4.0', status: 'In Prüfung', effective: null, change: 'Requalifizierung Passivierung (PV-PAS-2024-07 Rev. 2), Ra-Grenzwert verschärft',
              diff: [
                { field: 'Schritt 5 · Einwirkzeit', old: '28–35 min', next: '30–38 min', reason: 'Requalifizierung Rev. 2' },
                { field: 'Schritt 6 · Rauheit Ra max.', old: '0,8 µm', next: '0,7 µm', reason: 'Kundenanforderung' },
              ],
              signs: [{ user: 'Marc Behrens', userId: 'u4', meaning: 'Eingereicht', ts: '2026-11-17T16:30:00+01:00' }] },
          ] },
        { id: 'MBR-2210', title: 'Einmal-Biopsiezange steril', product: 'Chirurgisches Einmalprodukt', cls: 'MDR Klasse IIa, steril', udiDi: '04 05123 45678 91 8', steps: stepsSimple('WI-BZ'),
          versions: [{ v: '1.0', status: 'Entwurf', effective: null, change: 'Neuanlage', signs: [] }] },
        { id: 'MBR-3305', title: 'Infusionspumpe Antriebsbaugruppe', product: 'Aktives Medizinprodukt', cls: 'MDR Klasse IIb', udiDi: '04 05123 45678 92 5', steps: stepsSimple('WI-IP'),
          versions: [{ v: '2.1', status: 'Wirksam', effective: '2026-03-01', change: 'Drehmomentgrenzen angepasst', signs: [
            { user: 'Marc Behrens', userId: 'u4', meaning: 'Eingereicht', ts: '2026-02-10T08:00:00+01:00' },
            { user: 'Sabine Frank', userId: 'u5', meaning: 'Geprüft', ts: '2026-02-18T11:00:00+01:00' },
            { user: 'Dr. Lena Roth', userId: 'u3', meaning: 'Freigegeben', ts: '2026-02-26T15:20:00+01:00' }] }] },
      ],
      batches: [
        { id: 'BR-2026-0481', mbrId: 'MBR-1042', mbrVersion: '3.0', bcOrder: 'FA-101234', lot: 'L26-0481', qty: 500, startedAt: '2026-11-19T06:10:00+01:00', exec: b0481, release: null },
        { id: 'BR-2026-0480', mbrId: 'MBR-1042', mbrVersion: '3.0', bcOrder: 'FA-101229', lot: 'L26-0480', qty: 500, startedAt: '2026-11-18T06:10:00+01:00', exec: b0480, release: null },
        { id: 'BR-2026-0479', mbrId: 'MBR-1042', mbrVersion: '3.0', bcOrder: 'FA-101221', lot: 'L26-0479', qty: 480, startedAt: '2026-11-17T06:10:00+01:00', exec: b0479, release: null },
        { id: 'BR-2026-0476', mbrId: 'MBR-1042', mbrVersion: '3.0', bcOrder: 'FA-101188', lot: 'L26-0476', qty: 470, startedAt: '2026-11-12T06:10:00+01:00', exec: b0476,
          release: { userId: 'u3', user: 'Dr. Lena Roth', ts: '2026-11-13T15:05:00+01:00', hash: null } },
      ],
      deviations: [
        { id: 'DEV-0097', batchId: 'BR-2026-0480', stepNo: 4, paramId: 'temp', value: 71, severity: 'Major', status: 'Offen',
          description: 'Badtemperatur 71 °C außerhalb des Grenzwerts 55–65 °C.', action: 'Charge gesperrt, Teile separiert, Heizregler geprüft.', createdBy: 'Anna Weber', createdAt: '2026-11-18T10:12:00+01:00' },
        { id: 'DEV-0091', batchId: 'BR-2026-0476', stepNo: 6, paramId: 'ra', value: 0.82, severity: 'Minor', status: 'Geschlossen',
          description: 'Rauheit Ra 0,82 µm an einem Stichprobenteil über Grenzwert.', action: 'Nachprüfung der Stichprobe, alle weiteren Teile in Toleranz.', createdBy: 'Anna Weber', createdAt: '2026-11-12T13:40:00+01:00',
          disposition: 'Verwendung wie besehen mit Begründung (Nachprüfung bestanden)', closedBy: 'Dr. Lena Roth', closedAt: '2026-11-13T09:30:00+01:00' },
      ],
      outbox: [
        { id: 'OB-1001', type: 'Verbrauchsbuchung', target: 'BC Prod. Order Component FA-101234', status: 'Gesendet', key: 'consume:BR-2026-0481:2', ts: '2026-11-19T06:50:00+01:00', detail: 'RM-TI64-45, Los TI-26-118' },
        { id: 'OB-1000', type: 'Qualitätsstatus', target: 'BC Item Tracking Los L26-0476', status: 'Gesendet', key: 'release:BR-2026-0476', ts: '2026-11-13T15:05:00+01:00', detail: 'Freigegeben' },
        { id: 'OB-0999', type: 'Ausstoßbuchung', target: 'BC Output Journal FA-101188', status: 'Gesendet', key: 'output:BR-2026-0476', ts: '2026-11-12T16:20:00+01:00', detail: '470 Stk' },
        { id: 'OB-1002', type: 'Qualitätsstatus', target: 'BC Item Tracking Los L26-0480', status: 'Fehler', key: 'hold:BR-2026-0480', ts: '2026-11-18T10:13:00+01:00', detail: 'Sperre: Timeout bei Aufruf der BC-Schnittstelle' },
      ],
      auditSeed: [
        { ts: '2026-05-28T10:40:00+02:00', userId: 'u3', action: 'MBR freigegeben', entity: 'MBR-1042 v3.0', detail: 'Signatur „Freigegeben“, Version wird wirksam' },
        { ts: '2026-11-12T13:40:00+01:00', userId: 'u1', action: 'Abweichung angelegt', entity: 'DEV-0091', detail: 'BR-2026-0476, Schritt 6: Ra 0,82 µm über Grenzwert' },
        { ts: '2026-11-13T09:30:00+01:00', userId: 'u3', action: 'Abweichung geschlossen', entity: 'DEV-0091', detail: 'Verwendung wie besehen mit Begründung' },
        { ts: '2026-11-13T15:05:00+01:00', userId: 'u3', action: 'Charge freigegeben', entity: 'BR-2026-0476', detail: 'QA-Freigabe, Qualitätsstatus an BC übermittelt' },
        { ts: '2026-11-17T16:30:00+01:00', userId: 'u4', action: 'MBR eingereicht', entity: 'MBR-1042 v4.0', detail: 'Version zur Prüfung eingereicht' },
        { ts: '2026-11-18T10:12:00+01:00', userId: 'u1', action: 'Abweichung angelegt', entity: 'DEV-0097', detail: 'BR-2026-0480, Schritt 4: Badtemperatur 71 °C außerhalb 55–65 °C' },
        { ts: '2026-11-19T06:20:00+01:00', userId: 'u1', action: 'Signatur', entity: 'BR-2026-0481 · Schritt 1', detail: 'Ausgeführt' },
        { ts: '2026-11-19T06:28:00+01:00', userId: 'u2', action: 'Signatur', entity: 'BR-2026-0481 · Schritt 1', detail: 'Verifiziert (Vier-Augen)' },
        { ts: '2026-11-19T06:50:00+01:00', userId: 'u1', action: 'Material gescannt', entity: 'BR-2026-0481 · Schritt 2', detail: 'Los TI-26-118 gegen BC geprüft: freigegeben' },
        { ts: '2026-11-19T06:51:00+01:00', userId: 'u1', action: 'Signatur', entity: 'BR-2026-0481 · Schritt 2', detail: 'Ausgeführt' },
      ],
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
