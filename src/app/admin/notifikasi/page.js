import Link from 'next/link';
import { requireRole } from '@/lib/session';
import { notifAdmin } from '@/lib/notifikasi';
import DaftarNotif from '@/components/DaftarNotif';

export const dynamic = 'force-dynamic';

export default async function NotifikasiAdmin() {
  const session = await requireRole('ADMIN');
  const items = await notifAdmin();
  return (
    <main className="page">
      <div className="crumb"><Link href="/admin/dashboard">Dashboard</Link><span>/</span><b style={{ color: 'var(--ink)' }}>Notifikasi</b></div>
      <div className="row sp">
        <div className="col g8"><h1>Notifikasi</h1><p className="mut">Aktivitas pelanggan terbaru: pesanan masuk, bukti pembayaran, dan keputusan penawaran.</p></div>
        <Link className="btn" href="/admin/dashboard#tindakan">Lihat yang perlu tindakan</Link>
      </div>
      <section className="card p0"><DaftarNotif items={items} kunci={`admin-${session.user.id}`} /></section>
    </main>
  );
}
