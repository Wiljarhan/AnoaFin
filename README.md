# ANOA FIN — Student Financial Ecosystem (Prototipe Web)

Prototipe web ANOA FIN untuk LKTI IT Fest UHO (sub tema Teknologi Keuangan). Situs statis (HTML, CSS, JavaScript), tanpa backend dan tanpa proses build. Data disimpan di `localStorage` browser.

> Seluruh angka adalah data simulasi. ANOA FIN bukan pemberi pinjaman dan bukan lembaga keuangan.

## Menjalankan di VS Code
**Cara 1 (disarankan):** pasang ekstensi **Live Server**, klik kanan `index.html` → *Open with Live Server*.
**Cara 2:** buka `index.html` langsung di browser (double-click). Semua fitur tetap berjalan.

## Mengunggah ke GitHub Pages
1. Buat repositori baru di GitHub, lalu unggah **isi** folder ini (`index.html`, `css/`, `js/`, dst.) ke cabang `main`.
2. Di repositori: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pilih `main` dan folder `/ (root)`, lalu Save.
3. Situs aktif di `https://<username>.github.io/<nama-repo>/` setelah beberapa menit.

Semua path bersifat relatif dan navigasi memakai hash (`#finance`, dst.), sehingga aman di subfolder GitHub Pages. File `.nojekyll` sudah disertakan.

## Struktur
```
index.html          kerangka halaman
css/style.css       seluruh gaya
js/utils.js         format Rupiah, escape HTML, toast
js/store.js         state, perhitungan, aksi, localStorage
js/pages/*.js       satu file per halaman (7 halaman)
js/app.js           router dan render ulang otomatis
tests/unit.test.js  uji logika (node tests/unit.test.js)
docs/               analisis fitur dan arsitektur
```

## Fitur utama
- **Dashboard** — saldo, ringkasan, pintasan modul, aktivitas terbaru.
- **My Finance** — tambah/hapus transaksi, anggaran per kategori (dapat diubah), riwayat.
- **Reputation** — skor ilustratif 300–850 dari 4 faktor berbobot.
- **Protection** — monitor pengeluaran, peringatan pintar, checklist keamanan.
- **Intelligence** — modul belajar dan kuis.
- **Growth** — poin, lencana, tantangan menabung 7 hari, Saving Circle.
- **Financial Access** — pilih fasilitas, formulir pengajuan simulasi, pelacakan status.

Perubahan di satu modul otomatis memengaruhi modul lain (lihat `docs/02-arsitektur.md`). Tombol **Reset data demo** di footer mengembalikan data ke kondisi awal.

## Menjalankan uji logika
```
node tests/unit.test.js
```

## Catatan
- Data tersimpan per browser/perangkat. Untuk data lintas perangkat dan akun nyata diperlukan backend (mis. PHP + MySQL), yang tidak dapat berjalan di GitHub Pages.
- Hasil di *Application Tracking* hanyalah simulasi dan tidak menjamin persetujuan atau pencairan dana.
