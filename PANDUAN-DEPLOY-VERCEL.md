# Panduan deploy KangKayu ke Vercel

Arsitektur: **Vercel** (website) + **Aiven MySQL** (database) + **Vercel Blob** (foto).

## A. Siapkan akun (gratis)
1. GitHub: https://github.com
2. Vercel: https://vercel.com (masuk dengan GitHub)
3. Aiven: https://aiven.io (buat 1 layanan MySQL paket gratis)

## B. Database Aiven
1. Di Aiven, buat layanan **MySQL** dengan paket **Free**. Tunggu sampai status *Running*.
2. Buka halaman layanan, salin Host, Port, User, Password, lalu bentuk alamat berikut:
   `mysql://USER:PASSWORD@HOST:PORT/defaultdb?sslaccept=accept_invalid_certs&connection_limit=5`
3. Di laptop, buat file `.env.cloud` (jangan diunggah ke GitHub) berisi `DATABASE_URL="..."` di atas.
4. Buat tabel di database cloud (dari folder proyek):
   - Windows PowerShell: `$env:DATABASE_URL="alamat-di-atas"; npx prisma db push`
   - Lalu buat akun admin: `$env:DATABASE_URL="alamat-di-atas"; npm run db:admin`

## C. Unggah proyek ke GitHub
```
git init
git add .
git commit -m "KangKayu"
git branch -M main
git remote add origin https://github.com/USERNAME/kangkayu.git
git push -u origin main
```
Pastikan `.env` dan `public/uploads` tidak ikut terunggah (sudah ada di `.gitignore`).

## D. Vercel
1. **Add New > Project**, pilih repositori `kangkayu`, Framework otomatis *Next.js*.
2. Sebelum klik Deploy, buka **Environment Variables** lalu isi:
   - `DATABASE_URL` = alamat Aiven (langkah B.2)
   - `NEXTAUTH_SECRET` = teks acak panjang
   - `NEXTAUTH_URL` = `https://NAMA-PROYEK.vercel.app` (bisa diisi setelah alamat final diketahui, lalu Redeploy)
   - JANGAN isi `NEXT_PUBLIC_PENYIMPANAN`.
3. Klik **Deploy**.
4. Setelah proyek ada: tab **Storage > Create > Blob**, hubungkan ke proyek. Variabel `BLOB_READ_WRITE_TOKEN` terisi otomatis. Lalu **Redeploy**.
5. Buka alamat Vercel dan tes alur lengkap.

## E. Catatan
- Data dan foto di laptop tidak ikut pindah. Isi ulang katalog lewat panel admin.
- Aiven gratis bisa dimatikan otomatis bila lama tidak dipakai. Nyalakan lagi dari dasbor Aiven.
- Pengembangan di laptop tetap memakai `.env` dengan `NEXT_PUBLIC_PENYIMPANAN="lokal"`.
