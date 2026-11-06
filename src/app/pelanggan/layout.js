import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

const AKTIF = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'DALAM_PRODUKSI', 'MENUNGGU_PELUNASAN', 'SIAP_DIANTAR'];
const PERLU_TINDAKAN = ['MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'MENUNGGU_PELUNASAN'];

export default async function PelangganLayout({ children }) {
  const session = await requireRole('PELANGGAN');
  const userId = Number(session.user.id);
  const [pengguna, aktif, tindakan, tagihan] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { nama: true } }),
    prisma.order.count({ where: { userId, status: { in: AKTIF } } }),
    prisma.order.count({ where: { userId, status: { in: PERLU_TINDAKAN } } }),
    // Tagihan DP/pelunasan yang belum dibayar (belum ada bukti yang menunggu verifikasi).
    prisma.order.count({
      where: {
        userId,
        status: { in: ['MENUNGGU_DP', 'MENUNGGU_PELUNASAN'] },
        payments: { none: { status: 'MENUNGGU_VERIFIKASI' } },
      },
    }),
  ]);

  const menu = [
    { label: 'Menu' },
    { href: '/pelanggan/dashboard', text: 'Dashboard', icon: 'home' },
    { href: '/pelanggan/katalog', text: 'Katalog Produk', icon: 'grid' },
    { href: '/pelanggan/buat-pesanan', text: 'Buat Pesanan', icon: 'tambah' },
    { href: '/pelanggan/pesanan', text: 'Pesanan Saya', icon: 'list', badge: aktif || null, kunci: 'aktif' },
    { href: '/pelanggan/pembayaran', text: 'Pembayaran', icon: 'card', badge: tagihan || null, kunci: 'tagihan' },
    { label: 'Akun' },
    { href: '/pelanggan/profil', text: 'Profil Saya', icon: 'user' },
  ];

  return (
    <div className="app">
      <Sidebar items={menu} nama={pengguna?.nama || session.user.name} peran="Pelanggan" />
      <div className="main">
        <TopBar cariAksi="/pelanggan/pesanan" placeholder="Cari kode pesanan atau produk" adaNotif={tindakan > 0} />
        {children}
      </div>
    </div>
  );
}
