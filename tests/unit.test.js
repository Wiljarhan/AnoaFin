/* Uji logika ANOA FIN (tanpa dependensi).
   Jalankan:  node tests/unit.test.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeEnv() {
  const mem = {};
  const window = {
    localStorage: {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    }
  };
  window.window = window;
  const ctx = vm.createContext(window);
  ['utils.js', 'store.js'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
  });
  return window.ANOA;
}

let pass = 0, fail = 0;
function eq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + '\n       expected: ' + JSON.stringify(expected) + '\n       actual:   ' + JSON.stringify(actual)); }
}

/* ---------- format ---------- */
let A = makeEnv();
console.log('Format');
eq('rp 1250000', A.rp(1250000), 'Rp 1.250.000');
eq('rp 0', A.rp(0), 'Rp 0');
eq('rp negatif', A.rp(-5000), '−Rp 5.000');
eq('signed income', A.signed('income', 1500000), '+Rp 1.500.000');
eq('signed expense', A.signed('expense', 60000), '−Rp 60.000');
eq('esc', A.esc('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');

/* ---------- data awal = angka prototipe ---------- */
console.log('Data awal (sesuai prototipe)');
A = makeEnv();
let s = A.store.get(), c = A.calc;
eq('saldo', c.balance(s), 1250000);
eq('pemasukan', c.income(s), 1500000);
eq('pengeluaran', c.expenses(s), 250000);
eq('total budget', c.budgetTotal(s), 1050000);
eq('budget used %', c.usedPct(s), 24);
eq('persen kategori', c.categories(s).map((x) => x.pct), [33, 30, 27, 0, 0]);
eq('skor reputasi', c.reputation(s).score, 745);
eq('label reputasi', c.reputation(s).label, 'Very Good');
eq('faktor', c.reputation(s).factors.map((f) => f.value), [82, 78, 65, 90]);
eq('poin / tier', [s.points, c.tier(s.points)], [320, 'Silver']);
eq('streak', s.saving.days, 5);
eq('status', c.status(s).label, 'Terkendali');
eq('badge terbuka', c.badges(s).map((b) => b.unlocked), [true, true, false, false]);
eq('alert sehat', c.alerts(s).map((a) => a.level), ['ok']);

/* ---------- transaksi ---------- */
console.log('Transaksi');
let r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: 'Makan siang', amount: '25000' });
s = A.store.get();
eq('tambah pengeluaran ok', r.ok, true);
eq('saldo berkurang', c.balance(s), 1225000);
eq('makanan terpakai', c.spentBy(s, 'Makanan'), 175000);
eq('persen makanan', c.categories(s)[0].pct, 39);
eq('budget used naik', c.usedPct(s), 26);
r = A.actions.addTransaction({ type: 'income', category: 'Beasiswa', name: 'Beasiswa', amount: 500000 });
eq('tambah pemasukan ok', r.ok, true);
eq('saldo naik', c.balance(A.store.get()), 1725000);
eq('transaksi terbaru paling atas', A.store.get().transactions[0].name, 'Beasiswa');

r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: '', amount: 1000 });
eq('nama kosong ditolak', [r.ok, r.field], [false, 'name']);
r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: 'x', amount: 0 });
eq('nominal 0 ditolak', [r.ok, r.field], [false, 'amount']);
r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: 'x', amount: -5 });
eq('nominal negatif ditolak', r.ok, false);
r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: 'x', amount: 'abc' });
eq('nominal bukan angka ditolak', r.ok, false);
r = A.actions.addTransaction({ type: 'expense', category: 'Makanan', name: 'Mewah', amount: 99999999 });
eq('melebihi saldo ditolak', r.ok, false);

const before = A.store.get().transactions.length;
A.actions.deleteTransaction(A.store.get().transactions[0].id);
eq('hapus transaksi', A.store.get().transactions.length, before - 1);

/* ---------- anggaran & alert ---------- */
console.log('Anggaran dan peringatan');
A = makeEnv(); c = A.calc;
A.actions.addTransaction({ type: 'expense', category: 'Hiburan', name: 'Nonton', amount: 130000 });
s = A.store.get();
eq('hiburan 87% = waspada', c.categories(s)[4].level, 'warn');
eq('status waspada', c.status(s).label, 'Waspada');
A.actions.addTransaction({ type: 'expense', category: 'Hiburan', name: 'Game', amount: 30000 });
s = A.store.get();
eq('hiburan lewat batas', c.categories(s)[4].level, 'over');
eq('status melebihi', c.status(s).label, 'Melebihi batas');
eq('budget keeper hilang', c.badges(s)[1].unlocked, false);
eq('alert danger muncul', c.alerts(s).some((a) => a.level === 'danger'), true);
const rep1 = c.reputation(s).factors[1].value;
eq('efisiensi anggaran turun', rep1 < 78, true);
r = A.actions.setBudgets({ Makanan: 450000, Transportasi: 200000, Akademik: 150000, Komunikasi: 100000, Hiburan: 300000 });
eq('ubah budget ok', r.ok, true);
eq('total budget baru', c.budgetTotal(A.store.get()), 1200000);
eq('hiburan kembali aman', c.categories(A.store.get())[4].level, 'ok');
r = A.actions.setBudgets({ Makanan: -1, Transportasi: 1, Akademik: 1, Komunikasi: 1, Hiburan: 1 });
eq('budget negatif ditolak', r.ok, false);

