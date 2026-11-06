import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

// Halaman perantara: arahkan pengguna ke dashboard sesuai perannya.
export default async function Arah() {
  const session = await getSession();
  if (!session) redirect('/login');
  redirect(session.user.role === 'ADMIN' ? '/admin/dashboard' : '/pelanggan/dashboard');
}
