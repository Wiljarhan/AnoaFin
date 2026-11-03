/* Halaman Literasi Keuangan */
(function (A) {
  'use strict';
  A.pages = A.pages || {};

  var openModule = null; // modul yang sedang dibuka (status UI lokal)

  A.pages.intelligence = {
    render: function (s) {
      var D = A.data;
      var mods = Object.keys(D.MODULES).map(function (k) {
        var m = D.MODULES[k];
        return '<button type="button" class="tile' + (openModule === k ? ' active' : '') + '" data-module="' + k + '" aria-expanded="' + (openModule === k) + '">' +
          (s.modules[k] ? '<span class="done-tag">✓ Selesai</span>' : '') +
          '<div class="ico" aria-hidden="true">' + m.icon + '</div><h3>' + m.title + '</h3><p>' + m.desc + '</p></button>';
      }).join('');

      var panel = '';
      if (openModule && D.MODULES[openModule]) {
        var m = D.MODULES[openModule];
        panel = '<div class="card module-panel" id="module-panel"><h3>' + m.title + '</h3><ul>' +
          m.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
          (s.modules[openModule]
            ? '<span class="pill">✓ Modul selesai</span>'
            : '<button type="button" class="btn btn-dark" id="module-done">Tandai selesai (+10 poin)</button>') +
          ' <button type="button" class="link-btn" id="module-close" style="margin-left:10px">Tutup</button></div>';
      }

      var Q = D.QUIZ;
      var answered = s.quiz.answer;
      var options = Object.keys(Q.options).map(function (k) {
        var cls = '';
        if (answered === k) cls = s.quiz.correct ? ' right' : ' wrong';
        return '<button type="button" class="option' + cls + '" data-opt="' + k + '"' + (s.quiz.correct ? ' disabled' : '') + '>' + k + '. ' + Q.options[k] + '</button>';
      }).join('');

      var feedback = '<p class="feedback">Pilih satu jawaban.</p>';
      if (answered) {
        feedback = s.quiz.correct
          ? '<p class="feedback right" role="status">' + (s.awards.quiz ? Q.right : Q.rightAgain) + '</p>'
          : '<p class="feedback wrong" role="status">' + Q.wrong + '</p>';
      }

      var done = A.calc.modulesDone(s);

      return '' +
        '<div class="page-head"><div><p class="eyebrow">Pusat Pengetahuan Keuangan</p><h1 class="page-title">Literasi Keuangan</h1></div></div>' +
        '<section class="hero" style="margin-top:0"><div class="eyebrow" style="margin-bottom:12px">Pelajari · Terapkan · Tingkatkan</div>' +
          '<h2>Kebiasaan kecil. Masa depan lebih kuat.</h2><p>Pelajari pengelolaan uang, risiko pembiayaan, dan kebiasaan finansial sehat.</p></section>' +

        '<h2 class="section">Modul Belajar</h2>' +
        '<div class="grid-3">' + mods + '</div>' + panel +
        '<p class="note">Progres modul: ' + done + ' dari 3 selesai.</p>' +

        '<h2 class="section">Tantangan Pengetahuan</h2>' +
        '<div class="card"><span class="pill">Kuis Mini · 1 Soal</span>' +
          '<div class="quiz-q">' + Q.question + '</div>' + options + feedback + '</div>';
    },

    bind: function (root) {
      root.querySelectorAll('[data-module]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-module');
          openModule = openModule === k ? null : k;
          A.rerender();
          var p = document.getElementById('module-panel');
          if (p) p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
      var done = root.querySelector('#module-done');
      if (done) done.addEventListener('click', function () {
        A.actions.completeModule(openModule);
        A.toast('Modul selesai · +10 poin reward');
      });
      var close = root.querySelector('#module-close');
      if (close) close.addEventListener('click', function () { openModule = null; A.rerender(); });

      root.querySelectorAll('[data-opt]').forEach(function (b) {
        b.addEventListener('click', function () {
          var res = A.actions.answerQuiz(b.getAttribute('data-opt'));
          if (res.ok && res.correct && res.bonus) A.toast('Jawaban benar · +20 poin reward');
          else if (res.ok && !res.correct) A.toast('Belum tepat, coba lagi', 'error');
        });
      });
    },

    leave: function () { openModule = null; }
  };
})(window.ANOA);
