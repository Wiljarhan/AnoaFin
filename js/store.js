/* ANOA FIN — state, perhitungan, dan aksi.
   Satu sumber kebenaran untuk semua halaman. Disimpan di localStorage. */
(function (A) {
  'use strict';

  var KEY = 'anoafin.state.v1';
  var VERSION = 1;

  var EXPENSE_CATS = ['Makanan', 'Transportasi', 'Akademik', 'Komunikasi', 'Hiburan'];
  var INCOME_CATS = ['Pemasukan', 'Beasiswa', 'Pendapatan usaha'];

  var FACILITIES = {
    emergency: {
      id: 'emergency',
      icon: '♡',
      title: 'Student Emergency Assistance Fund',
      cardDesc: 'Bantuan dana darurat untuk kebutuhan mendesak mahasiswa.',
      formDesc: 'Kebutuhan kesehatan, akademik, atau kondisi mendesak lainnya.'
    },
    ukt: {
      id: 'ukt',
      icon: '▤',
      title: 'Flexible UKT Installment Plan',
      cardDesc: 'Pengajuan pembayaran UKT bertahap sesuai kebijakan kampus.',
      formDesc: 'Pengajuan cicilan UKT bertahap sesuai kebijakan kampus.'
    },
    micro: {
      id: 'micro',
      icon: '↗',
      title: 'Student Micro-Entrepreneurship Financing',
      cardDesc: 'Pembiayaan produktif untuk usaha rintisan mahasiswa.',
      formDesc: 'Modal produktif untuk usaha rintisan mahasiswa.'
    }
  };

  var MODULES = {
    budgeting: {
      id: 'budgeting',
      icon: '▤',
      title: 'Smart Budgeting',
      desc: 'Menyusun anggaran mahasiswa',
      points: [
        'Pisahkan pengeluaran menjadi kebutuhan pokok (makan, transportasi, akademik), keinginan (hiburan), dan tabungan.',
        'Tetapkan batas bulanan per kategori, lalu catat setiap pengeluaran di My Finance.',
        'Tinjau sisa anggaran setiap minggu agar tidak kehabisan uang sebelum akhir bulan.'
      ]
    },
    financing: {
      id: 'financing',
      icon: '◈',
      title: 'Responsible Financing',
      desc: 'Memahami pembiayaan yang aman',
      points: [
        'Pastikan penyedia layanan legal dan berizin; periksa statusnya di sumber resmi seperti situs OJK.',
        'Hitung total biaya (bunga, denda, biaya administrasi) dan pastikan cicilan tidak mengganggu kebutuhan pokok.',
        'Baca ketentuan sebelum menyetujui, dan waspada pada tawaran pencairan cepat tanpa syarat yang jelas.'
      ]
    },
    emergency: {
      id: 'emergency',
      icon: '♧',
      title: 'Emergency Fund',
      desc: 'Membangun dana darurat',
      points: [
        'Mulai dari nominal kecil tetapi rutin; target awal setara satu bulan pengeluaran pokok.',
        'Sisihkan di awal bulan, bukan dari sisa, dan simpan terpisah dari uang harian.',
        'Gunakan hanya untuk kebutuhan mendesak, lalu isi kembali secara bertahap.'
      ]
    }
  };

  var QUIZ = {
    question: 'Apa tindakan paling tepat sebelum mengajukan pembiayaan?',
    options: {
      A: 'Mengajukan ke lembaga mana pun yang menawarkan pencairan cepat',
      B: 'Memeriksa legalitas, biaya, kemampuan membayar, dan ketentuan',
      C: 'Meminjam sebanyak mungkin selama tersedia'
    },
    correct: 'B',
    right: 'Benar! Periksa legalitas, biaya, kemampuan membayar, dan ketentuan sebelum mengajukan pembiayaan. +20 poin reward.',
    rightAgain: 'Benar! Periksa legalitas, biaya, kemampuan membayar, dan ketentuan sebelum mengajukan pembiayaan.',
    wrong: 'Belum tepat. Pembiayaan yang aman dimulai dari memeriksa legalitas, biaya, kemampuan membayar, dan ketentuan. Coba lagi.'
  };

  var STAGES = ['Diajukan', 'Verifikasi data', 'Evaluasi simulasi', 'Hasil simulasi'];

  /* ---------- state awal (sesuai angka di prototipe) ---------- */
  function seed() {
    var t = Date.now() - 10000;
    var y = new Date();
    y.setDate(y.getDate() - 1);
    return {
      version: VERSION,
      period: 'November 2026',
      transactions: [
        { id: 'seed1', type: 'income', category: 'Pemasukan', name: 'Uang saku bulanan', amount: 1500000, ts: t + 3 },
        { id: 'seed2', type: 'expense', category: 'Makanan', name: 'Kebutuhan makan', amount: 150000, ts: t + 2 },
        { id: 'seed3', type: 'expense', category: 'Transportasi', name: 'Transportasi', amount: 60000, ts: t + 1 },
        { id: 'seed4', type: 'expense', category: 'Akademik', name: 'Alat tulis', amount: 40000, ts: t }
      ],
      budgets: { Makanan: 450000, Transportasi: 200000, Akademik: 150000, Komunikasi: 100000, Hiburan: 150000 },
      points: 320,
      awards: { quiz: false, challenge: false, modules: {} },
      quiz: { answer: null, correct: false },
      modules: {},
      saving: { days: 5, last: A.dateKey(y) },
      circle: { joined: false, contrib: 0 },
      checklist: { legal: false },
      applications: [],
      selectedFacility: 'emergency'
    };
  }

  /* ---------- penyimpanan ---------- */
  var state;
  var listeners = [];

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.version === VERSION && Array.isArray(s.transactions) && s.budgets) return s;
      }
    } catch (e) { /* abaikan, pakai data awal */ }
    return seed();
  }

  function persist() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* mode privat dsb. */ }
  }

  function emit() {
    listeners.slice().forEach(function (fn) { fn(state); });
  }

  var store = {
    get: function () { return state; },
    subscribe: function (fn) { listeners.push(fn); },
    update: function (mutator) {
      mutator(state);
      persist();
      emit();
    },
    reload: function () { state = load(); emit(); },
    reset: function () { state = seed(); persist(); emit(); }
  };

  state = load();

  /* ---------- perhitungan (selalu diturunkan dari state) ---------- */
  var calc = {};

  calc.income = function (s) {
    return s.transactions.reduce(function (a, t) { return a + (t.type === 'income' ? t.amount : 0); }, 0);
  };
  calc.expenses = function (s) {
    return s.transactions.reduce(function (a, t) { return a + (t.type === 'expense' ? t.amount : 0); }, 0);
  };
  calc.balance = function (s) { return calc.income(s) - calc.expenses(s); };

  calc.spentBy = function (s, cat) {
    return s.transactions.reduce(function (a, t) {
      return a + (t.type === 'expense' && t.category === cat ? t.amount : 0);
    }, 0);
  };
  calc.budgetTotal = function (s) {
    return EXPENSE_CATS.reduce(function (a, c) { return a + (s.budgets[c] || 0); }, 0);
  };
  calc.usedPct = function (s) { return A.pct(calc.expenses(s), calc.budgetTotal(s)); };

  calc.categories = function (s) {
    return EXPENSE_CATS.map(function (c) {
      var spent = calc.spentBy(s, c);
      var limit = s.budgets[c] || 0;
      var pct = A.pct(spent, limit);
      var level = 'ok';
      if (spent > limit) level = 'over';
      else if (limit > 0 && pct >= 80) level = 'warn';
      return { name: c, spent: spent, limit: limit, pct: pct, level: level };
    });
  };
  calc.overCategories = function (s) {
    return calc.categories(s).filter(function (c) { return c.level === 'over'; });
  };

  // status keseluruhan untuk monitor pengeluaran
  calc.status = function (s) {
    var cats = calc.categories(s);
    var pct = calc.usedPct(s);
    var over = cats.some(function (c) { return c.level === 'over'; });
    var warn = cats.some(function (c) { return c.level === 'warn'; });
    if (over || pct > 100) return { key: 'danger', label: 'Melebihi batas' };
    if (warn || pct >= 80) return { key: 'warn', label: 'Waspada' };
    return { key: 'ok', label: 'Terkendali' };
  };

  calc.savedToday = function (s) { return s.saving.last === A.dateKey(); };
  calc.modulesDone = function (s) {
    return Object.keys(MODULES).filter(function (k) { return s.modules[k]; }).length;
  };

  // skor reputasi ilustratif 300–850
  calc.reputation = function (s) {
    var pct = calc.usedPct(s);
    var over = calc.overCategories(s).length;
    var punctuality = 82; // data simulasi
    var efficiency = A.clamp(Math.round(78 + (24 - pct) * 0.8) - over * 10, 0, 100);
    var emergency = A.clamp(65 + (s.saving.days - 5) * 5, 0, 100);
    var education = A.clamp(90 + 3 * calc.modulesDone(s) + (s.quiz.correct ? 4 : 0), 0, 100);
    var factors = [
      { key: 'punctuality', label: 'Ketepatan pembayaran', weight: 35, value: punctuality },
      { key: 'efficiency', label: 'Efisiensi anggaran', weight: 25, value: efficiency },
      { key: 'emergency', label: 'Kebiasaan dana darurat', weight: 20, value: emergency },
      { key: 'education', label: 'Partisipasi edukasi', weight: 20, value: education }
    ];
    var weighted = factors.reduce(function (a, f) { return a + f.weight * f.value; }, 0) / 100;
    var score = Math.round(300 + 550 * (weighted / 100) + 1.8 * s.saving.days);
    score = A.clamp(score, 300, 850);
    var label = 'Needs Improvement';
    if (score >= 800) label = 'Excellent';
    else if (score >= 740) label = 'Very Good';
    else if (score >= 670) label = 'Good';
    else if (score >= 580) label = 'Fair';
    return { score: score, label: label, factors: factors };
  };

  calc.tier = function (points) {
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 250) return 'Silver';
    return 'Bronze';
  };

  calc.badges = function (s) {
    return [
      { id: 'starter', icon: '🏅', name: 'Smart Starter', desc: 'Menyelesaikan profil finansial', unlocked: true },
      {
        id: 'keeper', icon: '🎯', name: 'Budget Keeper', desc: 'Mencapai target anggaran',
        unlocked: calc.expenses(s) > 0 && calc.overCategories(s).length === 0
      },
      {
        id: 'seeker', icon: '📚', name: 'Knowledge Seeker', desc: 'Menyelesaikan edukasi',
        unlocked: calc.modulesDone(s) === Object.keys(MODULES).length && s.quiz.correct
      },
      { id: 'streak', icon: '🌱', name: 'Saving Streak', desc: 'Menabung konsisten', unlocked: s.saving.days >= 7 }
    ];
  };

  // peringatan pintar untuk halaman Protection
  calc.alerts = function (s) {
    var list = [];
    calc.categories(s).forEach(function (c) {
      if (c.level === 'over') {
        list.push({ level: 'danger', badge: 'Perlu tindakan', title: '⚠ Anggaran ' + c.name + ' terlampaui',
          text: 'Pengeluaran ' + A.rp(c.spent) + ' melewati batas ' + A.rp(c.limit) + '.' });
      } else if (c.level === 'warn') {
        list.push({ level: 'warn', badge: 'Waspada', title: '⚠ Anggaran ' + c.name + ' hampir habis',
          text: 'Sudah terpakai ' + c.pct + '% dari batas ' + A.rp(c.limit) + '.' });
      }
    });
    if (calc.usedPct(s) >= 100 && !list.some(function (a) { return a.level === 'danger'; })) {
      list.unshift({ level: 'danger', badge: 'Perlu tindakan', title: '⚠ Total anggaran terlampaui',
        text: 'Total pengeluaran sudah mencapai batas anggaran bulanan.' });
    }
    if (calc.balance(s) < 0) {
      list.unshift({ level: 'danger', badge: 'Perlu tindakan', title: '⚠ Saldo negatif',
        text: 'Pengeluaran lebih besar dari pemasukan yang tercatat.' });
    }
    if (!list.length) {
      list.push({ level: 'ok', badge: 'Healthy', title: '✓ Kondisi anggaran terkendali',
        text: 'Belum ada indikasi pengeluaran melewati batas anggaran total.' });
    }
    return list;
  };

  calc.checklist = function (s) {
    var txCount = s.transactions.length;
    return [
      { id: 'budget', text: 'Anggaran bulanan sudah disusun', done: calc.budgetTotal(s) > 0, auto: true },
      { id: 'limit', text: 'Pengeluaran masih di bawah batas tiap kategori', done: calc.overCategories(s).length === 0, auto: true },
      { id: 'record', text: 'Mencatat minimal 3 transaksi bulan ini', done: txCount >= 3, auto: true },
      { id: 'saving', text: 'Menyisihkan dana darurat hari ini', done: calc.savedToday(s), auto: true },
      { id: 'legal', text: 'Memeriksa legalitas, biaya, dan ketentuan sebelum mengajukan pembiayaan', done: !!s.checklist.legal, auto: false }
    ];
  };

  /* ---------- aksi (semua perubahan data lewat sini) ---------- */
  function addPoints(s, n) { s.points += n; }

  var actions = {};

  actions.addTransaction = function (data) {
    var name = String(data.name || '').trim();
    var amount = Math.round(Number(data.amount));
    var type = data.type === 'income' ? 'income' : 'expense';
    var cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
    var category = cats.indexOf(data.category) >= 0 ? data.category : cats[0];

    if (!name) return { ok: false, field: 'name', msg: 'Nama transaksi wajib diisi.' };
    if (name.length > 60) return { ok: false, field: 'name', msg: 'Nama transaksi maksimal 60 karakter.' };
    if (!isFinite(amount) || amount <= 0) return { ok: false, field: 'amount', msg: 'Nominal harus berupa angka lebih dari 0.' };
    if (amount > 1000000000) return { ok: false, field: 'amount', msg: 'Nominal terlalu besar untuk simulasi ini.' };
    if (type === 'expense' && amount > calc.balance(state)) {
      return { ok: false, field: 'amount', msg: 'Pengeluaran melebihi saldo tersedia (' + A.rp(calc.balance(state)) + ').' };
    }

    var ts = Date.now();
    store.update(function (s) {
      s.transactions.unshift({ id: 't' + ts + Math.random().toString(36).slice(2, 6), type: type, category: category, name: name, amount: amount, ts: ts });
    });
    return { ok: true };
  };

  actions.deleteTransaction = function (id) {
    store.update(function (s) {
      s.transactions = s.transactions.filter(function (t) { return t.id !== id; });
    });
  };

  actions.setBudgets = function (values) {
    var clean = {};
    for (var i = 0; i < EXPENSE_CATS.length; i++) {
      var c = EXPENSE_CATS[i];
      var v = Math.round(Number(values[c]));
      if (!isFinite(v) || v < 0 || v > 1000000000) return { ok: false, msg: 'Batas anggaran ' + c + ' tidak valid.' };
      clean[c] = v;
    }
    store.update(function (s) { s.budgets = clean; });
    return { ok: true };
  };

  actions.answerQuiz = function (opt) {
    if (!QUIZ.options[opt] || state.quiz.correct) return { ok: false };
    var right = opt === QUIZ.correct;
    var bonus = right && !state.awards.quiz;
    store.update(function (s) {
      s.quiz.answer = opt;
      s.quiz.correct = right;
      if (bonus) { s.awards.quiz = true; addPoints(s, 20); }
    });
    return { ok: true, correct: right, bonus: bonus };
  };

  actions.completeModule = function (id) {
    if (!MODULES[id] || state.modules[id]) return { ok: false };
    store.update(function (s) {
      s.modules[id] = true;
      if (!s.awards.modules[id]) { s.awards.modules[id] = true; addPoints(s, 10); }
    });
    return { ok: true };
  };

  actions.recordSaving = function () {
    if (calc.savedToday(state)) return { ok: false, msg: 'Tabungan hari ini sudah dicatat.' };
    if (state.saving.days >= 7) return { ok: false, msg: 'Tantangan 7 hari sudah selesai.' };
    var done = false;
    store.update(function (s) {
      s.saving.days += 1;
      s.saving.last = A.dateKey();
      addPoints(s, 5);
      if (s.circle.joined) s.circle.contrib += 1;
      if (s.saving.days >= 7 && !s.awards.challenge) { s.awards.challenge = true; addPoints(s, 50); done = true; }
    });
    return { ok: true, completed: done };
  };

  actions.toggleCircle = function () {
    var joined;
    store.update(function (s) { s.circle.joined = !s.circle.joined; joined = s.circle.joined; if (!joined) s.circle.contrib = 0; });
    return { joined: joined };
  };

  actions.toggleChecklist = function (key) {
    if (key !== 'legal') return;
    store.update(function (s) { s.checklist.legal = !s.checklist.legal; });
  };

  actions.selectFacility = function (id) {
    if (!FACILITIES[id]) return;
    store.update(function (s) { s.selectedFacility = id; });
  };

  actions.submitApplication = function (data) {
    var amount = Math.round(Number(data.amount));
    var purpose = String(data.purpose || '').trim();
    if (!isFinite(amount) || amount <= 0) return { ok: false, field: 'amount', msg: 'Nominal pengajuan harus lebih dari 0.' };
    if (amount > 1000000000) return { ok: false, field: 'amount', msg: 'Nominal terlalu besar untuk simulasi ini.' };
    if (!purpose) return { ok: false, field: 'purpose', msg: 'Tujuan pengajuan wajib diisi.' };
    if (!data.consent) return { ok: false, field: 'consent', msg: 'Centang persetujuan penggunaan data untuk melanjutkan.' };
    var ts = Date.now();
    store.update(function (s) {
      s.applications.unshift({
        id: 'a' + ts, facility: s.selectedFacility, amount: amount, purpose: purpose,
        notes: String(data.notes || '').trim(), stage: 0, ts: ts
      });
    });
    return { ok: true };
  };

  actions.advanceApplication = function (id) {
    store.update(function (s) {
      s.applications.forEach(function (a) { if (a.id === id && a.stage < STAGES.length - 1) a.stage += 1; });
    });
  };

  actions.cancelApplication = function (id) {
    store.update(function (s) {
      s.applications = s.applications.filter(function (a) { return a.id !== id; });
    });
  };

  A.store = store;
  A.calc = calc;
  A.actions = actions;
  A.data = { EXPENSE_CATS: EXPENSE_CATS, INCOME_CATS: INCOME_CATS, FACILITIES: FACILITIES, MODULES: MODULES, QUIZ: QUIZ, STAGES: STAGES };
})(window.ANOA);
