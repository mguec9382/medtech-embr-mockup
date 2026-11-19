(function (root) {
  const E = (root.EMBR = root.EMBR || {});

  function append(node, kids) {
    for (const c of kids.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
  }

  // Alle Inhalte werden als Textknoten gesetzt, nie als HTML.
  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
    append(node, kids);
    return node;
  }

  const ICONS = {
    dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
    mbr: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',
    batch: 'M4 6h16M4 12h16M4 18h10M18 17l2 2 3-4',
    deviation: 'M12 3l10 18H2zM12 10v5M12 18v.5',
    release: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8.5 12l2.5 2.5 4.5-5',
    trace: 'M5 5h4v4H5zM15 15h4v4h-4zM15 5h4v4h-4zM9 7h6M17 9v6M7 9v6a2 2 0 0 0 2 2h6',
    audit: 'M12 8v5l3 2M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
    system: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
    sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.6 4.6M19.4 19.4L18 18M6 18l-1.4 1.4M19.4 4.6L18 6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
    print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z',
    lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  };

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'i');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', ICONS[name] || ICONS.system);
    svg.append(p);
    return svg;
  }

  const KIND = {
    Wirksam: 'ok', Freigegeben: 'ok', Geschlossen: 'ok', Gesendet: 'ok', done: 'ok',
    'In Prüfung': 'warn', 'Freigabe ausstehend': 'warn', 'Review ausstehend': 'warn', 'In Ausführung': 'info', Offen: 'bad',
    'Abweichung offen': 'bad', Fehler: 'bad', Gesperrt: 'bad', Major: 'bad', Minor: 'warn',
    Entwurf: '', Ersetzt: '',
  };
  const badge = (text, kind) => el('span', { class: `badge ${kind !== undefined ? kind : KIND[text] || ''}` }, text);

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '—');
  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');

  function toast(msg, kind) {
    let box = document.querySelector('.toasts');
    if (!box) {
      box = el('div', { class: 'toasts cc-no-print', role: 'status', 'aria-live': 'polite' });
      document.body.append(box);
    }
    const t = el('div', { class: `toast ${kind || ''}` }, msg);
    box.append(t);
    setTimeout(() => t.remove(), 4500);
  }

  // Generischer Dialog. Mit sign=true entsteht ein Signatur-Dialog mit Re-Authentifizierung (Passwort wird nur simuliert).
  function dialog({ title, intro, fields, sign, submit, meaning }) {
    return new Promise((resolve) => {
      const dlg = el('dialog', { 'aria-labelledby': 'dlg-title' });
      const err = el('p', { class: 'notice bad', hidden: true, role: 'alert' });
      const inputs = {};
      const form = el('form', { method: 'dialog' });
      form.append(el('h2', { id: 'dlg-title' }, title));
      if (intro) form.append(el('p', { class: 'muted' }, intro));
      (fields || []).forEach((f) => {
        let input;
        if (f.type === 'select') input = el('select', { name: f.name }, f.options.map((o) => el('option', { value: o }, o)));
        else if (f.type === 'textarea') input = el('textarea', { name: f.name, rows: 3 });
        else input = el('input', { type: 'text', name: f.name });
        if (f.value) input.value = f.value;
        inputs[f.name] = input;
        form.append(el('label', { class: 'field' }, f.label, input));
      });
      let pw;
      if (sign) {
        const u = E.store.user();
        pw = el('input', { type: 'password', name: 'pw', autocomplete: 'off', required: true });
        form.append(
          el('div', { class: 'notice' }, el('b', {}, 'Elektronische Signatur'), el('br'), `Signatur-Bedeutung: ${meaning}`),
          el('label', { class: 'field' }, 'Benutzer', el('input', { type: 'text', value: `${u.name} (${u.roleLabel})`, readonly: true })),
          el('label', { class: 'field' }, 'Passwort (Re-Authentifizierung, im Mockup beliebig)', pw)
        );
      }
      form.append(err);
      const cancel = el('button', { type: 'button', class: 'btn secondary', onclick: () => dlg.close('cancel') }, 'Abbrechen');
      const ok = el('button', { type: 'submit', class: 'btn' }, submit || 'Bestätigen');
      form.append(el('div', { class: 'dlg-actions' }, cancel, ok));
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        if (sign && !pw.value.trim()) {
          err.textContent = 'Bitte Passwort zur Re-Authentifizierung eingeben.';
          err.hidden = false;
          pw.focus();
          return;
        }
        const values = {};
        Object.keys(inputs).forEach((k) => { values[k] = inputs[k].value; });
        dlg.dataset.result = JSON.stringify(values);
        dlg.close('ok');
      });
      dlg.addEventListener('close', () => {
        const res = dlg.returnValue === 'ok' ? JSON.parse(dlg.dataset.result || '{}') : null;
        dlg.remove();
        resolve(res);
      });
      dlg.append(form);
      document.body.append(dlg);
      dlg.showModal();
    });
  }

  function table(headers, rows, opts) {
    const o = opts || {};
    return el('div', { class: 'table-wrap' },
      el('table', {},
        o.caption ? el('caption', { class: 'muted small', style: 'text-align:left;padding-bottom:8px' }, o.caption) : null,
        el('thead', {}, el('tr', {}, headers.map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, rows.map((r) => el('tr', { class: r.cls }, r.cells.map((c) => el('td', {}, c)))))));
  }

  const progress = (pct) => el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': `${pct} Prozent` }, el('span', { style: `width:${pct}%` }));

  E.ui = { el, icon, badge, fmt, fmtDate, toast, dialog, table, progress };
})(typeof window !== 'undefined' ? window : globalThis);
