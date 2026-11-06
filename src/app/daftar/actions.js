'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Dipanggil oleh form registrasi. Mengembalikan { error } jika data tidak valid.
export async function daftarAkun(state, formData) {
  const nama = String(formData.get('nama') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const noHp = String(formData.get('noHp') || '').trim();
  const alamat = String(formData.get('alamat') || '').trim();
  const password = String(formData.get('password') || '');
  const ulangi = String(formData.get('ulangi') || '');

  if (!nama || !email || !noHp || !alamat || !password) {
    return { error: 'Semua kolom wajib diisi.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'Format email tidak valid.' };
  }
  if (password.length < 8) {
    return { error: 'Password minimal 8 karakter.' };
  }
  if (password !== ulangi) {
    return { error: 'Kedua password tidak sama.' };
  }

  const sudahAda = await prisma.user.findUnique({ where: { email } });
  if (sudahAda) {
    return { error: 'Email ini sudah terdaftar. Gunakan email lain atau masuk.' };
  }

  await prisma.user.create({
    data: { nama, email, noHp, alamat, password: await bcrypt.hash(password, 10), role: 'PELANGGAN' },
  });

  redirect('/login?daftar=ok');
}
