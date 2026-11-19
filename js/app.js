(function () {
  const E = window.EMBR;
  const { el, icon } = E.ui;
  const S = E.store;

  const NAV = [
    { href: '#/dashboard', label: 'Übersicht', icon: 'dashboard', match: /^#\/dashboard/ },
    { href: '#/mbr', label: 'Vorlagen (MBR)', icon: 'mbr', match: /^#\/mbr/ },
    { href: '#/batches', label: 'Batch Records', icon: 'batch', match: /^#\/(batches|dhr)/ },
    { href: '#/deviations', label: 'Abweichungen', icon: 'deviation', match: /^#\/deviations/ },
    { href: '#/release', label: 'QA-Freigabe', icon: 'release', match: /^#\/release/ },
    { href: '#/trace', label: 'Rückverfolgung', icon: 'trace', match: /^#\/trace/ },
    { href: '#/audit', label: 'Audit Trail', icon: 'audit', match: /^#\/audit/ },
    { href: '#/system', label: 'System', icon: 'system', match: /^#\/system/ },
  ];

  function resolve(hash) {
    const parts = hash.replace(/^#\//, '').split('/');
    const [name, arg] = parts;
    const V = E.views;
    switch (name) {
      case 'mbr': return arg ? V.mbrDetail(decodeURIComponent(arg)) : V.mbrList();
      case 'batches': return arg ? V.batchDetail(decodeURIComponent(arg)) : V.batches();
      case 'dhr': return V.dhr(decodeURIComponent(arg || ''));
      case 'deviations': return V.deviations();
      case 'release': return V.release();
      case 'trace': return V.trace();
      case 'audit': return V.audit();
      case 'system': return V.system();
      default: return V.dashboard();
    }
  }

  function renderNav() {
    const nav = document.getElementById('nav-list');
    nav.replaceChildren(...NAV.map((n) => el('li', {}, el('a', { href: n.href, 'aria-current': n.match.test(location.hash || '#/dashboard') ? 'page' : null }, icon(n.icon), n.label))));
  }

  function renderUser() {
    const sel = document.getElementById('user-select');
    sel.replaceChildren(...S.get().users.map((u) => el('option', { value: u.id, selected: u.id === S.get().userId }, `${u.name} · ${u.roleLabel}`)));
  }

  function route() {
    const main = document.getElementById('view');
    const y = window.scrollY;
    main.replaceChildren(resolve(location.hash || '#/dashboard'));
    renderNav();
    renderUser();
    window.scrollTo(0, y);
  }

  E.rerender = route;

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('embr-theme', dark ? 'dark' : 'light'); } catch (e) { /* ignorieren */ }
    const b = document.getElementById('theme-btn');
    b.replaceChildren(icon(dark ? 'sun' : 'moon'));
    b.setAttribute('aria-label', dark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren');
  }

  document.addEventListener('DOMContentLoaded', () => {
    S.init();
    document.getElementById('user-select').addEventListener('change', (e) => { S.setUser(e.target.value); route(); });
    document.getElementById('theme-btn').addEventListener('click', () => applyTheme(!document.documentElement.classList.contains('dark')));
    document.getElementById('reset-btn').addEventListener('click', () => { S.reset(); E.ui.toast('Mockup-Daten zurückgesetzt', 'ok'); route(); });
    let dark = false;
    try { dark = localStorage.getItem('embr-theme') === 'dark'; } catch (e) { /* ignorieren */ }
    applyTheme(dark);
    window.addEventListener('hashchange', () => { window.scrollTo(0, 0); route(); });
    route();
  });
})();
