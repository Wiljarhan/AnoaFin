# Tahap 2 — Arsitektur

## Pilihan teknologi
Situs statis murni (HTML + CSS + JavaScript biasa, tanpa build, tanpa backend). Alasannya: langsung jalan di VS Code (Live Server atau buka `index.html`) dan di GitHub Pages. Data disimpan di `localStorage` browser. Tidak ada MySQL/PHP karena GitHub Pages hanya melayani file statis.

Skrip dimuat sebagai *classic script* (bukan ES module) agar tetap jalan saat `index.html` dibuka langsung lewat `file://`.

## Struktur file

```
anoa-fin/
├── index.html            # kerangka: header, navigasi, <main>, footer, toast
├── .nojekyll             # agar GitHub Pages tidak memproses dengan Jekyll
├── css/style.css         # seluruh gaya (token warna, komponen, responsif)
├── js/
│   ├── utils.js          # format Rupiah, escape HTML, toast, tanggal
│   ├── store.js          # state + localStorage + perhitungan (calc) + aksi (actions)
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── finance.js
│   │   ├── reputation.js
│   │   ├── protection.js
│   │   ├── intelligence.js
│   │   ├── growth.js
│   │   └── access.js
│   └── app.js            # router hash, navigasi, render ulang otomatis
├── tests/unit.test.js    # uji logika (Node, tanpa dependensi)
├── docs/                 # dokumen analisis & arsitektur
└── README.md
```

## Alur navigasi
Routing berbasis hash: `#dashboard`, `#finance`, `#reputation`, `#protection`, `#intelligence`, `#growth`, `#access`. Hash tidak dikenal atau kosong → `#dashboard`. Hash dipilih karena GitHub Pages tidak punya fallback server untuk URL bersih.

```
Dashboard ──Manage my finance──► Finance
Dashboard ──6 kartu Journey────► semua halaman
Reputation ─Explore Financial Access─► Access
Protection ─Review my budget───► Finance (bagian anggaran)
```

## Model data (satu sumber kebenaran: `store.js`)

```
state = {
  transactions[]  {id, type, category, name, amount, ts}
  budgets         {Makanan, Transportasi, Akademik, Komunikasi, Hiburan}
  points, awards  {quiz, challenge, modules{}}
  quiz            {answer, correct}
  modules         {budgeting, financing, emergency}
  saving          {days, last}
  circle          {joined, contrib}
  checklist       {legal}
  applications[]  {id, facility, amount, purpose, notes, stage, ts}
  selectedFacility
}
```

## Hubungan data antarfitur

```
transactions + budgets ─► calc.income / expenses / balance
                       ─► calc.usedPct ─► Dashboard, Protection (monitor, alert)
                       ─► calc.overCategories ─► badge Budget Keeper, checklist
                       ─► factor "Efisiensi anggaran" ─► skor Reputation
saving.days ─► streak (Dashboard, Growth) ─► faktor "Dana darurat" ─► Reputation
modules + quiz ─► faktor "Partisipasi edukasi" ─► Reputation, badge Knowledge Seeker
points ─► tingkat keanggotaan (Bronze/Silver/Gold/Platinum)
Reputation ─► hasil simulasi di Application Tracking
```

Rumus skor: `300 + 550 × (Σ bobot × nilai faktor) / 100 + 1,8 × hari streak`, dibatasi 300–850. Pada data awal: faktor 82/78/65/90 → 745 (Very Good), sesuai prototipe.

## Pembaruan otomatis
1. Semua perubahan lewat `store.update(...)` → simpan ke `localStorage` → memanggil seluruh subscriber.
2. `app.js` berlangganan dan merender ulang halaman aktif (posisi gulir dipertahankan).
3. Event `storage` menyinkronkan tab browser lain.
4. Perhitungan tidak disimpan; selalu diturunkan dari state, sehingga tidak ada angka yang bisa basi.
