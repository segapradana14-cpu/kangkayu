import { prisma } from '@/lib/prisma';

export const STATUS_LAPORAN = [
  ['', 'Semua status'],
  ['SELESAI', 'Selesai'],
  ['DALAM_PRODUKSI', 'Dalam Produksi'],
  ['MENUNGGU_PELUNASAN', 'Menunggu Pelunasan'],
  ['SIAP_DIANTAR', 'Siap Diantar'],
  ['MENUNGGU_DP', 'Menunggu DP'],
  ['MENUNGGU_PERSETUJUAN', 'Menunggu Persetujuan'],
  ['MENUNGGU_TINJAUAN', 'Menunggu Tinjauan'],
  ['DITOLAK', 'Ditolak'],
  ['DIBATALKAN', 'Dibatalkan'],
];

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Default periode: tanggal 1 bulan lalu sampai hari ini.
export function periode(sp) {
  const now = new Date();
  const dari = sp?.dari || fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const sampai = sp?.sampai || fmt(now);
  const status = STATUS_LAPORAN.some(([k]) => k === sp?.status) ? sp.status : '';
  return { dari, sampai, status };
}

export async function ambilLaporan({ dari, sampai, status }) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: new Date(`${dari}T00:00:00`), lte: new Date(`${sampai}T23:59:59`) },
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { nama: true } }, payments: { where: { status: 'TERVERIFIKASI' }, select: { nominal: true } } },
  });

  const baris = orders.map((o) => ({
    id: o.id,
    tanggal: o.createdAt,
    kode: o.kode,
    pelanggan: o.user.nama,
    produk: o.jenis,
    status: o.status,
    nilai: o.hargaTotal,
    dibayar: o.payments.reduce((a, p) => a + p.nominal, 0),
  }));

  // Pesanan yang ditolak atau dibatalkan tidak dihitung sebagai nilai usaha.
  const hitung = baris.filter((b) => b.nilai && !['DITOLAK', 'DIBATALKAN'].includes(b.status));
  const nilai = hitung.reduce((a, b) => a + b.nilai, 0);
  const dibayar = baris.reduce((a, b) => a + b.dibayar, 0);
  const selesai = baris.filter((b) => b.status === 'SELESAI').length;
  const berjalan = baris.filter((b) => !['SELESAI', 'DITOLAK', 'DIBATALKAN'].includes(b.status)).length;

  return { baris, nilai, dibayar, sisa: Math.max(nilai - hitung.reduce((a, b) => a + b.dibayar, 0), 0), selesai, berjalan };
}