/* ---------- kuis & modul ---------- */
console.log('Kuis dan modul');
A = makeEnv(); c = A.calc;
r = A.actions.answerQuiz('A');
eq('jawaban salah', [r.ok, r.correct, A.store.get().points], [true, false, 320]);
r = A.actions.answerQuiz('B');
eq('jawaban benar +20', [r.correct, r.bonus, A.store.get().points], [true, true, 340]);
r = A.actions.answerQuiz('A');
eq('terkunci setelah benar', [r.ok, A.store.get().points], [false, 340]);
A.actions.completeModule('budgeting');
A.actions.completeModule('budgeting');
eq('modul hanya sekali +10', A.store.get().points, 350);
eq('faktor edukasi', c.reputation(A.store.get()).factors[3].value, 97);
eq('knowledge seeker belum', c.badges(A.store.get())[2].unlocked, false);
A.actions.completeModule('financing');
A.actions.completeModule('emergency');
eq('knowledge seeker terbuka', c.badges(A.store.get())[2].unlocked, true);
eq('faktor edukasi maksimal 100', c.reputation(A.store.get()).factors[3].value, 100);

/* ---------- menabung & tantangan ---------- */
console.log('Menabung');
A = makeEnv(); c = A.calc;
A.actions.toggleCircle();
r = A.actions.recordSaving();
s = A.store.get();
eq('catat hari ke-6', [r.ok, s.saving.days], [true, 6]);
eq('poin +5', s.points, 325);
eq('hari ini tercatat', c.savedToday(s), true);
eq('kontribusi lingkaran', s.circle.contrib, 1);
r = A.actions.recordSaving();
eq('tidak bisa dua kali sehari', [r.ok, A.store.get().saving.days], [false, 6]);
// simulasikan hari berikutnya
A.store.update((st) => { st.saving.last = '2000-01-01'; });
r = A.actions.recordSaving();
s = A.store.get();
eq('hari ke-7 selesai', [r.ok, r.completed, s.saving.days], [true, true, 7]);
eq('bonus tantangan', s.points, 325 + 5 + 50);
eq('badge streak terbuka', c.badges(s)[3].unlocked, true);
A.store.update((st) => { st.saving.last = '2000-01-01'; });
r = A.actions.recordSaving();
eq('lewat 7 hari ditolak', r.ok, false);
eq('skor maksimal terbatas 850', c.reputation(s).score <= 850, true);
A.actions.toggleCircle();
eq('keluar lingkaran reset kontribusi', A.store.get().circle.contrib, 0);

/* ---------- pengajuan ---------- */
console.log('Pengajuan pembiayaan');
A = makeEnv();
r = A.actions.submitApplication({ amount: '', purpose: 'x', consent: true });
eq('nominal kosong ditolak', [r.ok, r.field], [false, 'amount']);
r = A.actions.submitApplication({ amount: 500000, purpose: '  ', consent: true });
eq('tujuan kosong ditolak', [r.ok, r.field], [false, 'purpose']);
r = A.actions.submitApplication({ amount: 500000, purpose: 'Biaya berobat', consent: false });
eq('tanpa persetujuan ditolak', [r.ok, r.field], [false, 'consent']);
A.actions.selectFacility('ukt');
r = A.actions.submitApplication({ amount: 2500000, purpose: 'Cicilan UKT', notes: 'catatan', consent: true });
s = A.store.get();
eq('pengajuan tersimpan', [r.ok, s.applications.length, s.applications[0].facility, s.applications[0].stage], [true, 1, 'ukt', 0]);
const id = s.applications[0].id;
A.actions.advanceApplication(id); A.actions.advanceApplication(id); A.actions.advanceApplication(id); A.actions.advanceApplication(id);
eq('tahap maksimal 3', A.store.get().applications[0].stage, 3);
A.actions.cancelApplication(id);
eq('batalkan pengajuan', A.store.get().applications.length, 0);
A.actions.selectFacility('tidak-ada');
eq('fasilitas tak dikenal diabaikan', A.store.get().selectedFacility, 'ukt');

/* ---------- penyimpanan ---------- */
console.log('Penyimpanan');
A = makeEnv();
A.actions.addTransaction({ type: 'expense', category: 'Akademik', name: 'Buku', amount: 10000 });
const saved = A.store.get().transactions.length;
A.store.reload();
eq('reload membaca localStorage', A.store.get().transactions.length, saved);
A.store.reset();
eq('reset kembali ke data awal', [A.store.get().transactions.length, A.calc.balance(A.store.get())], [4, 1250000]);

console.log('\n' + pass + ' lulus, ' + fail + ' gagal');
process.exit(fail ? 1 : 0);
