(function (root) {
  const E = (root.EMBR = root.EMBR || {});

  // Zielmodell für COSMO Anyfy: Ontologie-Klassen (Meta Service), Functions und Type-Mappings (Data Service),
  // Pages (App). Entwurf, vor Umsetzung gegen die Plattform (@cpb/cli, Playground) zu bestätigen.
  // Präfix "Embr" vermeidet Kollisionen mit anderen Apps der Plattform.
  E.ANYFY = {
    app: 'embr-companion',
    classes: {
      EmbrUser: { seed: 'users', props: ['id', 'name', 'role', 'roleLabel'], note: 'Spiegel der Anyfy-Identität (Auth Service), Rollen als Berechtigungsgruppen' },
      EmbrEquipment: { seed: 'equipment', props: ['id', 'cls', 'name', 'calDue', 'qualified'], mapping: 'BC Fixed Asset / Work Center' },
      EmbrMbr: { seed: 'mbrs', props: ['id', 'title', 'product', 'cls', 'udiDi', 'steps', 'versions'], mapping: 'BC Production BOM / Routing' },
      EmbrBatchRecord: { seed: 'batches', props: ['id', 'mbrId', 'mbrVersion', 'bcOrder', 'lot', 'qty', 'startedAt', 'exec'], mapping: 'BC Production Order' },
      EmbrDeviation: { seed: 'deviations', props: ['id', 'batchId', 'stepNo', 'severity', 'status', 'description', 'action'] },
      EmbrOutboxMessage: { seed: 'outbox', props: ['id', 'type', 'target', 'status', 'key'], note: 'Idempotenzschlüssel `key` je BC-Buchung' },
      EmbrAuditEntry: { seed: 'auditSeed', props: ['ts', 'userId', 'action', 'entity', 'detail'], note: 'Append-only, kein Update/Delete über die API; hash/prevHash werden serverseitig gesetzt' },
    },
    functions: [
      { name: 'embr.mbr.transition', kind: 'CP Function', does: 'Versionsübergang Entwurf → Prüfung → Freigabe → Wirksam, je Person nur eine Signatur', perm: 'author | review | approve' },
      { name: 'embr.batch.createFromOrder', kind: 'CP Function', does: 'Batch Record aus BC-Fertigungsauftrag und wirksamer MBR-Version erzeugen', perm: 'execute' },
      { name: 'embr.step.execute', kind: 'CP Function', does: 'Material-, Equipment- und Grenzwertprüfung, Abweichungspflicht, Signatur Ausführung', perm: 'execute' },
      { name: 'embr.step.verify', kind: 'CP Function', does: 'Vier-Augen: Verifizierer ≠ Ausführender', perm: 'verify' },
      { name: 'embr.deviation.close', kind: 'CP Function', does: 'QA-Bewertung und Schließen, hebt Chargensperre auf', perm: 'deviation.close' },
      { name: 'embr.batch.release', kind: 'CP Function', does: 'Review by Exception, QA-Freigabe, DHR-Hash, Outbox-Eintrag Qualitätsstatus', perm: 'release' },
      { name: 'embr.audit.verifyChain', kind: 'CP Function', does: 'Hash-Kette prüfen', perm: 'lesend' },
      { name: 'embr.outbox.dispatch', kind: 'Trigger/Job', does: 'Outbox an BC senden, Retry mit Idempotenzschlüssel', perm: 'Service' },
    ],
    typeMappings: [
      { name: 'BC Production Order → EmbrBatchRecord', direction: 'lesend', via: 'Anyfy Core Interface (BC Web Service)' },
      { name: 'BC Item Tracking → Los (Status, Verfall)', direction: 'lesend', via: 'Anyfy Core Interface' },
      { name: 'EmbrOutboxMessage → BC Journal / Item Tracking', direction: 'schreibend', via: 'Anyfy Core Interface, OAuth 2.0 Client Credentials' },
    ],
    pages: [
      { route: '#/mbr', klass: 'EmbrMbr', template: 'Liste + Einzelelement' },
      { route: '#/batches', klass: 'EmbrBatchRecord', template: 'Liste + Einzelelement, Extension Bundle für Schrittausführung' },
      { route: '#/release', klass: 'EmbrBatchRecord', template: 'Liste mit Filter „Review by Exception“' },
      { route: '#/deviations', klass: 'EmbrDeviation', template: 'Liste + Einzelelement' },
      { route: '#/audit', klass: 'EmbrAuditEntry', template: 'Nur-Lese-Liste' },
      { route: '#/trace', klass: 'EmbrBatchRecord', template: 'Extension Bundle (Vorwärts-/Rückwärtsverfolgung)' },
      { route: '#/system', klass: null, template: 'Extension Bundle' },
    ],
    // Reihenfolge für den Wechsel von localStorage auf Anyfy.
    migration: [
      'Projekt mit @cpb/cli initialisieren (Node ≥ 24.11, .npmrc für den privaten NPM-Feed)',
      'Ontologie-Klassen aus ANYFY.classes im Playground anlegen',
      'Domänenlogik aus store.js als TypeScript-Functions portieren, Tests aus tests/ wiederverwenden',
      'Type-Mappings zu BC über das Anyfy Core Interface',
      'Ansichten als React/Fluent-UI-Extension-Bundles oder Standard-Pages aufbauen',
      'Audit Trail und E-Signatur gegen Plattform-Fähigkeiten klären und validieren (CSV)',
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
