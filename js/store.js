(function (root) {
  const E = (root.EMBR = root.EMBR || {});
  const KEY = 'embr-mock-v1';
  let state = null;

  function storage() {
    try { return root.localStorage || null; } catch (e) { return null; }
  }

  function hashOf(rec) {
    return E.sha256([rec.prevHash, rec.seq, rec.ts, rec.user, rec.role, rec.action, rec.entity, rec.detail].join('|'));
  }

  function pushAudit(s, ev) {
    const prev = s.audit.length ? s.audit[s.audit.length - 1].hash : 'GENESIS';
    const u = s.users.find((x) => x.id === ev.userId);
    const rec = {
      seq: s.audit.length + 1,
      ts: ev.ts,
      user: u ? u.name : 'System',
      role: u ? u.role : 'system',
      action: ev.action,
      entity: ev.entity,
      detail: ev.detail,
      prevHash: prev,
    };
    rec.hash = hashOf(rec);
    s.audit.push(rec);
  }

  function recordHash(s, b) {
    const copy = { ...b, release: null };
    const devs = s.deviations.filter((d) => d.batchId === b.id);
    return E.sha256(JSON.stringify({ batch: copy, deviations: devs }));
  }

  function build() {
    const s = E.createSeed();
    s.audit = [];
    s.auditSeed.forEach((ev) => pushAudit(s, ev));
    delete s.auditSeed;
    s.batches.forEach((b) => { if (b.release) b.release.hash = recordHash(s, b); });
    return s;
  }

  function init() {
    const st = storage();
    const raw = st && st.getItem(KEY);
    state = null;
    if (raw) {
      try {
        state = JSON.parse(raw);
        if (state.version !== E.SEED_VERSION) state = null;
      } catch (e) { state = null; }
    }
    if (!state) state = build();
    return state;
  }

  function save() {
    const st = storage();
    if (st) st.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    const user = state ? state.userId : 'u1';
    state = build();
    state.userId = user;
    save();
  }

  const get = () => state;
  const user = () => state.users.find((u) => u.id === state.userId);
  const userById = (id) => state.users.find((u) => u.id === id);
  const can = (perm, u) => (E.PERMS[(u || user()).role] || []).includes(perm);
  function setUser(id) { state.userId = id; save(); }

  function audit(action, entity, detail) {
    pushAudit(state, { ts: new Date().toISOString(), userId: state.userId, action, entity, detail });
  }

  function verifyChain() {
    let prev = 'GENESIS';
    for (let i = 0; i < state.audit.length; i++) {
      const rec = state.audit[i];
      if (rec.seq !== i + 1 || rec.prevHash !== prev || rec.hash !== hashOf(rec)) {
        return { ok: false, brokenAt: rec.seq, count: state.audit.length };
      }
      prev = rec.hash;
    }
    return { ok: true, brokenAt: null, count: state.audit.length };
  }

  function tamper() {
    const rec = state.audit[Math.min(5, state.audit.length - 1)];
    if (!rec.detail.endsWith(' [nachträglich geändert]')) rec.detail += ' [nachträglich geändert]';
    save();
    return rec.seq;
  }

  // ----- Abfragen -----
  const mbr = (id) => state.mbrs.find((m) => m.id === id);
  const batch = (id) => state.batches.find((b) => b.id === id);
  const deviation = (id) => state.deviations.find((d) => d.id === id);
  const equipmentById = (id) => state.equipment.find((e) => e.id === id);
  const stepsOf = (b) => mbr(b.mbrId).steps;
  const devsOf = (b) => state.deviations.filter((d) => d.batchId === b.id);
  const needs = (st) => (st.verify ? ['Ausgeführt', 'Verifiziert'] : ['Ausgeführt']);
  const hasSign = (rec, meaning) => rec.signs.some((s) => s.meaning === meaning);
  const stepDone = (b, i) => needs(stepsOf(b)[i]).every((m) => hasSign(b.exec[i], m));

  function activeIndex(b) {
    const n = stepsOf(b).length;
    for (let i = 0; i < n; i++) if (!stepDone(b, i)) return i;
    return -1;
  }

  function stepState(b, i) {
    if (stepDone(b, i)) return 'done';
    if (i !== activeIndex(b)) return 'pending';
    return hasSign(b.exec[i], 'Ausgeführt') ? 'verify' : 'active';
  }

  function batchStatus(b) {
    if (b.release) return 'Freigegeben';
    if (devsOf(b).some((d) => d.status !== 'Geschlossen')) return 'Abweichung offen';
    if (activeIndex(b) === -1) return 'Review ausstehend';
    return 'In Ausführung';
  }

  function paramState(p, value) {
    if (value === undefined || value === null || value === '' || Number.isNaN(Number(value))) return 'empty';
    const v = Number(value);
    return v >= p.min && v <= p.max ? 'ok' : 'oob';
  }

  function equipmentIssue(eq) {
    if (!eq) return 'Equipment unbekannt';
    if (!eq.qualified) return `${eq.id} ist nicht qualifiziert`;
    if (eq.calDue < E.MOCK_TODAY) return `${eq.id}: Kalibrierung seit ${eq.calDue} überfällig`;
    return null;
  }

  function lotIssue(code, item) {
    const lot = E.LOTS[code];
    if (!lot) return `Los ${code} ist in Business Central unbekannt`;
    if (lot.item !== item) return `Los ${code} gehört zu ${lot.item}, erwartet ${item}`;
    if (lot.status !== 'Freigegeben') return `Los ${code} ist ${lot.status} (${lot.cert})`;
    if (lot.expiry < E.MOCK_TODAY) return `Los ${code} ist seit ${lot.expiry} abgelaufen`;
    return null;
  }

  function stepBlockers(b, i) {
    const st = stepsOf(b)[i];
    const r = b.exec[i];
    const out = [];
    if (st.checks && r.checks.filter(Boolean).length < st.checks.length) out.push('Nicht alle Prüfpunkte bestätigt');
    if (st.type === 'material' && !r.lot) out.push('Materialcharge nicht gescannt');
    if (st.equipmentClass && !r.equipment) out.push('Equipment nicht gewählt');
    (st.params || []).forEach((p) => {
      const s = paramState(p, r.values[p.id]);
      const hasDev = state.deviations.some((d) => r.deviations.includes(d.id) && d.paramId === p.id);
      if (s === 'empty') out.push(`${p.name}: Wert fehlt`);
      if (s === 'oob' && !hasDev) out.push(`${p.name}: Grenzwert verletzt, Abweichung anlegen`);
    });
    return out;
  }

  function signers(b) {
    const ids = new Set();
    b.exec.forEach((r) => r.signs.forEach((s) => ids.add(s.userId)));
    return ids;
  }

  // ----- Outbox (BC-Integration, simuliert) -----
  function queue(type, target, detail, key) {
    const n = 1003 + state.outbox.length;
    state.outbox.unshift({ id: `OB-${n}`, type, target, status: 'Gesendet', key, ts: new Date().toISOString(), detail });
  }

  const fail = (msg) => ({ ok: false, msg });
  const ok = (msg) => ({ ok: true, msg: msg || '' });

  // ----- Ausführung -----
  function activeEditable(b, i) {
    if (!can('execute')) return 'Rolle darf keine Schritte ausführen';
    if (stepState(b, i) !== 'active') return 'Schritt ist nicht aktiv';
    return null;
  }

  function setCheck(b, i, idx, value) {
    const err = activeEditable(b, i);
    if (err) return fail(err);
    b.exec[i].checks[idx] = !!value;
    audit('Prüfpunkt bestätigt', `${b.id} · Schritt ${i + 1}`, `${stepsOf(b)[i].checks[idx]}: ${value ? 'ja' : 'zurückgenommen'}`);
    save();
    return ok();
  }

  function scanLot(b, i, code) {
    const err = activeEditable(b, i);
    if (err) return fail(err);
    const st = stepsOf(b)[i];
    const issue = lotIssue(code.trim(), st.item);
    if (issue) {
      audit('Scan abgelehnt', `${b.id} · Schritt ${i + 1}`, issue);
      save();
      return fail(issue);
    }
    b.exec[i].lot = code.trim();
    audit('Material gescannt', `${b.id} · Schritt ${i + 1}`, `Los ${code.trim()} gegen BC geprüft: freigegeben`);
    save();
    return ok(`Los ${code.trim()} akzeptiert`);
  }

  function setEquipment(b, i, id) {
    const err = activeEditable(b, i);
    if (err) return fail(err);
    const issue = equipmentIssue(equipmentById(id));
    if (issue) {
      audit('Equipment abgelehnt', `${b.id} · Schritt ${i + 1}`, issue);
      save();
      return fail(issue);
    }
    b.exec[i].equipment = id;
    audit('Equipment gewählt', `${b.id} · Schritt ${i + 1}`, `${id} (Kalibrierung gültig bis ${equipmentById(id).calDue})`);
    save();
    return ok();
  }

  function setValue(b, i, paramId, raw) {
    const err = activeEditable(b, i);
    if (err) return fail(err);
    const p = stepsOf(b)[i].params.find((x) => x.id === paramId);
    const text = String(raw).replace(',', '.').trim();
    if (text === '' || Number.isNaN(Number(text))) return fail('Bitte eine Zahl eingeben');
    const v = Number(text);
    b.exec[i].values[paramId] = v;
    const s = paramState(p, v);
    audit(s === 'ok' ? 'Messwert erfasst' : 'Messwert außerhalb Grenzwert', `${b.id} · Schritt ${i + 1}`, `${p.name} = ${v} ${p.unit} (Grenzen ${p.min}–${p.max})`);
    save();
    return ok(s === 'ok' ? '' : 'Grenzwert verletzt, Abweichung erforderlich');
  }

  function nextDevId() {
    const max = state.deviations.reduce((m, d) => Math.max(m, Number(d.id.slice(4))), 0);
    return `DEV-${String(max + 1).padStart(4, '0')}`;
  }

  function createDeviation(b, i, paramId, form) {
    if (!can('deviation.create')) return fail('Rolle darf keine Abweichungen anlegen');
    const st = stepsOf(b)[i];
    const p = (st.params || []).find((x) => x.id === paramId);
    const value = b.exec[i].values[paramId];
    const d = {
      id: nextDevId(), batchId: b.id, stepNo: st.no, paramId, value, severity: form.severity, status: 'Offen',
      description: form.description || `${p.name} ${value} ${p.unit} außerhalb ${p.min}–${p.max}`, action: form.action || '',
      createdBy: user().name, createdAt: new Date().toISOString(),
    };
    state.deviations.push(d);
    b.exec[i].deviations.push(d.id);
    audit('Abweichung angelegt', d.id, `${b.id}, Schritt ${st.no}: ${p.name} ${value} ${p.unit} (${d.severity})`);
    queue('Qualitätsstatus', `BC Item Tracking Los ${b.lot}`, 'Sperre bis Abweichungsbewertung', `hold:${b.id}`);
    save();
    return ok(`${d.id} angelegt, Charge gesperrt`);
  }

  function signStep(b, i, meaning) {
    const st = stepsOf(b)[i];
    const r = b.exec[i];
    const state_ = stepState(b, i);
    const u = user();
    if (meaning === 'Ausgeführt') {
      if (!can('execute')) return fail('Rolle darf keine Schritte ausführen');
      if (state_ !== 'active') return fail('Schritt ist nicht aktiv');
      const blockers = stepBlockers(b, i);
      if (blockers.length) return fail(blockers[0]);
    } else {
      if (!can('verify')) return fail('Rolle darf nicht verifizieren');
      if (state_ !== 'verify') return fail('Keine Verifizierung ausstehend');
      const executor = r.signs.find((s) => s.meaning === 'Ausgeführt');
      if (executor && executor.userId === u.id) return fail('Vier-Augen-Prinzip: Ausführender darf nicht selbst verifizieren');
    }
    r.signs.push({ userId: u.id, user: u.name, role: u.role, meaning, ts: new Date().toISOString() });
    audit('Signatur', `${b.id} · Schritt ${i + 1}`, meaning === 'Ausgeführt' ? 'Ausgeführt' : 'Verifiziert (Vier-Augen)');
    if (meaning === 'Ausgeführt' && st.type === 'material') {
      queue('Verbrauchsbuchung', `BC Prod. Order Component ${b.bcOrder}`, `${st.item}, Los ${r.lot}`, `consume:${b.id}:${i + 1}`);
    }
    if (activeIndex(b) === -1 && stepDone(b, i)) {
      queue('Ausstoßbuchung', `BC Output Journal ${b.bcOrder}`, `${b.qty} Stk`, `output:${b.id}`);
    }
    save();
    return ok();
  }

  function closeDeviation(id, disposition) {
    if (!can('deviation.close')) return fail('Nur QA darf Abweichungen schließen');
    const d = deviation(id);
    d.status = 'Geschlossen';
    d.disposition = disposition;
    d.closedBy = user().name;
    d.closedAt = new Date().toISOString();
    audit('Abweichung geschlossen', id, disposition);
    save();
    return ok();
  }

  function releaseBatch(b) {
    if (!can('release')) return fail('Nur QA darf Chargen freigeben');
    if (batchStatus(b) !== 'Review ausstehend') return fail('Charge ist nicht freigabebereit');
    if (signers(b).has(state.userId)) return fail('Funktionstrennung: Freigebender war an der Fertigung beteiligt');
    const u = user();
    b.release = { userId: u.id, user: u.name, ts: new Date().toISOString(), hash: null };
    b.release.hash = recordHash(state, b);
    audit('Charge freigegeben', b.id, `QA-Freigabe, Dokument-Hash ${b.release.hash.slice(0, 12)}…`);
    queue('Qualitätsstatus', `BC Item Tracking Los ${b.lot}`, 'Freigegeben', `release:${b.id}`);
    save();
    return ok();
  }

  function startBatch(orderNo) {
    if (!can('execute')) return fail('Rolle darf keine Chargen starten');
    const order = E.BC_ORDERS.find((o) => o.no === orderNo);
    const m = mbr(order.mbrId);
    const v = m.versions.find((x) => x.status === 'Wirksam');
    if (!v) return fail(`${m.id} hat keine wirksame Version, Start nicht zulässig`);
    const b = {
      id: `BR-2026-${String(state.batches.reduce((mx, x) => Math.max(mx, Number(x.id.slice(-4))), 0) + 1).padStart(4, '0')}`,
      mbrId: m.id, mbrVersion: v.v, bcOrder: order.no, lot: order.lot, qty: order.qty, startedAt: new Date().toISOString(),
      exec: m.steps.map((st) => ({ checks: (st.checks || []).map(() => false), lot: null, equipment: null, values: {}, signs: [], deviations: [] })),
      release: null,
    };
    state.batches.unshift(b);
    audit('Charge gestartet', b.id, `${order.no} aus BC gelesen, MBR ${m.id} v${v.v} als Snapshot eingefroren`);
    save();
    return { ok: true, msg: `${b.id} gestartet`, id: b.id };
  }

  function retryOutbox(id) {
    const m = state.outbox.find((x) => x.id === id);
    m.status = 'Gesendet';
    m.detail += ' (Wiederholung erfolgreich, gleicher Idempotenzschlüssel)';
    audit('BC-Nachricht wiederholt', id, m.key);
    save();
  }

  // ----- MBR-Lebenszyklus -----
  const FLOW = {
    Eingereicht: { from: 'Entwurf', to: 'In Prüfung', perm: 'author' },
    Geprüft: { from: 'In Prüfung', to: 'Freigabe ausstehend', perm: 'review' },
    Freigegeben: { from: 'Freigabe ausstehend', to: 'Wirksam', perm: 'approve' },
  };

  function mbrTransition(mid, ver, meaning) {
    const m = mbr(mid);
    const v = m.versions.find((x) => x.v === ver);
    const rule = FLOW[meaning];
    const u = user();
    if (!rule || v.status !== rule.from) return fail('Übergang aus aktuellem Status nicht erlaubt');
    if (!can(rule.perm)) return fail('Rolle darf diese Signatur nicht leisten');
    if (v.signs.some((s) => s.userId === u.id)) return fail('Funktionstrennung: Person hat diese Version bereits signiert');
    v.signs.push({ user: u.name, userId: u.id, meaning, ts: new Date().toISOString() });
    v.status = rule.to;
    if (rule.to === 'Wirksam') {
      m.versions.forEach((x) => { if (x !== v && x.status === 'Wirksam') x.status = 'Ersetzt'; });
      v.effective = E.MOCK_TODAY;
    }
    audit(`MBR ${meaning.toLowerCase()}`, `${mid} v${ver}`, `Status: ${rule.to}`);
    save();
    return ok();
  }

  E.store = {
    init, get, save, reset, user, userById, can, setUser, audit, verifyChain, tamper,
    mbr, batch, deviation, equipmentById, stepsOf, devsOf, hasSign, stepDone, activeIndex, stepState, batchStatus,
    paramState, equipmentIssue, lotIssue, stepBlockers, signers, recordHash: (b) => recordHash(state, b),
    setCheck, scanLot, setEquipment, setValue, createDeviation, signStep, closeDeviation, releaseBatch, retryOutbox, mbrTransition, startBatch,
  };
})(typeof window !== 'undefined' ? window : globalThis);
