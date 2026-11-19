/* Rollen, elektronische Signaturen, Vier-Augen-Prinzip und Statusabläufe je App.
   Human in the Loop: Jede Aktion braucht Vorschau und Bestätigung (Engine); hier wird festgelegt,
   wer sie ausführen darf und welche Schritte zusätzlich signiert werden müssen. */
(function () {
  const e = CC.enhance;

  e('capa', '_', { start: 'QA' });
  e('capa', 'capas', {
    _flow: ['Offen', 'In Bearbeitung', 'Wirksamkeit prüfen', 'Geschlossen'],
    Starten: { roles: ['QA', 'Leitung'] },
    'Zur Wirksamkeit': { roles: ['QA'] },
    Wirksam: { roles: ['QA', 'Leitung'], sign: 'Wirksamkeit bestätigt', sod: true },
    Eskalieren: { roles: ['QA', 'Leitung'] }
  });
  e('capa', 'devs', { _flow: ['Ohne CAPA', 'CAPA angelegt'], 'CAPA anlegen': { roles: ['QA'] } });

  e('change', '_', { start: 'RA' });
  e('change', 'ecrs', {
    _flow: ['Entwurf', 'Impact-Analyse', 'Bewertung', 'Freigegeben'],
    'Impact-Analyse': { roles: ['RA', 'QA'] },
    'Zur Bewertung': { roles: ['RA', 'QA'] },
    'Freigeben': { roles: ['Leitung', 'QA'], sign: 'Änderung freigegeben', sod: true },
    Ablehnen: { roles: ['Leitung', 'QA'], sign: 'Änderung abgelehnt', sod: true }
  });

  e('supplier', '_', { start: 'Einkauf' });
  e('supplier', 'certs', { 'Erneuerung': { roles: ['Einkauf', 'QA'] }, 'Lieferant sperren': { roles: ['QA', 'Einkauf'], sign: 'Lieferant gesperrt' } });
  e('supplier', 'sup', { 'Sperre aufheben': { roles: ['QA', 'Leitung'], sign: 'Sperre aufgehoben', sod: true } });
  e('supplier', 'we', { 'Prüfung bestanden': { roles: ['QA'], sign: 'Wareneingang freigegeben', sod: true }, Sperren: { roles: ['QA', 'Produktion'], sign: 'Sperrlager veranlasst' } });

  e('recall', '_', { start: 'RA' });
  e('recall', 'lot', { 'Rückruf starten': { roles: ['RA', 'Leitung'], sign: 'Rückruf ausgelöst', sod: true } });
  e('recall', 'cust', { _flow: ['Kundeninfo offen', 'Kundeninfo gesendet', 'Bestätigt'], 'Schreiben senden': { roles: ['RA'], sign: 'Kundeninformation freigegeben' }, 'Rückmeldung': { roles: ['RA', 'QA'] } });

  e('pms', '_', { start: 'RA' });
  e('pms', 'cases', {
    _flow: ['Neu', 'Meldepflichtig', 'Meldung vorbereitet', 'Gemeldet'],
    Bewerten: { roles: ['RA', 'QA'], sign: 'Einstufung bestätigt' },
    'Meldung vorbereiten': { roles: ['RA'] },
    'Als gemeldet': { roles: ['RA', 'Leitung'], sign: 'Meldung an Behörde freigegeben', sod: true },
    'CAPA anlegen': { roles: ['QA', 'RA'] }
  });

  e('calibration', '_', { start: 'Produktion' });
  e('calibration', 'scan', { 'Kalibrierung erfassen': { roles: ['QA'], sign: 'Kalibrierung bestätigt' } });
  e('calibration', 'list', { 'Kalibrierung erfassen': { roles: ['QA'], sign: 'Kalibrierung bestätigt' } });

  e('training', '_', { start: 'Produktion' });
  e('training', 'quals', { 'Schulung buchen': { roles: ['Produktion', 'QA'] }, 'Befähigung bestätigen': { roles: ['QA', 'Leitung'], sign: 'Befähigung bestätigt', sod: true } });

  e('cleanroom', '_', { start: 'QA' });
  e('cleanroom', 'devs', { _flow: ['Offen', 'In Bewertung', 'Geschlossen'], 'Ursache bewerten': { roles: ['QA'] }, Schließen: { roles: ['QA', 'Leitung'], sign: 'Abweichung geschlossen', sod: true } });

  e('audit', '_', { start: 'QA' });
  e('audit', 'gaps', { 'Nachforderung': { roles: ['QA'] }, 'Nachweis ergänzt': { roles: ['QA', 'Produktion'], sign: 'Nachweis geprüft', sod: true } });
  e('audit', 'audits', { _flow: ['Geplant', 'Auditmodus aktiv', 'Abgeschlossen'], 'Auditmodus aktivieren': { roles: ['QA', 'Leitung'], sign: 'Auditorzugriff freigegeben' }, Abschließen: { roles: ['QA'] } });

  e('sterile', '_', { start: 'QA' });
  e('sterile', 'orders', { _flow: ['Geplant', 'Beim Dienstleister', 'Zyklusdaten erhalten', 'Freigegeben'], 'An Dienstleister': { roles: ['QA', 'Einkauf'] } });
  e('sterile', 'check', { _flow: ['Geplant', 'Beim Dienstleister', 'Zyklusdaten erhalten', 'Freigegeben'], 'Prüfen': { roles: ['QA'], sign: 'Sterilisation freigegeben bzw. abgelehnt', sod: true } });
})();
