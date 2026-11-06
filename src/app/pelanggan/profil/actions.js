'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { wajibPelanggan } from '@/lib/akses';

export async function simpanProfil(state, formData) {
  const s = await wajibPelanggan();
  const id = Number(s.user.id);
  const nama = String(formData.get('nama') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const noHp = String(formData.get('noHp') || '').trim();
  const alamat = String(formData.get('alamat') || '').trim();

  if (!nama || !email || !noHp || !alamat) return { error: 'Semua kolom wajib diisi.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Format email tidak valid.' };
  const dipakai = await prisma.user.findFirst({ where: { email, NOT: { id } } });
  if (dipakai) return { error: 'Email ini sudah dipakai akun lain.' };

  await prisma.user.update({ where: { id }, data: { nama, email, noHp, alamat } });
  revalidatePath('/pelanggan', 'layout');
  return { ok: 'Data diri berhasil disimpan.' };
}

export async function gantiPassword(state, formData) {
  const s = await wajibPelanggan();
  const lama = String(formData.get('lama') || '');
  const baru = String(formData.get('baru') || '');
  const ulangi = String(formData.get('ulangi') || '');

  const u = await prisma.user.findUnique({ where: { id: Number(s.user.id) } });
  if (!u || !(await bcrypt.compare(lama, u.password))) return { error: 'Password lama salah.' };
  if (baru.length < 8) return { error: 'Password baru minimal 8 karakter.' };
  if (baru !== ulangi) return { error: 'Kedua password baru tidak sama.' };

  await prisma.user.update({ where: { id: u.id }, data: { password: await bcrypt.hash(baru, 10) } });
  return { ok: 'Password berhasil diubah.' };
}
