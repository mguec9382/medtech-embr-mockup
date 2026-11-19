import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import '../js/sha256.js';
import '../js/data.js';
import '../js/store.js';

const E = globalThis.EMBR;

test('sha256 entspricht node:crypto', () => {
  for (const s of ['', 'abc', 'Ä Ö Ü — Medizintechnik', 'x'.repeat(200)]) {
    assert.equal(E.sha256(s), createHash('sha256').update(s).digest('hex'));
  }
});

test('Audit-Hash-Kette erkennt Manipulation', () => {
  E.store.init();
  E.store.reset();
  assert.equal(E.store.verifyChain().ok, true);
  const seq = E.store.tamper();
  const res = E.store.verifyChain();
  assert.equal(res.ok, false);
  assert.equal(res.brokenAt, seq);
});

test('Vier-Augen-Prinzip und Rollenrechte bei Schritt-Signatur', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  const b = s.batch('BR-2026-0481');
  const i = s.activeIndex(b);
  assert.equal(i, 2);

  s.setUser('u1');
  s.setEquipment(b, i, 'EQ-CNC-07');
  assert.match(s.signStep(b, i, 'Ausgeführt').msg, /Wert fehlt/);
  for (const p of s.stepsOf(b)[i].params) s.setValue(b, i, p.id, p.target);
  assert.equal(s.signStep(b, i, 'Ausgeführt').ok, true);
  assert.equal(s.stepState(b, i), 'verify');

  assert.equal(s.signStep(b, i, 'Verifiziert').ok, false);
  s.setUser('u2');
  assert.equal(s.signStep(b, i, 'Verifiziert').ok, true);
  assert.equal(s.activeIndex(b), 3);
});

test('Überfälliges Equipment und gesperrte Chargen werden abgelehnt', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  s.setUser('u1');
  const b = s.batch('BR-2026-0481');
  assert.equal(s.lotIssue('TI-26-097', 'RM-TI64-45') !== null, true);
  assert.equal(s.lotIssue('TI-25-044', 'RM-TI64-45') !== null, true);
  assert.equal(s.lotIssue('TI-26-118', 'RM-TI64-45'), null);
  assert.equal(s.equipmentIssue(s.equipmentById('EQ-ULS-02')) !== null, true);
  assert.ok(b);
});

test('Chargenfreigabe: nur QA, nicht bei offener Abweichung, mit Funktionstrennung', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  const open = s.batch('BR-2026-0480');
  const ready = s.batch('BR-2026-0479');
  assert.equal(s.batchStatus(open), 'Abweichung offen');
  assert.equal(s.batchStatus(ready), 'Review ausstehend');

  s.setUser('u1');
  assert.equal(s.releaseBatch(ready).ok, false);
  s.setUser('u3');
  assert.equal(s.releaseBatch(open).ok, false);
  assert.equal(s.releaseBatch(ready).ok, true);
  assert.equal(s.batchStatus(ready), 'Freigegeben');
  assert.equal(s.verifyChain().ok, true);
});

test('MBR-Freigabe verlangt unterschiedliche Personen und ersetzt Vorversion', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  s.setUser('u5');
  assert.equal(s.mbrTransition('MBR-1042', '4.0', 'Geprüft').ok, true);
  s.setUser('u3');
  assert.equal(s.mbrTransition('MBR-1042', '4.0', 'Freigegeben').ok, true);
  const versions = s.mbr('MBR-1042').versions;
  assert.equal(versions.find((v) => v.v === '4.0').status, 'Wirksam');
  assert.equal(versions.find((v) => v.v === '3.0').status, 'Ersetzt');
});

test('Chargenstart nur mit wirksamer MBR-Version und als Snapshot', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  s.setUser('u1');
  assert.equal(s.startBatch('FA-101242').ok, false);
  const res = s.startBatch('FA-101240');
  assert.equal(res.ok, true);
  const b = s.batch(res.id);
  assert.equal(b.mbrVersion, '3.0');
  assert.equal(s.batchStatus(b), 'In Ausführung');
  assert.equal(s.verifyChain().ok, true);
});

test('Anyfy-Zielmodell deckt die Seed-Daten ab', async () => {
  await import('../js/anyfy.js');
  const seed = E.createSeed();
  for (const [name, c] of Object.entries(E.ANYFY.classes)) {
    const rows = seed[c.seed];
    assert.ok(Array.isArray(rows) && rows.length, `${name}: keine Seed-Daten`);
    for (const p of c.props) assert.ok(p in rows[0], `${name}.${p} fehlt im Seed`);
  }
  const names = new Set(Object.keys(E.ANYFY.classes));
  for (const p of E.ANYFY.pages) assert.ok(p.klass === null || names.has(p.klass), p.route);
});

test('QA-Ergebnis kommt aus BC und erzeugt bei Grenzwertverletzung eine Abweichung', () => {
  E.store.init();
  E.store.reset();
  const s = E.store;
  const b = s.batch('BR-2026-0481');
  const i = 5;
  b.exec.forEach((r, k) => { if (k < i) r.signs.push({ userId: 'u1', user: 'Anna Weber', role: 'operator', meaning: 'Ausgeführt', ts: 'x' }, { userId: 'u2', user: 'Tom Keller', role: 'verifier', meaning: 'Verifiziert', ts: 'x' }); });
  s.setUser('u1');
  assert.equal(s.setValue(b, i, 'ra', '0.5').ok, false);
  const before = s.get().deviations.length;
  const res = s.importQaResult(b, i);
  assert.equal(res.ok, true);
  assert.equal(b.exec[i].values.ra, 0.84);
  assert.equal(s.get().deviations.length, before + 1);
  assert.equal(s.importQaResult(b, i).ok, true);
  assert.equal(s.get().deviations.length, before + 1);
});
