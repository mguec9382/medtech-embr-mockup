# eMBR / eDHR Companion App · Mockup

Klickbares Mockup einer Master-Batch-Record-App für die Medizintechnik als Companion App in COSMO Anyfy. Es veranschaulicht das Konzept (Rollen, Funktionstrennung, Audit Trail, BC-Integration, DHR) und ist **keine validierte Software**. Alle Daten sind fiktiv.

## Starten

```bash
npm start          # http://localhost:4173
npm test           # Tests der Kernlogik (Node 20+)
```

`index.html` funktioniert auch direkt per Doppelklick (kein Build, keine Abhängigkeiten).

## Demo-Ablauf

1. **Anna Weber (Fertigung)**: `Batch Records` → `BR-2026-0481` → Equipment wählen, Messwerte erfassen (z. B. Gewinde-Außendurchmesser `4,54` löst eine Abweichung aus) → Ausführung signieren.
2. **Tom Keller (Schichtleiter)**: denselben Schritt verifizieren (Vier-Augen). Anna selbst darf nicht verifizieren.
3. **Dr. Lena Roth (QA)**: `QA-Freigabe` → `BR-2026-0479` freigeben, `Abweichungen` bewerten und schließen.
4. **Marc Behrens / Sabine Frank / Dr. Lena Roth**: `Vorlagen (MBR)` → `MBR-1042 v4.0` einreichen, prüfen, freigeben (jede Person darf nur einmal signieren).
5. `Audit Trail`: Kette prüfen, Manipulation simulieren, erneut prüfen.
6. `Rückverfolgung`: Los `TI-26-118` suchen (Rückruf-Szenario), `System`: BC-Outbox und Anforderungsabdeckung.

Testdaten: Chargen `TI-26-118` (frei), `TI-26-097` (gesperrt), `TI-25-044` (abgelaufen). Equipment `EQ-ULS-02` hat überfällige Kalibrierung. Der Stichtag ist fest auf `2026-11-19` gesetzt.

Qualitätsprüfungen (Endkontrolle) und UDI-Daten liegen in Business Central (COSMO QA, COSMO UDI). Das eMBR übernimmt das QA-Ergebnis nur (`Prüfergebnis aus BC abrufen`, z. B. `BR-2026-0481` Schritt 6: Ra 0,84 µm löst automatisch eine Abweichung aus) und zeigt UDI-DI/PI schreibgeschützt an.

## Was das Mockup zeigt

| Bereich | Konzept |
| --- | --- |
| Vorlagen (MBR) | Versionierter Lebenszyklus Entwurf → Prüfung → Freigabe → Wirksam, Signaturen, Änderungsvergleich |
| Batch Records | Strikte Schrittfolge, Material-Scan gegen BC, Equipment-Sperre, Grenzwertprüfung, Vier-Augen |
| Abweichungen | Pflicht bei Grenzwertverletzung, Chargensperre, QA-Bewertung |
| QA-Freigabe | Review by Exception, automatische Prüfungen, Funktionstrennung |
| DHR | Druckansicht, SHA-256 über den Record, Integritätsprüfung |
| Audit Trail | Hash-verkettet, Manipulationserkennung, JSON-Export |
| Rückverfolgung | Vorwärts/Rückwärts bis zum Kunden |
| System | Zielarchitektur, simulierte BC-Outbox mit Idempotenzschlüssel, Anforderungsmatrix, Validierungsplan |

## Aufbau

```
index.html          Shell (Header, Navigation, Skripte)
css/                CI-Variablen und Styles, Quicksand
js/sha256.js        Synchrones SHA-256 (Hash-Kette, DHR-Hash)
js/data.js          Fiktive Seed-Daten, Rollen, Compliance-Matrix
js/anyfy.js         Anyfy-Zielmodell (Ontologie-Klassen, Functions, Type-Mappings, Pages), Ansicht System
js/store.js         Domänenlogik, Rollen/SoD, Audit-Kette, Outbox (localStorage)
js/ui.js            DOM-Helfer ohne innerHTML, Dialoge, Toasts
js/views-*.js       Ansichten
js/app.js           Hash-Router
tests/              Tests der Kernlogik
```

## Grenzen und offene Punkte

- Passwort bei der Signatur wird nur simuliert. Echte Re-Authentifizierung, Audit Trail und E-Signatur müssen gegen die Anyfy-Plattform geklärt werden (siehe Ansicht `System`, Status „Anyfy klären“).
- Regulatorische Zuordnung ist ein Entwurf und ist mit RA/QA zu bestätigen.
- Kein Offline-Betrieb, keine echte BC-/Anyfy-Anbindung, kein Archiv.

## Companion-Portal

`portal.html` zeigt im Stil des COSMO-Vertriebsportals Kacheln für MedTech-Companion-Apps (Anyfy + Business Central + COSMO-Branchenprodukte). Nur eMBR/eDHR ist als Mockup verfügbar, die übrigen Kacheln sind Konzepte; Produkt- und Normzuordnung ist ein Entwurf (`js/portal.js`).
