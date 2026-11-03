/* Halaman Proteksi Keuangan */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  function pillClass(level) {
    return level === 'danger' ? ' danger' : (level === 'warn' ? ' warn' : '');
  }

  A.pages.protection = {
    render: function (s) {
      var c = A.calc;
      var pct = c.usedPct(s);
      var status = c.status(s);
      var barCls = status.key === 'danger' ? 'danger' : (status.key === 'warn' ? 'warn' : '');

      var alerts = c.alerts(s).map(function (a) {
        return '<div class="alert-block"><div class="head"><h4>' + A.esc(a.title) + '</h4><span class="pill' + pillClass(a.level) + '">' + a.badge + '</span></div>' +
          '<p>' + A.esc(a.text) + '</p></div>';
      }).join('');

      var reminder = c.savedToday(s)
        ? 'Sisihkan sebagian pemasukan secara berkala untuk membangun dana darurat. ✓ Tabungan hari ini sudah dicatat.'
        : 'Sisihkan sebagian pemasukan secara berkala untuk membangun dana darurat.';

      var items = c.checklist(s);
      var doneCount = items.filter(function (i) { return i.done; }).length;
      var checklist = items.map(function (i) {
        var box = '<span class="box" aria-hidden="true">' + (i.done ? '✓' : '') + '</span>';
        if (i.auto) {
          return '<li class="' + (i.done ? 'done' : '') + '">' + box + '<span class="txt">' + i.text + '</span><span class="tag">otomatis</span></li>';
        }
        return '<li class="' + (i.done ? 'done' : '') + '"><label><input type="checkbox" data-check="' + i.id + '"' + (i.done ? ' checked' : '') + '>' + box +
          '<span class="txt">' + i.text + '</span></label></li>';
      }).join('');

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Pemantauan Risiko Keuangan</p><h1 class="page-title">Proteksi Keuangan</h1></div></div>' +

        '<div class="card"><div class="card-head"><h3>Pemantau pengeluaran bulanan</h3><span class="pill' + pillClass(status.key) + '" data-testid="status">' + status.label + '</span></div>' +
          '<div class="monitor-pct" data-testid="used-pct">' + pct + '%</div>' +
          '<div class="bar thick" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.min(pct, 100) + '" aria-label="Pengeluaran bulanan"><i class="' + barCls + '" style="width:' + Math.min(pct, 100) + '%"></i></div>' +
          '<p class="muted" style="margin:12px 0 0;font-size:14px">Pengeluaran dibandingkan dengan total batas anggaran kategori.</p></div>' +

        '<h2 class="section">Peringatan Cerdas</h2>' +
        '<div class="card">' + alerts +
          '<div class="alert-block small"><h4>Pengingat dana darurat</h4><p>' + reminder + '</p>' +
          '<a class="btn btn-soft" href="#finance/budget" id="review-budget" style="display:inline-block">Tinjau anggaran saya</a></div></div>' +

        '<h2 class="section">Daftar Periksa Keamanan Finansial</h2>' +
        '<div class="card"><ul class="checklist">' + checklist + '</ul>' +
          '<p class="progress-note" data-testid="check-progress">' + doneCount + ' dari ' + items.length + ' langkah terpenuhi</p></div>';
    },

    bind: function (root) {
      root.querySelectorAll('[data-check]').forEach(function (cb) {
        cb.addEventListener('change', function () { A.actions.toggleChecklist(cb.getAttribute('data-check')); });
      });
    }
  };
})(window.ANOA);
