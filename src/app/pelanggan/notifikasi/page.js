import Link from 'next/link';
import { requireRole } from '@/lib/session';
import { notifPelanggan } from '@/lib/notifikasi';
import DaftarNotif from '@/components/DaftarNotif';

export const dynamic = 'force-dynamic';

export default async function Notifikasi() {
  const session = await requireRole('PELANGGAN');
  const items = await notifPelanggan(Number(session.user.id));
  return (
    <main className="page">
      <div className="crumb"><Link href="/pelanggan/dashboard">Dashboard</Link><span>/</span><b style={{ color: 'var(--ink)' }}>Notifikasi</b></div>
      <div className="row sp">
        <div className="col g8"><h1>Notifikasi</h1><p className="mut">Kabar terbaru tentang pesananmu. Klik untuk membuka pesanannya.</p></div>
        <Link className="btn" href="/pelanggan/dashboard#tindakan">Lihat yang perlu tindakan</Link>
      </div>
      <section className="card p0"><DaftarNotif items={items} kunci={`pelanggan-${session.user.id}`} /></section>
    </main>
  );
}
