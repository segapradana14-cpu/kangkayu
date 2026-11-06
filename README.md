# KangKayu - Pemesanan Custom Furniture

Aplikasi web pemesanan custom furniture untuk tugas mata kuliah Pemrograman Web Berbasis Framework.
Dibuat dengan Next.js 14 (App Router), Prisma, MySQL, dan Auth.js (next-auth).

## Yang dibutuhkan
- Node.js 18.17 atau lebih baru
- MySQL aktif di laptop (XAMPP, Laragon, atau Docker)

## Langkah menjalankan
1. Pasang paket:
   ```
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu sesuaikan:
   - `DATABASE_URL` : alamat MySQL. Contoh XAMPP tanpa password: `mysql://root:@localhost:3306/kayukita`
   - `NEXTAUTH_URL` : `http://localhost:3000`
   - `NEXTAUTH_SECRET` : teks acak panjang (jangan dibiarkan berisi teks contoh)
3. Buat database kosong dengan nama yang sama seperti di `DATABASE_URL`.
4. Buat tabel dan isi data awal:
   ```
   npx prisma db push
   npm run db:seed
   ```
5. Jalankan:
   ```
   npm run dev
   ```
   Buka http://localhost:3000

## Akun contoh (dari seed)
| Peran | Email | Password |
|---|---|---|
| Admin | admin@kayukita.test | admin12345 |
| Pelanggan | andi@email.com | password123 |

Untuk menguji dua peran bersamaan, pakai satu jendela biasa dan satu jendela Incognito,
karena sesi login disimpan di cookie yang dipakai bersama oleh semua tab satu browser.

## Fitur
**Publik:** Beranda, Katalog (filter kategori dan urutan), Daftar, Masuk.

**Pelanggan:** Dashboard (pelunasan segera, progres produksi), Katalog, Buat Pesanan
(termasuk kartu produk terpilih dari katalog), Pesanan Saya, Detail Pesanan
(setujui atau tolak penawaran), Pembayaran (unggah bukti DP dan pelunasan), Profil.

**Admin:** Dashboard (ringkasan dan grafik pendapatan), Pesanan Masuk (tinjau, penawaran,
tolak atau batalkan), Verifikasi Pembayaran, Produksi (papan status dan update progres),
Katalog Produk (tambah, ubah, hapus, foto), Laporan (cetak dan ekspor CSV).

## Alur status pesanan
Menunggu Tinjauan, lalu Menunggu Persetujuan (penawaran admin), Menunggu DP, Dalam Produksi,
Menunggu Pelunasan, Siap Diantar, dan Selesai. Pesanan juga bisa berakhir Ditolak atau Dibatalkan.

## Struktur folder
- `prisma/schema.prisma` : 5 tabel (users, products, orders, payments, order_status_logs)
- `prisma/seed.js` : data awal (admin, pelanggan contoh, 8 produk)
- `src/lib/` : auth, sesi, akses peran, upload gambar, opsi form, status, laporan
- `src/middleware.js` : melindungi halaman /pelanggan dan /admin
- `src/components/` : sidebar, bilah atas, ikon, komponen katalog dan riwayat status
- `src/app/pelanggan`, `src/app/admin` : area pelanggan dan admin (server action ada di `actions.js` tiap fitur)
- `src/app/kk.css` : gaya dari prototype
- `public/uploads/` : foto referensi, bukti transfer, dan foto produk (tidak ikut git)

## Catatan
- Pembayaran memakai transfer manual: pelanggan unggah bukti, admin memverifikasi.
- Isi `[NAMA BANK]`, `[NO. REKENING]`, dan kontak workshop di `src/app/pelanggan/pembayaran/page.js`
  dan `src/app/page.js` dengan data usaha yang sebenarnya.
