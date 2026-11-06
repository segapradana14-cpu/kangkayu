import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const session = await requireRole('ADMIN');
  const [akun, baru, verifikasi, produksi] = await Promise.all([
    prisma.user.findUnique({ where: { id: Number(session.user.id) }, select: { nama: true } }),
    prisma.order.count({ where: { status: 'MENUNGGU_TINJAUAN' } }),
    prisma.payment.count({ where: { status: 'MENUNGGU_VERIFIKASI' } }),
    prisma.order.count({ where: { status: 'DALAM_PRODUKSI' } }),
  ]);

  const menu = [
    { label: 'Operasional' },
    { href: '/admin/dashboard', text: 'Dashboard', icon: 'home' },
    { href: '/admin/pesanan', text: 'Pesanan Masuk', icon: 'inbox', badge: baru || null, kunci: 'pesanan' },
    { href: '/admin/pembayaran', text: 'Verifikasi Pembayaran', icon: 'cek', badge: verifikasi || null, kunci: 'pembayaran' },
    { href: '/admin/produksi', text: 'Produksi', icon: 'kubus', badge: produksi || null, kunci: 'produksi' },
    { label: 'Data' },
    { href: '/admin/katalog', text: 'Katalog Produk', icon: 'grid' },
    { href: '/admin/laporan', text: 'Laporan', icon: 'chart' },
    { label: 'Akun' },
    { href: '/admin/profil', text: 'Profil Saya', icon: 'user' },
  ];

  return (
    <div className="app">
      <Sidebar items={menu} nama={akun?.nama || session.user.name} peran="Pemilik usaha" admin />
      <div className="main">
        <TopBar admin cariAksi="/admin/pesanan" placeholder="Cari kode pesanan atau pelanggan" adaNotif={baru + verifikasi > 0} />
        {children}
      </div>
    </div>
  );
}
