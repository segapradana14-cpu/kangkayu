import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export async function wajibAdmin() {
  const s = await getSession();
  if (!s || s.user.role !== 'ADMIN') redirect('/login');
  return s;
}

export async function wajibPelanggan() {
  const s = await getSession();
  if (!s || s.user.role !== 'PELANGGAN') redirect('/login');
  return s;
}

// "12.500.000" atau "12500000" menjadi angka 12500000.
export function angka(teks) {
  const n = Number(String(teks || '').replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
