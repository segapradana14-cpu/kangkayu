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

  if (s.user.role === 'ADMIN') {
    const [pesanan, pembayaran, produksi] = await Promise.all([
      prisma.order.count({ where: { status: 'MENUNGGU_TINJAUAN' } }),
      prisma.payment.count({ where: { status: 'MENUNGGU_VERIFIKASI' } }),
      prisma.order.count({ where: { status: 'DALAM_PRODUKSI' } }),
    ]);
    return NextResponse.json({ pesanan, pembayaran, produksi, lonceng: pesanan + pembayaran > 0 });
  }

  const userId = Number(s.user.id);
  const [aktif, tindakan, tagihan] = await Promise.all([
    prisma.order.count({ where: { userId, status: { in: AKTIF } } }),
    prisma.order.count({ where: { userId, status: { in: PERLU_TINDAKAN } } }),
    prisma.order.count({
      where: { userId, status: { in: ['MENUNGGU_DP', 'MENUNGGU_PELUNASAN'] }, payments: { none: { status: 'MENUNGGU_VERIFIKASI' } } },
    }),
  ]);
  return NextResponse.json({ aktif, tagihan, lonceng: tindakan > 0 });
}
