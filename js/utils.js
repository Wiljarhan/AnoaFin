/* ANOA FIN — utilitas umum */
window.ANOA = window.ANOA || {};

(function (A) {
  'use strict';

  A.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // 1250000 -> "1.250.000"
  A.num = function (n) {
    return String(Math.round(Math.abs(Number(n) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // 1250000 -> "Rp 1.250.000" (negatif -> "−Rp ...")
  A.rp = function (n) {
    return (n < 0 ? '−' : '') + 'Rp ' + A.num(n);
  };

  // tanda +/− untuk riwayat transaksi
  A.signed = function (type, n) {
    return (type === 'income' ? '+' : '−') + 'Rp ' + A.num(n);
  };

  A.pct = function (value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  A.clamp = function (n, min, max) {
    return Math.min(max, Math.max(min, n));
  };

  // kunci tanggal lokal YYYY-MM-DD
  A.dateKey = function (d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  };

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  A.shortDate = function (ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  };

  // notifikasi singkat di bawah layar
  var toastTimer = null;
  A.toast = function (msg, kind) {
    if (typeof document === 'undefined') return;
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.className = 'toast';
    }, 2600);
  };
})(window.ANOA);
