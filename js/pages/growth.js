/* Halaman Financial Growth */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  var GOAL = 500000;

  A.pages.growth = {
    render: function (s) {
      var c = A.calc;
      var tier = c.tier(s.points);
      var days = s.saving.days;
      var savedToday = c.savedToday(s);
      var finished = days >= 7;

      var badges = c.badges(s).map(function (b) {
        return '<div class="badge-card ' + (b.unlocked ? 'unlocked' : 'locked') + '"><span class="badge-ico" aria-hidden="true">' + b.icon + '</span>' +
          '<h3>' + b.name + '</h3><p>' + b.desc + '</p><span class="pill upper">' + (b.unlocked ? 'Unlocked' : 'Locked') + '</span></div>';
      }).join('');

      var btnLabel = finished ? 'Tantangan selesai 🎉' : (savedToday ? '✓ Sudah dicatat hari ini' : '+ Record saving today');

      var circleBase = 65;
      var circlePct = A.clamp(circleBase + (s.circle.joined ? s.circle.contrib * 2 : 0), 0, 100);
      var members = 8 + (s.circle.joined ? 1 : 0);

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Habits · Rewards · Community</p><h1 class="page-title">Financial Growth</h1></div></div>' +

        '<section class="hero" style="margin-top:0"><div class="eyebrow" style="margin-bottom:10px">Your Financial Journey</div>' +
          '<div class="hero-between"><div><div style="font-size:42px;font-weight:800;line-height:1.1"><span data-testid="points">' + s.points + '</span> <small style="font-size:16px;color:var(--gold)">PTS</small></div>' +
          '<div style="margin-top:4px">Reward Points</div></div>' +
          '<div style="text-align:right"><span class="pill upper hero-chip" data-testid="tier">' + tier + ' Member</span>' +
          '<div style="margin-top:10px">🔥 ' + days + '-day saving streak</div></div></div>' +
          '<p style="margin-top:14px">Terus bangun kebiasaan keuangan yang sehat.</p></section>' +

        '<h2 class="section">Achievement Badges</h2>' +
        '<div class="grid-4">' + badges + '</div>' +

        '<h2 class="section">Monthly Challenges</h2>' +
        '<div class="card"><div class="card-head"><h3>7-Day Saving Challenge</h3><span class="pill upper" data-testid="challenge">' + days + '/7 days</span></div>' +
          '<div class="bar" style="margin:16px 0 14px" role="progressbar" aria-valuemin="0" aria-valuemax="7" aria-valuenow="' + days + '" aria-label="Tantangan menabung"><i style="width:' + Math.round(days / 7 * 100) + '%"></i></div>' +
          '<p class="muted" style="margin:0 0 14px">Pertahankan kebiasaan menyisihkan uang setiap hari.</p>' +
          '<button type="button" class="btn btn-soft" id="record-saving"' + (finished || savedToday ? ' disabled' : '') + '>' + btnLabel + '</button></div>' +

        '<h2 class="section">Teman Keuangan</h2>' +
        '<div class="card"><div class="card-head"><div><h3>UHO Saving Circle</h3>' +
          '<div class="muted" style="font-size:14px">Peer financial support · <span data-testid="members">' + members + '</span> members</div></div>' +
          '<span class="pill upper">' + (s.circle.joined ? 'Joined' : 'Open group') + '</span></div>' +
          '<p class="muted" style="font-size:14px;margin:6px 0 0">Kelompok pendampingan sukarela untuk mencapai target menabung bersama tanpa membuka saldo atau rincian transaksi pribadi.</p>' +
          '<div class="shared-goal"><div class="row"><b>Shared goal</b><b class="big">' + A.rp(GOAL) + '</b></div>' +
            '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + circlePct + '" aria-label="Progres kelompok"><i style="width:' + circlePct + '%"></i></div>' +
            '<div class="muted" style="font-size:14px;margin-top:10px"><span data-testid="circle-pct">' + circlePct + '</span>% progress kelompok · data ilustratif</div></div>' +
          '<button type="button" class="btn ' + (s.circle.joined ? 'btn-soft' : 'btn-gold') + '" id="toggle-circle">' + (s.circle.joined ? 'Leave Saving Circle' : 'Join Saving Circle') + '</button></div>';
    },

    bind: function (root) {
      var rec = root.querySelector('#record-saving');
      if (rec) rec.addEventListener('click', function () {
        var res = A.actions.recordSaving();
        if (!res.ok) { A.toast(res.msg, 'error'); return; }
        A.toast(res.completed ? 'Tantangan 7 hari selesai! +50 poin bonus' : 'Tabungan hari ini dicatat · +5 poin');
      });
      var tg = root.querySelector('#toggle-circle');
      if (tg) tg.addEventListener('click', function () {
        var res = A.actions.toggleCircle();
        A.toast(res.joined ? 'Anda bergabung di UHO Saving Circle' : 'Anda keluar dari UHO Saving Circle');
      });
    }
  };
})(window.ANOA);
