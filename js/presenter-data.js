/* Inhalte der Referentenansicht: Storyline je Mockup, Einwände und Glossar.
   Alle Beispieldaten sind fiktiv; Zuordnungen zu Normen und Produkten sind Entwürfe. */
window.PRES = {
  glossary: {
    'Anyfy': 'COSMO Anyfy: Plattform für schlanke, geführte Companion-Apps und Workflows, die Business Central und Branchenprodukte um Oberflächen für Werker, Qualität und Außendienst ergänzt.',
    'BC': 'Business Central (Microsoft Dynamics 365 Business Central): führendes ERP-System für Artikel, Chargen, Aufträge, Lager und Einkauf.',
    'COSMO QA': 'COSMO-Qualitätsmodul in Business Central: Qualitätskontrollen, Abweichungen, Prüfpläne.',
    'COSMO UDI': 'COSMO-Modul in Business Central für UDI-Kennzeichnung und Datenübermittlung (z. B. an EUDAMED).',
    'UDI': 'Unique Device Identification: eindeutige Produktkennung für Medizinprodukte (UDI-DI + UDI-PI).',
    'EUDAMED': 'Europäische Datenbank für Medizinprodukte nach MDR.',
    'MDR': 'Medical Device Regulation (EU 2017/745): Verordnung für Medizinprodukte in der EU.',
    'ISO 13485': 'Internationale Norm für Qualitätsmanagementsysteme von Medizinprodukteherstellern.',
    '21 CFR 11': '21 CFR Part 11: US-Vorgaben der FDA zu elektronischen Aufzeichnungen und elektronischen Signaturen.',
    '21 CFR 820': '21 CFR Part 820: US-Qualitätssystemverordnung der FDA für Medizinprodukte (QSR/QMSR).',
    'Annex 11': 'EU-GMP-Leitfaden Anhang 11: Anforderungen an computergestützte Systeme.',
    'eMBR': 'Electronic Master Batch Record: elektronische Herstellvorschrift (Vorlage).',
    'MBR': 'Master Batch Record: Herstellvorschrift als Vorlage für jede Charge.',
    'eDHR': 'Electronic Device History Record: elektronische Chargenakte, die belegt, wie ein Produkt gefertigt wurde.',
    'DHR': 'Device History Record: Chargenakte eines Medizinprodukts.',
    'CAPA': 'Corrective and Preventive Action: Korrektur- und Vorbeugemaßnahme zur Behebung und Verhinderung von Fehlern.',
    'ECR': 'Engineering Change Request: Änderungsantrag.',
    'Where-used': 'Verwendungsnachweis: zeigt, wo ein Artikel eingesetzt wird (Stücklisten, Arbeitspläne, Dokumente).',
    'Impact-Analyse': 'Bewertung, welche Produkte, Dokumente und Prozesse von einer Änderung betroffen sind.',
    'FSCA': 'Field Safety Corrective Action: Sicherheitskorrekturmaßnahme im Feld, z. B. ein Rückruf.',
    'FSN': 'Field Safety Notice: Sicherheitsinformation an Kunden und Anwender.',
    'Charge / Lot': 'Produktionslos mit einheitlichen Eigenschaften; Basis der Rückverfolgbarkeit.',
    'Vigilanz': 'Überwachung und Meldung schwerwiegender Vorkommnisse mit Medizinprodukten an Behörden.',
    'PMS': 'Post-Market Surveillance: Überwachung der Produkte nach dem Inverkehrbringen.',
    'Meldepflicht': 'Pflicht, bestimmte Vorkommnisse innerhalb gesetzlicher Fristen an die Behörde zu melden (Fristen im Mockup nur beispielhaft).',
    'Kalibrierung': 'Vergleich eines Messmittels mit einem Normal, um dessen Genauigkeit nachzuweisen.',
    'Prüfmittel': 'Mess- und Prüfgeräte, die für Qualitätsentscheidungen verwendet werden.',
    'Befähigung': 'Nachweis, dass ein Mitarbeiter eine Tätigkeit nach Schulung ausführen darf.',
    'Befähigungsmatrix': 'Übersicht, welcher Mitarbeiter welche Tätigkeit ausführen darf.',
    'ISO 7': 'Reinraumklasse nach ISO 14644-1 mit definierter Partikelzahl je Kubikmeter Luft.',
    'ISO 14644': 'Normenreihe zu Reinräumen und zugehörigen Reinraumbereichen.',
    'Differenzdruck': 'Druckunterschied zwischen Räumen, schützt den Reinraum vor Verunreinigung.',
    'Partikel': 'Schwebeteilchen in der Raumluft; Zahl wird im Reinraum überwacht.',
    'kGy': 'Kilogray: Einheit der Strahlendosis bei der Sterilisation.',
    'Lohnfertigung': 'Fertigungsschritt, der von einem externen Dienstleister ausgeführt wird (z. B. Sterilisation).',
    'Sterilisation': 'Verfahren, das Produkte keimfrei macht (z. B. Strahlung, Gas).',
    'Benannte Stelle': 'Von der EU benannte Prüfstelle, die Konformität von Medizinprodukten bewertet.',
    'Audit': 'Systematische, unabhängige Prüfung von Prozessen und Nachweisen.',
    'Audit Trail': 'Lückenlose, nachvollziehbare Aufzeichnung, wer wann was geändert hat.',
    'Hash-Kette': 'Jeder Prüfpfad-Eintrag enthält den Fingerabdruck (SHA-256) des Vorgängers; nachträgliche Änderungen fallen auf.',
    'SHA-256': 'Kryptografisches Verfahren, das einen eindeutigen Fingerabdruck (Hash) zu Daten berechnet.',
    'E-Signatur': 'Elektronische Signatur mit erneuter Anmeldung, Name, Zeit und Bedeutung (z. B. „Freigegeben“).',
    'Vier-Augen-Prinzip': 'Eine zweite, unabhängige Person muss kritische Schritte freigeben.',
    'Human in the Loop': 'Das System macht Vorschläge; ein berechtigter Mensch prüft, bestätigt und trägt die Verantwortung.',
    'Vorschau': 'Zeigt vor jeder Aktion, welche Änderungen und Aufrufe an andere Systeme ausgelöst würden.',
    'SoD': 'Segregation of Duties: Funktionstrennung, z. B. wer beantragt, darf nicht freigeben.',
    'GMP': 'Good Manufacturing Practice: Regeln guter Herstellungspraxis.',
    'QMS': 'Qualitätsmanagementsystem.',
    'RA': 'Regulatory Affairs: Zulassung und Einhaltung regulatorischer Vorgaben.',
    'QA': 'Qualitätssicherung.',
    'WE': 'Wareneingang.',
    'Sperrlager': 'Lagerbereich für gesperrte Ware, die nicht verwendet werden darf.',
    'KPI': 'Key Performance Indicator: Kennzahl zur Steuerung.',
    'ERP': 'Enterprise Resource Planning: Unternehmenssoftware für Ressourcen und Abläufe.',
    'Mockup': 'Klickbarer Prototyp mit Beispieldaten; keine Verbindung zu echten Systemen.',
    'Wirksamkeitsprüfung': 'Nachweis, dass eine Maßnahme das Problem tatsächlich dauerhaft behoben hat.',
    'Eskalation': 'Weiterleitung an die nächste Ebene, wenn Fristen überschritten werden.',
    'Zertifikat': 'Nachweis eines Lieferanten, z. B. ISO-13485-Zertifikat oder Materialzertifikat.',
    'Lieferantenklasse': 'Einstufung A/B/C nach Risiko und Bedeutung des Lieferanten.',
    'MDSAP': 'Medical Device Single Audit Program: ein Audit für mehrere Märkte.'
  },

  apps: {
    embr: {
      pitch: 'Von der Papierchargenakte zur elektronischen Chargenakte: geführte Schritte, Grenzwerte, Signatur und Freigabe auf einer Oberfläche, mit Business Central als führendem System.',
      terms: ['eMBR', 'eDHR', 'MBR', 'DHR', 'E-Signatur', 'Audit Trail', '21 CFR 11', 'Annex 11', 'ISO 13485', 'Vier-Augen-Prinzip', 'Anyfy', 'BC', 'COSMO QA', 'COSMO UDI', 'UDI', 'MDR'],
      steps: [
        { t: 'Ausgangslage', min: 2, say: ['Chargenakten auf Papier kosten Zeit: Suchen, Nachtragen, Rückfragen.', 'Fehler fallen oft erst bei der Freigabe auf.', 'Ziel: Fehler sofort am Arbeitsplatz erkennen und die Akte automatisch vollständig halten.'], do: ['Portal zeigen, Kachel „eMBR / eDHR“ öffnen.'], view: 'Übersicht' },
        { t: 'Übersicht und Rollen', min: 3, say: ['Jede Rolle sieht nur ihre Aufgaben: Werker, Verifizierer, QA, RA, Autor.', 'Business Central liefert Aufträge, Artikel und Chargen; die Oberfläche liegt in Anyfy.'], do: ['Oben rechts „Angemeldet als“ öffnen und die Rolle wechseln.'], view: 'Übersicht' },
        { t: 'Geführte Fertigung', min: 4, say: ['Schritt für Schritt mit Sollwerten und Toleranzen.', 'Ein Wert außerhalb der Grenzen wird sofort gemeldet, nicht erst bei der Freigabe.', 'Kritische Schritte verlangen eine zweite Person.'], do: ['Menü „Batch Records“, eine Charge öffnen, einen Schritt ausführen.', 'Absichtlich einen Wert außerhalb der Toleranz eingeben.'], view: 'Batch Records' },
        { t: 'Abweichung und COSMO QA', min: 3, say: ['Die Abweichung entsteht im Prozess, die Bearbeitung läuft im COSMO-QA-Modul in Business Central.', 'Kein Medienbruch, keine doppelte Erfassung.'], do: ['Menü „Abweichungen“ öffnen.'], view: 'Abweichungen' },
        { t: 'QA-Freigabe', min: 3, say: ['Das Cockpit zeigt, was für die Freigabe noch fehlt.', 'Die Freigabe erfolgt nur durch einen Menschen mit E-Signatur.'], do: ['Menü „QA-Freigabe“ öffnen, als QA anmelden und die Freigabe prüfen.'], view: 'QA-Freigabe' },
        { t: 'Rückverfolgung, UDI und Audit Trail', min: 3, say: ['Von der Charge zu Material, Prüfmitteln und Personen.', 'COSMO UDI in Business Central liefert die Kennzeichnung.', 'Der Audit Trail ist die Grundlage für die Auditfähigkeit.'], do: ['Menü „Rückverfolgung“, danach „Audit Trail“ zeigen.'], view: 'Audit Trail' }
      ],
      qa: [['Ersetzt das Business Central?', 'Nein. BC bleibt führend für Stammdaten, Chargen und Aufträge. Anyfy ergänzt die Oberfläche.'], ['Ist das validiert?', 'Nein, es ist ein Mockup mit Beispieldaten. Validierung (CSV) gehört in das Projekt.']]
    },

    capa: {
      pitch: 'Maßnahmen werden nicht mehr in Listen verwaltet, sondern mit Frist, Eskalation und Wirksamkeitsprüfung gesteuert. Abweichungen kommen aus COSMO QA.',
      terms: ['CAPA', 'COSMO QA', 'Wirksamkeitsprüfung', 'Eskalation', 'E-Signatur', 'Vier-Augen-Prinzip', 'ISO 13485', '21 CFR 820', 'Human in the Loop', 'Audit Trail', 'Anyfy', 'BC'],
      steps: [
        { t: 'Problem', min: 2, say: ['Typisch: Maßnahmen liegen in Excel, Fristen werden übersehen, die Wirksamkeit wird selten belegt.', 'Auditoren fragen genau danach.'], do: ['Portal: Kachel „CAPA & Abweichungen“ öffnen.'], view: 'Übersicht' },
        { t: 'Übersicht und Aufgaben', min: 2, user: 'A. Weber · QA', say: ['Frist-Kennzahlen oben: offen, überfällig, ohne CAPA.', 'Unter „Aufgaben“ steht, was diese Person heute entscheiden muss.'], do: ['Als A. Weber · QA angemeldet bleiben.', 'Den Hinweis „Human in the Loop“ vorlesen.'], view: 'Übersicht' },
        { t: 'Abweichung wird zur CAPA', min: 3, user: 'A. Weber · QA', say: ['Die Abweichung stammt aus COSMO QA in Business Central.', 'Ein Klick legt die CAPA an; vorher zeigt die Vorschau, was passiert.'], do: ['Tab „Abweichungen aus COSMO QA“, Zeile ohne CAPA, „CAPA anlegen“.', 'Vorschau zeigen, dann „Bestätigen und ausführen“.'], view: 'Abweichungen aus COSMO QA' },
        { t: 'Maßnahme steuern', min: 3, user: 'A. Weber · QA', say: ['Status-Ablauf: Offen, In Bearbeitung, Wirksamkeit prüfen, Geschlossen.', 'Überfällige Maßnahmen lassen sich eskalieren.'], do: ['Tab „Maßnahmen“, Zeile öffnen (Detailfenster mit Statusablauf).', '„Starten“ ausführen, bei überfälliger Zeile „Eskalieren“.'], view: 'Maßnahmen' },
        { t: 'Wirksamkeit und E-Signatur', min: 4, user: 'A. Weber · QA', say: ['Schließen geht nur mit Nachweis der Wirksamkeit und Signatur.', 'Das Vier-Augen-Prinzip verhindert, dass dieselbe Person alles allein abschließt.'], do: ['Eine Maßnahme im Status „Wirksamkeit prüfen“ wählen, „Wirksam – schließen“.', 'Nachweis eintragen, PIN 1234 eingeben, bestätigen.'], view: 'Maßnahmen' },
        { t: 'Prüfpfad', min: 2, say: ['Jeder Schritt steht mit Person, Rolle und Signatur im Prüfpfad.', 'Die Hash-Kette zeigt Manipulation sofort.'], do: ['Tab „Prüfpfad & Integration“, „Integrität prüfen“, dann „Manipulation simulieren“.'], view: 'Prüfpfad & Integration' }
      ],
      qa: [['Wer darf schließen?', 'Nur QA oder Leitung, mit E-Signatur; wer beteiligt war, darf nicht allein freigeben (Rollen sind ein Entwurf).'], ['Werden Daten nach BC geschrieben?', 'Im Mockup simuliert; im Projekt erst nach menschlicher Bestätigung.']]
    },

    change: {
      pitch: 'Änderungen werden mit automatischer Verwendungsanalyse aus Business Central bewertet und nur nach signierter Freigabe wirksam.',
      terms: ['ECR', 'Where-used', 'Impact-Analyse', 'MDR', 'ISO 13485', 'E-Signatur', 'Vier-Augen-Prinzip', 'RA', 'QA', 'BC', 'Anyfy', 'Human in the Loop'],
      steps: [
        { t: 'Problem', min: 2, say: ['Eine kleine Änderung (Folie, Parameter, Etikett) hat oft große Folgen für Dokumente, Stücklisten und Zulassung.', 'Wer die Folgen nicht kennt, riskiert Abweichungen und Auditfeststellungen.'], do: ['Kachel „Änderungsmanagement“ öffnen.'], view: 'Übersicht' },
        { t: 'Where-used aus BC', min: 3, user: 'S. Hoffmann · RA', say: ['Artikel eingeben und sofort sehen, wo er verwendet wird.', 'Die Daten kommen aus Business Central.'], do: ['Tab „Where-used“, Artikel FO-55 eingeben, „Analysieren“.'], view: 'Where-used' },
        { t: 'Antrag anlegen und bewerten', min: 3, user: 'S. Hoffmann · RA', say: ['Aus der Analyse wird ein Änderungsantrag.', 'Ablauf: Entwurf, Impact-Analyse, Bewertung, Freigegeben.'], do: ['Tab „Änderungsanträge“, „Neuer Antrag“ oder ECR-26-012 öffnen.', '„Impact-Analyse“ ausführen, danach „Zur Bewertung“.'], view: 'Änderungsanträge' },
        { t: 'Freigabe mit Signatur', min: 4, user: 'Dr. P. Lange · Leitung', say: ['Freigeben darf nur eine berechtigte Person, die den Antrag nicht selbst bearbeitet hat.', 'Die Signatur trägt die Bedeutung „Änderung freigegeben“.'], do: ['Benutzer auf Dr. P. Lange · Leitung wechseln.', 'ECR-26-011 öffnen, „Freigeben & signieren“, PIN 1234.'], view: 'Änderungsanträge' },
        { t: 'Benachrichtigung und Prüfpfad', min: 2, say: ['Die Glocke zeigt, was andere geändert haben.', 'Alles landet im Prüfpfad.'], do: ['Glocke öffnen, Eintrag anklicken.', 'Tab „Prüfpfad & Integration“ zeigen.'], view: 'Prüfpfad & Integration' }
      ],
      qa: [['Sind die Where-used-Daten vollständig?', 'Im Mockup Beispieldaten. Im Projekt hängt es von Stücklisten, Arbeitsplänen und Dokumentenverknüpfungen in BC ab.'], ['Wer entscheidet über die Auswirkungen?', 'Immer ein Mensch; das System liefert nur die Grundlage.']]
    },

    supplier: {
      pitch: 'Lieferantenqualität wirkt direkt auf den Wareneingang: abgelaufene Zertifikate sperren den Lieferanten, der Wareneingang zeigt das sofort an.',
      terms: ['Zertifikat', 'Lieferantenklasse', 'WE', 'Sperrlager', 'ISO 13485', 'COSMO QA', 'BC', 'Anyfy', 'E-Signatur', 'Charge / Lot', 'Vier-Augen-Prinzip', 'Human in the Loop'],
      steps: [
        { t: 'Problem', min: 2, say: ['Zertifikate laufen unbemerkt ab; Ware wird trotzdem eingebucht.', 'Qualität und Einkauf arbeiten mit getrennten Listen.'], do: ['Kachel „Lieferanten & Wareneingang“ öffnen.'], view: 'Übersicht' },
        { t: 'Zertifikate überwachen', min: 3, user: 'M. Richter · Einkauf', say: ['Ampel für abgelaufen, läuft bald ab, gültig.', 'Der Einkauf fordert die Erneuerung direkt an.'], do: ['Tab „Zertifikate“, Filter „Abgelaufen“, „Erneuerung anfordern“ ausführen.'], view: 'Zertifikate' },
        { t: 'Lieferant sperren', min: 3, user: 'A. Weber · QA', say: ['Abgelaufenes Zertifikat und keine Erneuerung: der Lieferant wird gesperrt.', 'Die Sperre wird in Business Central gesetzt, nach Bestätigung und Signatur.'], do: ['Auf A. Weber · QA wechseln, „Lieferant sperren“, PIN 1234.'], view: 'Zertifikate' },
        { t: 'Wareneingang mobil prüfen', min: 4, user: 'A. Weber · QA', say: ['Am Tablet die Wareneingangsnummer eingeben.', 'Das System zeigt, ob der Lieferant qualifiziert ist.', 'Bei gesperrten Lieferanten ist die Freigabe nicht möglich.'], do: ['Tab „Wareneingang“, WE-26-0413 (MetallTec Müller) eingeben.', 'Dann WE-26-0412 prüfen und freigeben.'], view: 'Wareneingang' },
        { t: 'Bewertung', min: 2, say: ['Lieferantenbewertung mit Klasse und Punktzahl.', 'Eine Sperre kann nur QA oder Leitung wieder aufheben.'], do: ['Tab „Lieferantenbewertung“ zeigen.'], view: 'Lieferantenbewertung' }
      ],
      qa: [['Woher kommen die Lieferantendaten?', 'Aus Business Central; die Bewertungsregeln sind im Mockup beispielhaft.']]
    },

    recall: {
      pitch: 'Vom Chargenkennzeichen zu Lagerbestand, Lieferungen und Kunden in Sekunden, und ein gesteuerter Rückruf statt Telefonlisten.',
      terms: ['FSCA', 'FSN', 'Charge / Lot', 'UDI', 'COSMO UDI', 'MDR', 'EUDAMED', 'Sperrlager', 'E-Signatur', 'Vier-Augen-Prinzip', 'BC', 'Anyfy', 'Human in the Loop'],
      steps: [
        { t: 'Problem', min: 2, say: ['Im Ernstfall zählt die Zeit: Welche Kunden haben welche Charge?', 'Heute dauert das Stunden bis Tage.'], do: ['Kachel „Rückverfolgung & Rückruf“ öffnen.'], view: 'Übersicht' },
        { t: 'Charge suchen', min: 3, user: 'S. Hoffmann · RA', say: ['Eine Chargennummer genügt.', 'Ergebnis: Lagerbestand, Lieferungen, Kunden.'], do: ['Tab „Charge suchen“, L26-0481 eingeben.'], view: 'Charge suchen' },
        { t: 'Rückruf auslösen', min: 4, user: 'S. Hoffmann · RA', say: ['Der Rückruf sperrt den Bestand in Business Central.', 'Ein Rückruf ist eine schwere Entscheidung: Vorschau, Signatur und zweite Person sind Pflicht.'], do: ['„Rückruf starten“, Grund wählen, Vorschau zeigen.', 'PIN 1234 eingeben.'], view: 'Charge suchen' },
        { t: 'Kunden informieren', min: 3, user: 'S. Hoffmann · RA', say: ['Jeder betroffene Kunde bekommt eine Kundeninformation (FSN).', 'Rückmeldungen werden erfasst; die Rücklaufquote steuert die Aktion.'], do: ['Tab „Kundeninformation“, „Schreiben senden“, danach „Rückmeldung erfassen“.'], view: 'Kundeninformation' },
        { t: 'Nachweis', min: 2, say: ['Alles steht im Prüfpfad, auch wer wann freigegeben hat.', 'Das ist die Grundlage für den Bericht an die Behörde.'], do: ['Tab „Prüfpfad & Integration“ zeigen.'], view: 'Prüfpfad & Integration' }
      ],
      qa: [['Wird die Behörde automatisch informiert?', 'Nein. Meldungen bereitet das System vor, ein Mensch gibt sie frei.']]
    },

    pms: {
      pitch: 'Reklamationen werden strukturiert bewertet, Meldepflichten und Fristen sichtbar gemacht, und die Entscheidung bleibt beim Vigilanzbeauftragten.',
      terms: ['Vigilanz', 'PMS', 'Meldepflicht', 'MDR', 'CAPA', 'RA', 'E-Signatur', 'Vier-Augen-Prinzip', 'Human in the Loop', 'Charge / Lot', 'BC', 'COSMO QA', 'Anyfy'],
      steps: [
        { t: 'Problem', min: 2, say: ['Eine Feldmeldung kann meldepflichtig sein. Fristen laufen ab Kenntnis.', 'Heute werden Reklamationen oft nur als Tickets geführt.'], do: ['Kachel „Reklamationen & Vigilanz“ öffnen.'], view: 'Übersicht' },
        { t: 'Neue Reklamation', min: 2, user: 'S. Hoffmann · RA', say: ['Erfassung mit Produkt, Charge und Land.', 'Die Charge ist der Schlüssel zu Rückverfolgung und Produktion.'], do: ['Tab „Reklamationen“, „Reklamation erfassen“.'], view: 'Reklamationen' },
        { t: 'Bewerten', min: 4, user: 'S. Hoffmann · RA', say: ['Die Entscheidungshilfe schlägt eine Einstufung vor.', 'Sie ersetzt keine regulatorische Bewertung; der Mensch bestätigt per Signatur.'], do: ['Fall RK-26-031 öffnen, „Bewerten“, Einstufung wählen, PIN 1234.'], view: 'Reklamationen' },
        { t: 'Meldung vorbereiten', min: 3, user: 'S. Hoffmann · RA', say: ['Bei Meldepflicht wird die Meldung vorbereitet.', 'Die Frist ist sichtbar; Fristen im Mockup sind nur beispielhaft.'], do: ['„Meldung vorbereiten“ ausführen.', 'Als Dr. P. Lange · Leitung „Als gemeldet markieren“.'], view: 'Reklamationen' },
        { t: 'CAPA anlegen', min: 2, say: ['Aus dem Fall entsteht eine CAPA in COSMO QA.', 'Damit schließt sich der Kreis zur Produktion.'], do: ['„CAPA anlegen“ ausführen.', 'Glocke zeigen.'], view: 'Reklamationen' }
      ],
      qa: [['Sind die Fristen korrekt?', 'Nein, sie sind illustrativ und müssen mit RA geprüft werden.']]
    },

    calibration: {
      pitch: 'Ein überfälliges Prüfmittel kann nicht mehr verwendet werden, weil die Sperre direkt im Prüfschritt wirkt.',
      terms: ['Kalibrierung', 'Prüfmittel', 'eMBR', 'ISO 13485', 'E-Signatur', 'QA', 'BC', 'Anyfy', 'Human in the Loop', 'Audit Trail', 'MDR'],
      steps: [
        { t: 'Problem', min: 2, say: ['Ein Prüfmittel mit abgelaufener Kalibrierung macht Messungen ungültig.', 'Das fällt oft erst im Audit auf.'], do: ['Kachel „Prüfmittel & Kalibrierung“ öffnen.'], view: 'Übersicht' },
        { t: 'Scan', min: 3, user: 'K. Braun · Produktion', say: ['Vor der Nutzung wird das Prüfmittel gescannt.', 'Überfällig bedeutet gesperrt.'], do: ['Tab „Scan“, PM-1002 eingeben (überfällig), dann PM-1001.'], view: 'Scan' },
        { t: 'Verwenden im Prüfschritt', min: 2, user: 'K. Braun · Produktion', say: ['Gültige Geräte werden im Prüfschritt des eMBR verwendet; die Nutzung steht im Prüfpfad.'], do: ['PM-1001: „Im Prüfschritt verwenden“.'], view: 'Scan' },
        { t: 'Kalibrierung erfassen', min: 3, user: 'A. Weber · QA', say: ['Nur QA darf eine Kalibrierung bestätigen.', 'Zertifikatsnummer wird erfasst; die Bestätigung ist signiert.'], do: ['Auf A. Weber · QA wechseln, PM-1002, „Kalibrierung erfassen“, PIN 1234.'], view: 'Scan' },
        { t: 'Prüfmittelliste', min: 2, say: ['Ampelsicht auf alle Geräte: überfällig, bald fällig, gültig.'], do: ['Tab „Prüfmittelliste“ zeigen.'], view: 'Prüfmittelliste' }
      ],
      qa: [['Gibt es eine Verbindung zum Gerät?', 'Nein, die Kalibrierdaten werden manuell erfasst; Scanner oder Anbindung wären Ausbau.']]
    },

    training: {
      pitch: 'Wer eine Tätigkeit ausführt, muss befähigt sein. Das System prüft es vor dem Schrittstart.',
      terms: ['Befähigung', 'Befähigungsmatrix', 'eMBR', 'ISO 13485', 'E-Signatur', 'Vier-Augen-Prinzip', 'QA', 'BC', 'Anyfy', 'Human in the Loop', 'GMP'],
      steps: [
        { t: 'Problem', min: 2, say: ['Schulungsnachweise liegen in Ordnern oder Excel.', 'Im Audit wird gefragt: Durfte diese Person den Schritt ausführen?'], do: ['Kachel „Schulung & Befähigung“ öffnen.'], view: 'Übersicht' },
        { t: 'Prüfung vor Schrittstart', min: 3, user: 'K. Braun · Produktion', say: ['Mitarbeiter und Arbeitsschritt wählen.', 'Das Ergebnis lautet befähigt oder nicht befähigt, mit Begründung.'], do: ['Tab „Prüfung vor Schrittstart“, Mitarbeiter und Schritt wählen, Ergebnis zeigen.'], view: 'Prüfung vor Schrittstart' },
        { t: 'Befähigungsmatrix', min: 2, say: ['Überblick: wer darf was.', 'Rot bedeutet abgelaufen, gelb läuft bald ab.'], do: ['Tab „Befähigungsmatrix“ zeigen.'], view: 'Befähigungsmatrix' },
        { t: 'Schulung buchen und bestätigen', min: 4, user: 'A. Weber · QA', say: ['Für Abgelaufene wird eine Schulung gebucht.', 'Die Befähigung bestätigt ein Mensch mit Signatur; der Trainer wird erfasst.'], do: ['Tab „Befähigungen“, „Schulung buchen“.', 'Dann „Befähigung bestätigen“, Trainer eintragen, PIN 1234.'], view: 'Befähigungen' }
      ],
      qa: [['Gibt es ein Schulungssystem?', 'Im Mockup nicht. Eine Anbindung an ein LMS ist Ausbau.']]
    },

    cleanroom: {
      pitch: 'Messrundgänge am Tablet mit Grenzwertprüfung und Trend. Eine Überschreitung erzeugt eine Abweichung, aber ein Mensch bewertet sie.',
      terms: ['ISO 7', 'ISO 14644', 'Partikel', 'Differenzdruck', 'COSMO QA', 'ISO 13485', 'E-Signatur', 'Vier-Augen-Prinzip', 'BC', 'Anyfy', 'Human in the Loop', 'CAPA'],
      steps: [
        { t: 'Problem', min: 2, say: ['Rundgänge auf Papier: Werte werden spät ausgewertet, Trends gehen unter.'], do: ['Kachel „Reinraum & Umgebung“ öffnen.'], view: 'Übersicht' },
        { t: 'Rundgang', min: 3, user: 'K. Braun · Produktion', say: ['Messpunkte je Raum mit Grenzwerten.', 'Der Trend zeigt, wenn ein Wert in Richtung Grenze läuft.'], do: ['Tab „Rundgang“, einen Messwert innerhalb der Grenzen erfassen.'], view: 'Rundgang' },
        { t: 'Grenzwert überschritten', min: 3, user: 'K. Braun · Produktion', say: ['Wird ein Grenzwert überschritten, schlägt das System eine Abweichung vor.', 'Sie wird erst nach Bestätigung in COSMO QA angelegt.'], do: ['Messwert über dem Grenzwert erfassen (z. B. Temperatur über 24 °C), Vorschau zeigen.'], view: 'Rundgang' },
        { t: 'Abweichung bewerten', min: 4, user: 'A. Weber · QA', say: ['QA bewertet die Ursache und schließt mit Signatur.', 'Eine zweite Person ist nötig.'], do: ['Auf A. Weber · QA wechseln, Tab „Abweichungen“, „Ursache bewerten“.', 'Dann als Dr. P. Lange · Leitung „Schließen“, PIN 1234.'], view: 'Abweichungen' },
        { t: 'Prüfpfad', min: 2, say: ['Messwert, Abweichung und Entscheidung stehen lückenlos im Prüfpfad.'], do: ['Tab „Prüfpfad & Integration“ zeigen.'], view: 'Prüfpfad & Integration' }
      ],
      qa: [['Werden Sensoren angebunden?', 'Im Mockup nicht; Messwerte werden manuell erfasst. Sensor-Anbindung ist Ausbau.']]
    },

    audit: {
      pitch: 'Auditfähigkeit auf Knopfdruck: Lücken im Nachweispaket sind vor dem Audit sichtbar, Auditoren bekommen zeitlich begrenzten Lesezugriff.',
      terms: ['Audit', 'Audit Trail', 'Benannte Stelle', 'MDSAP', 'MDR', 'ISO 13485', 'E-Signatur', 'Hash-Kette', 'SHA-256', 'DHR', 'BC', 'COSMO QA', 'Anyfy', 'Human in the Loop'],
      steps: [
        { t: 'Problem', min: 2, say: ['Auditvorbereitung ist Suchen und Kopieren aus vielen Systemen.', 'Lücken fallen erst im Audit auf.'], do: ['Kachel „Audit-Readiness“ öffnen.'], view: 'Übersicht' },
        { t: 'Nachweispaket je Charge', min: 3, user: 'A. Weber · QA', say: ['Eine Charge eingeben und sehen, ob alle Nachweise vorhanden sind.', 'Quellen sind BC, COSMO QA und eMBR.'], do: ['Tab „Nachweispaket“, L26-0481 eingeben.'], view: 'Nachweispaket' },
        { t: 'Lücken schließen', min: 3, user: 'A. Weber · QA', say: ['Fehlende Nachweise werden als Aufgabe angefordert.', 'Dass ein Nachweis ergänzt wurde, bestätigt ein zweiter Mensch mit Signatur.'], do: ['Tab „Lücken“, „Nachforderung anlegen“, später „Nachweis ergänzt“, PIN 1234.'], view: 'Lücken' },
        { t: 'Export mit Hash', min: 2, say: ['Das vollständige Paket wird als PDF mit Hash exportiert; Veränderungen sind erkennbar.'], do: ['Charge wählen, bei vollständigem Paket „Paket exportieren“.'], view: 'Nachweispaket' },
        { t: 'Auditmodus', min: 3, say: ['Auditor erhält eine reine Leserolle für die Dauer des Audits.', 'Anschließend wird der Zugriff beendet.'], do: ['Tab „Audittermine“, „Auditmodus aktivieren“, PIN 1234.', 'Zum Test Benutzer J. Auditor wählen: alle Aktionen gesperrt.'], view: 'Audittermine' }
      ],
      qa: [['Dürfen Auditoren wirklich ins System?', 'Das ist eine Option. Der Zugriff ist lesend, zeitlich begrenzt und im Prüfpfad dokumentiert.']]
    },

    sterile: {
      pitch: 'Externe Dienstleister melden Zyklusdaten im Portal, das System prüft gegen die Spezifikation und ein Mensch gibt die Charge frei.',
      terms: ['Sterilisation', 'Lohnfertigung', 'kGy', 'Charge / Lot', 'ISO 13485', 'E-Signatur', 'Vier-Augen-Prinzip', 'COSMO QA', 'BC', 'Anyfy', 'Human in the Loop', 'DHR'],
      steps: [
        { t: 'Problem', min: 2, say: ['Zyklusprotokolle kommen per Mail oder Fax.', 'Die Prüfung und Freigabe sind manuell und langsam.'], do: ['Kachel „Sterilisation & Lohnfertigung“ öffnen.'], view: 'Übersicht' },
        { t: 'Auftrag an Dienstleister', min: 3, user: 'A. Weber · QA', say: ['Auftrag aus Business Central wird an den Dienstleister übergeben.', 'Die Bestellung entsteht erst nach Bestätigung.'], do: ['Tab „Aufträge (Hersteller)“, ST-26-041, „An Dienstleister senden“.'], view: 'Aufträge (Hersteller)' },
        { t: 'Dienstleister-Portal', min: 3, say: ['Der Dienstleister sieht nur seine Aufträge und trägt Zyklus und Dosis ein.', 'Keine Mailkette, keine Medienbrüche.'], do: ['Tab „Dienstleister-Portal (extern)“, ST-26-040, „Zyklusdaten übermitteln“.'], view: 'Dienstleister-Portal (extern)' },
        { t: 'Eingangsprüfung und Freigabe', min: 4, user: 'A. Weber · QA', say: ['Die Dosis wird gegen die Spezifikation geprüft.', 'Freigabe oder Ablehnung entscheidet ein Mensch mit Signatur.'], do: ['Tab „Eingangsprüfung“, ST-26-039, „Prüfen & entscheiden“, PIN 1234.', 'ST-26-038 als Beispiel für eine Ablehnung (Dosis außerhalb der Spezifikation).'], view: 'Eingangsprüfung' },
        { t: 'Prüfpfad', min: 2, say: ['Der Prüfpfad zeigt, welcher Dienstleister wann welche Daten geliefert hat und wer freigegeben hat.'], do: ['Tab „Prüfpfad & Integration“ zeigen.'], view: 'Prüfpfad & Integration' }
      ],
      qa: [['Bekommt der Dienstleister Zugriff auf BC?', 'Nein, nur auf sein eigenes Portal in Anyfy.']]
    }
  }
};
