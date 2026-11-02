# Tahap 1 — Analisis Prototipe ANOA FIN

Sumber: 7 screenshot prototipe (Dashboard, My Finance, Reputation, Protection, Intelligence, Growth, Financial Access).

## Komponen global (muncul di semua halaman)

| Komponen | Fungsi |
|---|---|
| Header gelap "ANOA FIN. / STUDENT FINANCIAL ECOSYSTEM" | Identitas aplikasi; sisi kanan menampilkan "UHO STUDENT · Demo Account · 2026" |
| Bilah navigasi pil (7 tab) | Berpindah halaman; tab aktif berwarna hijau tua; dapat digulir horizontal di layar sempit |
| Footer disclaimer | "Prototype Demonstration · Bukan layanan pinjaman atau lembaga keuangan" |

Catatan: pada screenshot, judul halaman (mis. "My Finance") dan label formulir tampak hampir tidak terbaca (teks terang di atas latar krem, kemungkinan animasi fade-in yang tidak selesai). Pada implementasi, elemen ini dibuat terbaca penuh.

## Daftar fitur per halaman

### 1. Dashboard
- **Hero "Financial Overview"**: saldo tersedia, total pemasukan, total pengeluaran; tombol "Manage my finance →" menuju My Finance.
- **Financial Snapshot** (3 kartu): skor ANOA Reputation (745/850 + label), Budget Used (%), Saving Streak (hari).
- **Your Financial Journey** (6 kartu pintasan) menuju semua modul.
- **Recent Activity**: 3 transaksi terakhir.
- Catatan: seluruh angka adalah data simulasi.

### 2. My Finance
- **Ringkasan** (Available Balance, Total Income, Total Expenses) + pil periode "November 2026".
- **Add Transaction**: tipe (Pengeluaran/Pemasukan), kategori, nama, nominal, tombol "+ Save Transaction".
- **Monthly Budget Allocation**: 5 kategori (Makanan, Transportasi, Akademik, Komunikasi, Hiburan), bar progres, "% digunakan", total budget.
- **Transaction History**: daftar transaksi (+ hijau untuk pemasukan, − untuk pengeluaran).

### 3. Reputation
- **Illustrative Financial Score** 300–850 dengan label (Very Good).
- **Indicative Assessment Factors**: 4 faktor berbobot (Ketepatan pembayaran 35%, Efisiensi anggaran 25%, Kebiasaan dana darurat 20%, Partisipasi edukasi 20%).
- **How it works** (penjelasan + kebijakan: IPK/kehadiran/organisasi bukan ukuran kemampuan membayar).
- Tombol "Explore Financial Access →".

### 4. Protection
- **Monthly spending monitor**: persentase pengeluaran vs total batas anggaran + status (Terkendali).
- **Smart Alerts**: kondisi anggaran (Healthy) + "Emergency fund reminder" dengan tombol "Review my budget".
- **Financial Safety Checklist**: kartu kosong di prototipe → diimplementasikan sebagai daftar periksa interaktif.

### 5. Intelligence
- Hero "Small habits. Stronger future."
- **Learning Modules** (Smart Budgeting, Responsible Financing, Emergency Fund).
- **Knowledge Challenge**: kuis 1 soal, pilihan A/B/C, umpan balik "Benar! … +20 poin reward".

### 6. Growth
- **Reward Points** (320 PTS), tingkat keanggotaan (Silver), streak 5 hari.
- **Achievement Badges** (Smart Starter, Budget Keeper — terbuka; Knowledge Seeker, Saving Streak — terkunci).
- **Monthly Challenges**: 7-Day Saving Challenge (5/7), tombol "+ Record saving today".
- **Teman Keuangan**: UHO Saving Circle (8 anggota, target bersama Rp 500.000, progres 65%), tombol "Join Saving Circle".

### 7. Financial Access
- **3 fasilitas**: Student Emergency Assistance Fund, Flexible UKT Installment Plan, Student Micro-Entrepreneurship Financing — tombol "Explore facility →".
- **Application Center**: formulir (nominal, tujuan, keterangan, persetujuan data) + "Submit Simulation →"; fasilitas terpilih ditandai "SELECTED".
- **Application Tracking**: status pengajuan (awal: "Belum ada pengajuan…").
- **Important information**: pernyataan bahwa ANOA FIN bukan pemberi pinjaman.

## Interaksi yang diimplementasikan

| Interaksi | Dampak |
|---|---|
| Simpan transaksi | Saldo, pemasukan/pengeluaran, bar anggaran, riwayat, Dashboard, % Budget Used, status Protection, skor Reputation ikut berubah |
| Hapus transaksi | Semua angka di atas dihitung ulang |
| Ubah batas anggaran | Total budget, %, alert, skor efisiensi anggaran berubah |
| Jawab kuis | Benar → +20 poin (sekali), faktor edukasi naik |
| Tandai modul selesai | +10 poin per modul, faktor edukasi naik |
| Record saving today | Hari 5/7 → 6/7 → 7/7, streak, poin, faktor dana darurat, checklist |
| Join Saving Circle | Anggota 8 → 9, progres kelompok naik tiap catatan menabung |
| Pilih fasilitas | Application Center berganti judul/deskripsi + tanda SELECTED |
| Submit Simulation | Pengajuan masuk Application Tracking dan dapat disimulasikan tahapnya |
| Reset data demo | Mengembalikan semua data ke kondisi awal prototipe |
