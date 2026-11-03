/* ANOA FIN — router dan render ulang otomatis */
(function (A) {
  'use strict';

  var ROUTES = [
    { id: 'dashboard', label: 'Dasbor', icon: '⌂' },
    { id: 'finance', label: 'Keuanganku', icon: '▤' },
    { id: 'reputation', label: 'Reputasi', icon: '◈' },
    { id: 'protection', label: 'Proteksi', icon: '♧' },
    { id: 'intelligence', label: 'Literasi', icon: '✧' },
    { id: 'growth', label: 'Pertumbuhan', icon: '★' },
    { id: 'access', label: 'Akses Pembiayaan', icon: '↗' }
  ];

  var app = document.getElementById('app');
  var nav = document.getElementById('nav');
  var currentId = null;

  function parseHash() {
    var parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    var id = parts[0];
    var known = ROUTES.some(function (r) { return r.id === id; });
    return { id: known ? id : 'dashboard', sub: parts[1] || '' };
  }

  function buildNav() {
    nav.innerHTML = ROUTES.map(function (r) {
      return '<a href="#' + r.id + '" data-route="' + r.id + '"><span aria-hidden="true">' + r.icon + '</span> ' + r.label + '</a>';
    }).join('');
  }

  function markActive(id) {
    nav.querySelectorAll('a').forEach(function (a) {
      if (a.getAttribute('data-route') === id) {
        a.setAttribute('aria-current', 'page');
        if (a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'center' });
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function paint(id) {
    var page = A.pages[id];
    app.innerHTML = page.render(A.store.get());
    page.bind(app);
    markActive(id);
    var names = { dashboard: 'Dasbor', finance: 'Keuanganku', reputation: 'Reputasi ANOA', protection: 'Proteksi Keuangan', intelligence: 'Literasi Keuangan', growth: 'Pertumbuhan Keuangan', access: 'Akses Pembiayaan' };
    document.title = names[id] + ' · ANOA FIN';
  }

  // dipanggil saat data berubah atau UI lokal berubah: gambar ulang tanpa menggulir ke atas
  A.rerender = function () {
    var y = window.scrollY;
    paint(currentId || parseHash().id);
    window.scrollTo(0, y);
  };

  function route() {
    var r = parseHash();
    var changed = r.id !== currentId;
    if (changed && currentId && A.pages[currentId].leave) A.pages[currentId].leave();
    currentId = r.id;
    paint(r.id);
    if (changed) {
      window.scrollTo(0, 0);
      if (r.sub === 'budget') {
        var el = document.getElementById('budget');
        if (el) el.scrollIntoView({ block: 'start' });
      }
    } else if (r.sub === 'budget') {
      var el2 = document.getElementById('budget');
      if (el2) el2.scrollIntoView({ block: 'start' });
    }
  }

  buildNav();
  A.store.subscribe(function () { A.rerender(); });
  window.addEventListener('hashchange', route);
  // sinkronisasi antar-tab
  window.addEventListener('storage', function (e) {
    if (e.key === 'anoafin.state.v1') A.store.reload();
  });

  document.getElementById('reset-demo').addEventListener('click', function () {
    if (window.confirm('Kembalikan semua data demo ke kondisi awal?')) {
      A.store.reset();
      A.toast('Data demo dikembalikan');
    }
  });

  route();
})(window.ANOA);
