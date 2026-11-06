import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const AKTIF = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'DALAM_PRODUKSI', 'MENUNGGU_PELUNASAN', 'SIAP_DIANTAR'];
const PERLU_TINDAKAN = ['MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'MENUNGGU_PELUNASAN'];

// Jumlah untuk lencana sidebar dan titik lonceng. Dipanggil berkala oleh browser.
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({}, { status: 401 });

  // Sedikit query sengaja: database gratis hanya menyediakan sedikit koneksi bersamaan.
  if (s.user.role === 'ADMIN') {
    const grup = await prisma.order.groupBy({
      by: ['status'],
      where: { status: { in: ['MENUNGGU_TINJAUAN', 'DALAM_PRODUKSI'] } },
      _count: { _all: true },
    });
    const jumlah = (st) => grup.find((g) => g.status === st)?._count._all || 0;
    const pembayaran = await prisma.payment.count({ where: { status: 'MENUNGGU_VERIFIKASI' } });
    const pesanan = jumlah('MENUNGGU_TINJAUAN');
    const produksi = jumlah('DALAM_PRODUKSI');
    return NextResponse.json({ pesanan, pembayaran, produksi, lonceng: pesanan + pembayaran > 0 });
  }

  const userId = Number(s.user.id);
  const daftar = await prisma.order.findMany({
    where: { userId, status: { in: AKTIF } },
    select: { status: true, payments: { where: { status: 'MENUNGGU_VERIFIKASI' }, select: { id: true }, take: 1 } },
  });
  const aktif = daftar.length;
  const tindakan = daftar.filter((o) => PERLU_TINDAKAN.includes(o.status)).length;
  const tagihan = daftar.filter((o) => ['MENUNGGU_DP', 'MENUNGGU_PELUNASAN'].includes(o.status) && o.payments.length === 0).length;
  return NextResponse.json({ aktif, tagihan, lonceng: tindakan > 0 });
}
