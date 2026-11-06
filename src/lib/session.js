import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export async function getSession() {
  return getServerSession(authOptions);
}

// Dipakai di halaman/layout: jika belum login atau perannya salah, arahkan pergi.
export async function requireRole(role) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role !== role) redirect('/arah');
  return session;
}

export function rupiah(angka) {
  if (angka === null || angka === undefined) return '-';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}
