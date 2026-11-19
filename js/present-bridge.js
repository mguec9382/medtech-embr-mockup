/* Brücke zwischen Referentenansicht (2. Bildschirm) und Mockup: markiert das Zielfeld rot und führt Bedienschritte aus. */
(function () {
  const appId = (new URLSearchParams(location.search).get('id')) || (/index\.html$|\/$/.test(location.pathname) ? 'embr' : 'app');
  let ch;
  try { ch = new BroadcastChannel('cc-present'); } catch (e) { return; }

  const norm = (s) => (s || '').replace(/\s+/g, ' ').replace(/[✎×]/g, '').trim().toLowerCase();
  const vis = (el) => el && el.getClientRects().length > 0;
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)].filter(vis);
  const scope = () => document.querySelector('dialog[open]') || document;
  const byText = (els, text, exact) => els.find((e) => (exact ? norm(e.textContent) === norm(text) : norm(e.textContent).includes(norm(text))));

  function rowEl(spec) {
    const parts = spec.split('|').map(norm);
    return $$('tr[data-row]').find((tr) => { const t = norm(tr.textContent); return parts.every((p) => t.includes(p)); });
  }

  function fieldEl(a) {
    const sc = scope();
    const lab = $$('label', sc).find((l) => norm(l.firstChild ? l.firstChild.textContent : l.textContent).includes(norm(a.field)) || norm(l.textContent).startsWith(norm(a.field)));
    return lab ? lab.querySelector('input,select') : null;
  }

  function resolve(a) {
    if (!a) return null;
    if (a.user) return document.querySelector('#user-sel') || document.querySelector('#user-select');
    if (a.tab) return byText($$('.tabs button'), a.tab);
    if (a.pill) return byText($$('.pill'), a.pill, true);
    if (a.sample) return $$('.pill[data-q]').find((p) => norm(p.dataset.q) === norm(a.sample));
    if (a.nav) return byText($$('#nav-list a'), a.nav);
    if (a.row && !a.btn) return rowEl(a.row);
    if (a.btn) {
      if (a.row) { const tr = rowEl(a.row); return tr ? byText($$('button', tr), a.btn) : null; }
      return byText($$('button', scope()), a.btn) || byText($$('button', document.querySelector('main, #app') || document), a.btn);
    }
    if (a.lookup) return document.querySelector('#lk');
    if (a.go) return document.querySelector('[data-go]');
    if (a.sel) { const l = $$('label').find((x) => norm(x.textContent).startsWith(norm(a.sel))); return l && l.querySelector('select'); }
    if (a.field) return fieldEl(a);
    if (a.pin) return document.querySelector('#sign-pw');
    if (a.ok) return document.querySelector('#sign-ok');
    if (a.submit) return document.querySelector('#form button[type=submit]');
    if (a.bell) return document.querySelector('#bell');
    if (a.notif) return $$('#notif .nitem')[0];
    if (a.id) return document.querySelector(a.id);
    return null;
  }

  function setValue(el, val) {
    if (el.tagName === 'SELECT') {
      const o = [...el.options].find((x) => norm(x.textContent).includes(norm(val)) || norm(x.value) === norm(val));
      if (!o) return false;
      el.value = o.value;
    } else {
      const proto = Object.getPrototypeOf(el);
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val);
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function perform(a) {
    if (a.tab || a.nav || a.user) { const c = document.querySelector('dialog[open] [data-close]'); if (c) c.click(); }
    const el = resolve(a);
    if (!el) return false;
    if (a.user) return setValue(el, a.user);
    if (a.lookup) { setValue(el, a.lookup); const g = document.querySelector('[data-go]'); if (g) g.click(); return true; }
    if (a.sel || a.field) {
      if (a.value === undefined || a.value === '') { if (el.tagName === 'SELECT') { el.selectedIndex = Math.max(0, el.selectedIndex); return true; } return true; }
      return setValue(el, String(a.value));
    }
    if (a.pin) return setValue(el, a.pin === true ? '1234' : a.pin);
    el.click();
    return true;
  }

  let cur = null, ring = null;
  function clear() { document.querySelectorAll('.pres-hl').forEach((e) => e.classList.remove('pres-hl')); ring = null; }
  function mark() {
    clear();
    if (!cur) return report();
    const el = resolve(cur);
    if (el) {
      el.classList.add('pres-hl');
      if (ring !== el) { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* ignorieren */ } }
      ring = el;
    }
    report(!!el);
  }
  function report(found) { ch.postMessage({ app: appId, t: 'state', found: found === undefined ? null : found }); }

  let timer = null;
  const later = () => { clearTimeout(timer); timer = setTimeout(mark, 120); };
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden'] });

  // Sperre: solange die Referentenansicht Herzschläge sendet, sind echte Benutzereingaben blockiert.
  let locked = false, beat = 0;
  const banner = document.createElement('div');
  banner.id = 'pres-lock';
  banner.hidden = true;
  banner.innerHTML = '<span class="grip" title="Verschieben">⠿ Gesteuert über die Referentenansicht</span><button type="button" aria-label="Hinweis ausblenden">×</button>';
  document.body.appendChild(banner);
  let dismissed = false;
  try { const pos = JSON.parse(localStorage.getItem('pres-lock-pos')); if (pos) { banner.style.left = pos.x + 'px'; banner.style.top = pos.y + 'px'; banner.style.bottom = 'auto'; } } catch (e) { /* Standardposition */ }
  banner.querySelector('button').addEventListener('click', () => { dismissed = true; banner.hidden = true; });
  banner.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = banner.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    banner.setPointerCapture(e.pointerId);
    const mv = (m) => {
      const x = Math.max(0, Math.min(innerWidth - r.width, m.clientX - dx)), y = Math.max(0, Math.min(innerHeight - r.height, m.clientY - dy));
      banner.style.left = x + 'px'; banner.style.top = y + 'px'; banner.style.bottom = 'auto';
    };
    const up = () => {
      banner.removeEventListener('pointermove', mv); banner.removeEventListener('pointerup', up);
      try { localStorage.setItem('pres-lock-pos', JSON.stringify({ x: parseInt(banner.style.left, 10), y: parseInt(banner.style.top, 10) })); } catch (e) { /* ignorieren */ }
    };
    banner.addEventListener('pointermove', mv); banner.addEventListener('pointerup', up);
  });
  const setLock = (on) => { locked = on; banner.hidden = !on || dismissed; document.documentElement.classList.toggle('pres-locked', on); };
  ['click', 'dblclick', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'keydown', 'keyup', 'keypress', 'input', 'change', 'contextmenu', 'touchstart']
    .forEach((n) => addEventListener(n, (e) => {
      if (!locked || !e.isTrusted || (e.target.closest && e.target.closest('#pres-lock'))) return;
      e.stopImmediatePropagation();
      if (e.cancelable) e.preventDefault();
    }, true));
  setInterval(() => { if (locked && Date.now() - beat > 5000) setLock(false); }, 1000);

  ch.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.t === 'lock') { beat = Date.now(); setLock(!!m.on); return; }
    if (m.t === 'ping') { ch.postMessage({ app: appId, t: 'ready' }); return; }
    if (m.app && m.app !== appId) return;
    if (m.t === 'hl') { cur = m.act || null; mark(); }
    else if (m.t === 'clear') { cur = null; clear(); }
    else if (m.t === 'do') {
      const ok = perform(m.act);
      const finish = (tries) => {
        const open = m.act && m.act.ok && document.querySelector('#sign-dlg[open]');
        if (open && tries > 0) return setTimeout(() => finish(tries - 1), 150);
        ch.postMessage({ app: appId, t: 'done', ok: ok && !open, n: m.n });
        mark();
      };
      setTimeout(() => finish(10), 250);
    } else if (m.t === 'reset') {
      const b = document.querySelector('#reset, #reset-btn');
      if (b) b.click();
      ch.postMessage({ app: appId, t: 'done', ok: !!b, n: -1 });
    }
  };
  addEventListener('load', () => ch.postMessage({ app: appId, t: 'ready' }));
})();
