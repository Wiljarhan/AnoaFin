/* Halaman Akses Pembiayaan */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  // draf formulir disimpan di memori agar tidak hilang saat render ulang
  var draft = { amount: '', purpose: '', notes: '', consent: false };
  var errorMsg = '';
  var errorField = '';

  function appCard(a, rep) {
    var F = A.data.FACILITIES[a.facility];
    var ST = A.data.STAGES;
    var steps = ST.map(function (_, i) { return '<i class="' + (i <= a.stage ? 'on' : '') + '"></i>'; }).join('');
    var final = a.stage === ST.length - 1;
    var label = ST[a.stage];
    if (final) {
      label += rep.score >= 600
        ? ' — indikator awal terpenuhi; keputusan tetap ada pada unit kampus atau mitra berwenang.'
        : ' — indikator keuangan perlu diperbaiki sebelum ditinjau lebih lanjut.';
    }
    return '<div class="tracking-item"><div class="head"><div><h4>' + A.esc(F.title) + '</h4>' +
      '<div class="muted" style="font-size:14px">' + A.rp(a.amount) + ' · ' + A.esc(a.purpose) + ' · ' + A.shortDate(a.ts) + '</div></div>' +
      '<span class="pill upper">' + (final ? 'Simulasi selesai' : 'Dalam proses') + '</span></div>' +
      '<div class="steps" aria-hidden="true">' + steps + '</div>' +
      '<p class="step-label">Tahap ' + (a.stage + 1) + ' dari ' + ST.length + ': ' + label + '</p>' +
      '<div class="actions">' +
        (final ? '' : '<button type="button" class="btn btn-soft btn-sm" data-advance="' + a.id + '">Simulasikan tahap berikutnya</button>') +
        '<button type="button" class="btn btn-soft btn-sm" data-cancel="' + a.id + '">' + (final ? 'Hapus dari daftar' : 'Batalkan') + '</button>' +
      '</div></div>';
  }

  A.pages.access = {
    render: function (s) {
      var F = A.data.FACILITIES;
      var sel = F[s.selectedFacility];
      var rep = A.calc.reputation(s);

      var cards = Object.keys(F).map(function (k) {
        var f = F[k];
        return '<div class="tile' + (k === s.selectedFacility ? ' selected' : '') + '">' +
          '<div class="ico" aria-hidden="true">' + f.icon + '</div><h3 class="tight">' + f.title + '</h3><p>' + f.cardDesc + '</p>' +
          '<button type="button" class="link-btn more" data-facility="' + k + '">Lihat fasilitas →</button></div>';
      }).join('');

      var tracking = s.applications.length
        ? s.applications.map(function (a) { return appCard(a, rep); }).join('')
        : '<p class="empty">Belum ada pengajuan. Pilih fasilitas untuk memulai simulasi.</p>';

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Pembiayaan Mahasiswa yang Aman</p><h1 class="page-title">Akses Pembiayaan</h1></div></div>' +
        '<p class="page-sub" style="margin-top:-6px">Akses informasi dan pengajuan fasilitas dukungan finansial mahasiswa.</p>' +
        '<div class="grid-3">' + cards + '</div>' +

        '<h2 class="section">Pusat Pengajuan</h2>' +
        '<form class="card" id="app-form" novalidate>' +
          '<div class="card-head"><h3 class="app-form-title" data-testid="selected-title">' + sel.title + '</h3><span class="pill upper">Dipilih</span></div>' +
          '<p class="muted" style="margin:4px 0 18px;font-size:14px">' + sel.formDesc + '</p>' +
          '<div class="field"><label for="ap-amount">Nominal pengajuan (Rp)</label><input class="input' + (errorField === 'amount' ? ' invalid' : '') + '" id="ap-amount" type="number" min="1" step="1" inputmode="numeric" placeholder="Contoh: 1000000" value="' + A.esc(draft.amount) + '"></div>' +
          '<div class="field"><label for="ap-purpose">Tujuan pengajuan</label><input class="input' + (errorField === 'purpose' ? ' invalid' : '') + '" id="ap-purpose" type="text" maxlength="120" placeholder="Jelaskan tujuan pengajuan" value="' + A.esc(draft.purpose) + '"></div>' +
          '<div class="field"><label for="ap-notes">Keterangan tambahan</label><textarea class="input" id="ap-notes" maxlength="500" placeholder="Tuliskan informasi pendukung">' + A.esc(draft.notes) + '</textarea></div>' +
          '<label class="check"><input type="checkbox" id="ap-consent"' + (draft.consent ? ' checked' : '') + '><span>Saya menyetujui penggunaan data yang relevan untuk simulasi evaluasi pengajuan ini.</span></label>' +
          '<p class="error" id="ap-error" role="alert">' + A.esc(errorMsg) + '</p>' +
          '<button class="btn btn-gold" type="submit">Kirim Simulasi →</button>' +
        '</form>' +

        '<h2 class="section">Pelacakan Pengajuan</h2>' +
        '<div class="card" id="tracking">' + tracking + '</div>' +

        '<div class="info-box"><b>Informasi penting</b><p>ANOA FIN bukan pemberi pinjaman dan tidak menjamin persetujuan atau pencairan dana. Keputusan pembiayaan dilakukan oleh unit kampus atau mitra lembaga jasa keuangan yang berwenang dan berizin sesuai ketentuan. Target 10 menit dan 24–48 jam merupakan target desain layanan, bukan jaminan waktu layanan.</p></div>';
    },

    bind: function (root) {
      var amount = root.querySelector('#ap-amount');
      var purpose = root.querySelector('#ap-purpose');
      var notes = root.querySelector('#ap-notes');
      var consent = root.querySelector('#ap-consent');

      amount.addEventListener('input', function () { draft.amount = amount.value; });
      purpose.addEventListener('input', function () { draft.purpose = purpose.value; });
      notes.addEventListener('input', function () { draft.notes = notes.value; });
      consent.addEventListener('change', function () { draft.consent = consent.checked; });

      root.querySelectorAll('[data-facility]').forEach(function (b) {
        b.addEventListener('click', function () {
          errorMsg = ''; errorField = '';
          A.actions.selectFacility(b.getAttribute('data-facility'));
          var f = document.getElementById('app-form');
          if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      root.querySelector('#app-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var res = A.actions.submitApplication(draft);
        if (!res.ok) {
          errorMsg = res.msg; errorField = res.field;
          A.rerender();
          var target = { amount: '#ap-amount', purpose: '#ap-purpose', consent: '#ap-consent' }[res.field];
          var el = target && document.querySelector(target);
          if (el) el.focus();
          return;
        }
        draft = { amount: '', purpose: '', notes: '', consent: false };
        errorMsg = ''; errorField = '';
        A.rerender();
        A.toast('Pengajuan simulasi terkirim');
        var t = document.getElementById('tracking');
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      root.querySelectorAll('[data-advance]').forEach(function (b) {
        b.addEventListener('click', function () { A.actions.advanceApplication(b.getAttribute('data-advance')); });
      });
      root.querySelectorAll('[data-cancel]').forEach(function (b) {
        b.addEventListener('click', function () {
          A.actions.cancelApplication(b.getAttribute('data-cancel'));
          A.toast('Pengajuan dihapus dari daftar');
        });
      });
    },

    leave: function () { errorMsg = ''; errorField = ''; }
  };
})(window.ANOA);
