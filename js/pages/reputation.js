/* Halaman ANOA Reputation */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  A.pages.reputation = {
    render: function (s) {
      var rep = A.calc.reputation(s);
      var factors = rep.factors.map(function (f) {
        return '<div class="factor"><div class="top"><b>' + f.label + '</b><span>' + f.weight + '% bobot · ' + f.value + '%</span></div>' +
          '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + f.value + '" aria-label="' + f.label + '"><i style="width:' + f.value + '%"></i></div></div>';
      }).join('');

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Alternative Financial Reputation</p><h1 class="page-title">ANOA Reputation</h1></div></div>' +
        '<section class="hero" style="margin-top:0">' +
          '<div class="eyebrow">Illustrative Financial Score</div>' +
          '<div class="hero-score" data-testid="score">' + rep.score + '</div>' +
          '<div class="hero-between"><span class="pill upper hero-chip">' + rep.label + '</span><span>Range 300–850</span></div>' +
          '<p style="margin-top:14px">Skor contoh untuk menunjukkan cara kerja konsep reputasi finansial alternatif, bukan skor kredit resmi atau keputusan pembiayaan.</p>' +
        '</section>' +

        '<h2 class="section">Indicative Assessment Factors</h2>' +
        '<div class="card">' + factors + '</div>' +

        '<h2 class="section">How it works</h2>' +
        '<div class="card"><p style="margin:0">ANOA FIN mengolah indikator finansial yang relevan, seperti konsistensi pemasukan, ketepatan pembayaran, pola pengeluaran, dan kebiasaan menyisihkan dana darurat. Penilaian memerlukan persetujuan pengguna, validasi, dan transparansi. IPK, kehadiran, serta aktivitas organisasi tidak menjadi ukuran kemampuan membayar.</p></div>' +

        '<p style="margin:16px 0 0"><a class="btn btn-soft" href="#access" style="display:inline-block">Explore Financial Access →</a></p>';
    },
    bind: function () {}
  };
})(window.ANOA);
