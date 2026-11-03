/* Halaman Dashboard */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  var JOURNEY = [
    { id: 'finance', icon: '▤', title: 'Keuanganku', desc: 'Kelola pemasukan dan pengeluaran' },
    { id: 'reputation', icon: '◈', title: 'Reputasi ANOA', desc: 'Lihat profil reputasi finansial' },
    { id: 'protection', icon: '♧', title: 'Proteksi Keuangan', desc: 'Pantau peringatan keuangan' },
    { id: 'intelligence', icon: '✧', title: 'Literasi Keuangan', desc: 'Belajar dan uji literasi' },
    { id: 'growth', icon: '★', title: 'Pertumbuhan Keuangan', desc: 'Hadiah dan Teman Keuangan' },
    { id: 'access', icon: '↗', title: 'Akses Pembiayaan', desc: 'Jelajahi fasilitas pembiayaan' }
  ];

  A.pages.dashboard = {
    render: function (s) {
      var c = A.calc;
      var rep = c.reputation(s);
      var recent = s.transactions.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 3);

      var journey = JOURNEY.map(function (j) {
        return '<a class="tile" href="#' + j.id + '"><div class="ico" aria-hidden="true">' + j.icon + '</div>' +
          '<h3>' + j.title + '</h3><p>' + j.desc + '</p></a>';
      }).join('');

      var activity = recent.length ? recent.map(function (t) {
        return '<li><div><div class="name">' + A.esc(t.name) + '</div><div class="cat">' + A.esc(t.category) + '</div></div>' +
          '<div class="amt' + (t.type === 'income' ? ' pos' : '') + '">' + A.signed(t.type, t.amount) + '</div></li>';
      }).join('') : '<li><p class="empty">Belum ada transaksi.</p></li>';

      return '' +
        '<section class="hero" aria-label="Ringkasan keuangan">' +
          '<div class="eyebrow">Ringkasan Keuangan · ' + A.esc(s.period) + '</div>' +
          '<div class="lead">Total saldo tersedia</div>' +
          '<div class="big" data-testid="balance">' + A.rp(c.balance(s)) + '</div>' +
          '<div class="hero-row">' +
            '<div><small>Pemasukan</small><strong>' + A.rp(c.income(s)) + '</strong></div>' +
            '<div><small>Pengeluaran</small><strong>' + A.rp(c.expenses(s)) + '</strong></div>' +
          '</div>' +
          '<a class="btn btn-gold" href="#finance" style="display:inline-block">Kelola keuangan saya →</a>' +
        '</section>' +

        '<h2 class="section">Ringkasan Cepat</h2>' +
        '<div class="grid-3 keep">' +
          '<a class="stat" href="#reputation"><div class="label">Reputasi ANOA</div><div class="value">' + rep.score + ' / 850</div><div class="sub">' + rep.label + ' · Simulasi</div></a>' +
          '<a class="stat" href="#protection"><div class="label">Anggaran Terpakai</div><div class="value">' + c.usedPct(s) + '%</div><div class="sub">Dari anggaran kategori</div></a>' +
          '<a class="stat" href="#growth"><div class="label">Rutin Menabung</div><div class="value">' + s.saving.days + ' hari</div><div class="sub">Konsistensi menabung</div></a>' +
        '</div>' +

        '<h2 class="section">Perjalanan Keuanganmu</h2>' +
        '<div class="grid-3">' + journey + '</div>' +

        '<h2 class="section">Aktivitas Terbaru</h2>' +
        '<div class="card"><ul class="list">' + activity + '</ul></div>' +
        '<p class="note">* Seluruh angka merupakan data contoh untuk simulasi demonstrasi.</p>';
    },
    bind: function () {}
  };
})(window.ANOA);
