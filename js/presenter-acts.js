/* Strukturierte Bedienschritte je Storyline-Schritt (Index entspricht PRES.apps[id].steps). */
(function () {
  const U = (n) => ({ l: 'Benutzer wechseln: ' + n, user: n });
  const T = (n) => ({ l: 'Tab „' + n + '“', tab: n });
  const P = (n) => ({ l: 'Filter „' + n + '“', pill: n });
  const R = (r, l) => ({ l: l || 'Zeile öffnen: ' + r.replace('|', ' / '), row: r });
  const B = (b, row) => ({ l: '„' + b + '“' + (row ? ' (' + row.replace('|', ' / ') + ')' : ''), btn: b, row, confirm: true });
  const F_ = (b) => ({ l: '„' + b + '“', btn: b, confirm: false });
  const BN = (b) => ({ l: '„' + b + '“', btn: b, confirm: false });
  const F = (f, v) => ({ l: 'Feld „' + f + '“' + (v ? ' = ' + v : ''), field: f, value: v });
  const S = (s, v) => ({ l: 'Auswahl „' + s + '“ = ' + v, sel: s, value: v });
  const Q = (v) => ({ l: 'Suche: ' + v, lookup: v });
  const PIN = () => ({ l: 'PIN 1234 eingeben (E-Signatur)', pin: '1234' });
  const OK = () => ({ l: 'Bestätigen und ausführen', ok: true });
  const SUB = () => ({ l: 'Formular bestätigen', submit: true });
  const BELL = () => ({ l: 'Glocke öffnen', bell: true });
  const NF = () => ({ l: 'Ersten Benachrichtigungseintrag anklicken', notif: true });
  const N = (n) => ({ l: 'Menü „' + n + '“', nav: n });
  const AUD = T('Prüfpfad & Integration');
  const A = {
    embr: [
      [], [U('Anna Weber'), U('Dr. Lena Roth')], [N('Batch Records')], [N('Abweichungen')], [U('Dr. Lena Roth'), N('QA-Freigabe')], [N('Rückverfolgung'), N('Audit Trail')]
    ],
    capa: [
      [], [U('A. Weber')],
      [T('Abweichungen aus COSMO QA'), B('CAPA anlegen', 'D-26-021'), OK()],
      [T('Maßnahmen'), R('CAPA-26-008'), B('Starten', 'CAPA-26-008'), OK(), B('Eskalieren', 'CAPA-26-007')],
      [T('Maßnahmen'), B('Wirksam – schließen', 'CAPA-26-005'), F('Nachweis der Wirksamkeit', 'Stichprobe 3 Chargen ohne Wiederholung'), SUB(), PIN(), OK()],
      [AUD, BN('Integrität prüfen'), BN('Manipulation simulieren')]
    ],
    change: [
      [], [U('S. Hoffmann'), T('Where-used'), Q('FO-55')],
      [T('Änderungsanträge'), B('Impact-Analyse', 'ECR-26-012'), B('Zur Bewertung', 'ECR-26-012')],
      [U('Dr. P. Lange'), B('Freigeben & signieren', 'ECR-26-011'), PIN(), OK()],
      [BELL(), NF(), AUD]
    ],
    supplier: [
      [], [U('M. Richter'), T('Zertifikate'), P('Abgelaufen'), B('Erneuerung anfordern', 'MetallTec')],
      [U('A. Weber'), B('Lieferant sperren', 'MetallTec'), PIN(), OK()],
      [T('Wareneingang'), Q('WE-26-0413'), F_('Sperren (Sperrlager)'), F('Grund', 'Zertifikat abgelaufen'), SUB(), Q('WE-26-0412'), B('Prüfung bestanden – freigeben')],
      [T('Lieferantenbewertung')]
    ],
    recall: [
      [], [U('S. Hoffmann'), T('Charge suchen'), Q('L26-0481')],
      [F_('Rückruf starten'), F('Grund', 'Sterilitätsverdacht'), SUB(), PIN(), OK()],
      [T('Kundeninformation'), B('Schreiben senden', 'Klinikum Nord|L26-0481'), B('Rückmeldung erfassen', 'Klinikum Nord|L26-0481')],
      [AUD]
    ],
    pms: [
      [], [U('S. Hoffmann'), T('Reklamationen'), B('Reklamation erfassen'), SUB()],
      [B('Bewerten', 'RK-26-031'), F('Einstufung', 'Schwere Gefahr'), SUB(), PIN(), OK()],
      [B('Meldung vorbereiten', 'RK-26-031'), U('Dr. P. Lange'), B('Als gemeldet markieren', 'RK-26-031')],
      [B('CAPA anlegen', 'RK-26-031'), BELL()]
    ],
    calibration: [
      [], [U('K. Braun'), T('Scan'), Q('PM-1002'), Q('PM-1001')],
      [T('Scan'), Q('PM-1001'), B('Im Prüfschritt verwenden')],
      [U('A. Weber'), T('Scan'), Q('PM-1002'), B('Kalibrierung erfassen'), F('Zertifikatsnummer', 'KZ-26-0457'), SUB(), PIN(), OK()],
      [T('Prüfmittelliste')]
    ],
    training: [
      [], [U('K. Braun'), T('Prüfung vor Schrittstart'), S('Mitarbeiter', 'S. Hoffmann'), S('Arbeitsschritt', 'Siegelprozess')],
      [T('Befähigungsmatrix')],
      [U('A. Weber'), T('Befähigungen'), B('Schulung buchen', 'S. Hoffmann|Siegelprozess'), U('Dr. P. Lange'), B('Befähigung bestätigen', 'S. Hoffmann|Siegelprozess'), F('Trainer', 'M. Vogel'), SUB(), PIN(), OK()]
    ],
    cleanroom: [
      [], [U('K. Braun'), T('Rundgang'), B('Messwert erfassen', 'RR-01'), F('Messwert', '21'), SUB()],
      [B('Messwert erfassen', 'RR-02'), F('Messwert', '25'), SUB()],
      [U('A. Weber'), T('Abweichungen'), B('Ursache bewerten'), F('Ursache', 'Filterausfall'), SUB(), U('Dr. P. Lange'), B('Schließen'), PIN(), OK()],
      [AUD]
    ],
    audit: [
      [], [U('A. Weber'), T('Nachweispaket'), Q('L26-0481')],
      [T('Lücken'), B('Nachforderung', 'L26-0481|Kalibrierstatus'), B('Nachweis ergänzt', 'L26-0481|Kalibrierstatus')],
      [T('Nachweispaket'), Q('L26-0455'), B('Paket exportieren')],
      [T('Audittermine'), B('Auditmodus aktivieren', 'AU-26-03'), PIN(), OK(), U('J. Auditor')]
    ],
    sterile: [
      [], [U('A. Weber'), T('Aufträge (Hersteller)'), B('An Dienstleister senden', 'ST-26-041')],
      [T('Dienstleister-Portal (extern)'), B('Zyklusdaten übermitteln', 'ST-26-040'), F('Zyklus-Nr.', 'Z-26-118'), F('Dosis min. (kGy)', '27'), F('Dosis max. (kGy)', '36'), SUB()],
      [T('Eingangsprüfung'), B('Prüfen & entscheiden', 'ST-26-039'), PIN(), OK()],
      [AUD]
    ]
  };
  // Jede Aktion läuft über Vorschau und PIN (Human in the Loop): fehlende Bestätigungsschritte werden ergänzt.
  const withPin = (l) => {
    const o = []; let pend = false, pinned = false;
    const flush = () => { if (!pend) return; if (!pinned) o.push(PIN()); o.push(OK()); pend = false; pinned = false; };
    l.forEach((a) => {
      if (a.field || a.submit || a.pin || a.ok) { if (a.ok && !pinned) o.push(PIN()); o.push(a); if (a.submit) pend = true; if (a.pin) pinned = true; if (a.ok) { pend = false; pinned = false; } return; }
      flush();
      o.push(a);
      if (a.confirm) pend = true;
    });
    flush();
    return o;
  };
  Object.keys(A).forEach((id) => A[id].forEach((acts0, i) => { const st = PRES.apps[id] && PRES.apps[id].steps[i]; if (st && st.user && acts0.length && !acts0.some((a) => a.user) ) acts0 = [U(st.user)].concat(acts0); const acts = withPin(acts0); if (PRES.apps[id] && PRES.apps[id].steps[i]) PRES.apps[id].steps[i].acts = acts; }));
})();
