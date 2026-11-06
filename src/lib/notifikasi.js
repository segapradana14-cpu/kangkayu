import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/status';

// Notifikasi diturunkan dari riwayat status dan pembayaran yang sudah ada, tanpa tabel baru.
// Catatan riwayat yang ditulis pelanggan dianggap "dari pelanggan"; sisanya "dari admin".
const DARI_PELANGGAN = [
  'Pesanan dikirim pelanggan',
  'Penawaran disetujui pelanggan',
  'Penawaran ditolak pelanggan',
  'Pesanan dibatalkan pelanggan',
  'Pesanan diterima pelanggan',
];
const dariPelanggan = (k) => DARI_PELANGGAN.some((x) => (k || '').startsWith(x));
const BATAS = 60;

function untukPelanggan(l) {
  const k = l.keterangan || '';
  const kode = l.order.kode;
  const base = { id: `l${l.id}`, waktu: l.createdAt.toISOString(), href: `/pelanggan/pesanan/${l.orderId}` };
  if (k.startsWith('Penawaran dikirim')) return { ...base, tipe: 'tindakan', judul: 'Penawaran baru', isi: `Admin mengirim penawaran untuk ${kode}. Tinjau lalu setujui atau tolak.` };
  if (k.startsWith('Penawaran diubah')) return { ...base, tipe: 'tindakan', judul: 'Penawaran diperbarui', isi: `Admin memperbarui penawaran untuk ${kode}. Tinjau kembali sebelum memutuskan.` };
  if (k.startsWith('DP terverifikasi')) return { ...base, tipe: 'ok', judul: 'DP terverifikasi', isi: `Produksi pesanan ${kode} dimulai.` };
  if (k.startsWith('Tahap:')) return { ...base, tipe: 'info', judul: 'Progres produksi diperbarui', isi: `${kode}. ${k}` };
  if (k.startsWith('Produksi selesai')) return { ...base, tipe: 'tindakan', judul: 'Pesanan selesai dikerjakan', isi: `Silakan lunasi pembayaran untuk ${kode}.` };
  if (k.startsWith('Pelunasan terverifikasi')) return { ...base, tipe: 'ok', judul: 'Pelunasan terverifikasi', isi: `Pesanan ${kode} siap diantar atau diambil.` };
  if (k.startsWith('Pesanan ditolak admin')) return { ...base, tipe: 'bad', judul: 'Pesanan ditolak', isi: `${kode}. ${k}` };
  if (k.startsWith('Pesanan dibatalkan admin')) return { ...base, tipe: 'bad', judul: 'Pesanan dibatalkan admin', isi: `${kode} dibatalkan oleh admin.` };
  if (k.startsWith('Bukti')) return { ...base, tipe: 'bad', judul: 'Bukti pembayaran ditolak', isi: `${kode}. ${k}` };
  if (k.startsWith('Pesanan diserahkan')) return { ...base, tipe: 'ok', judul: 'Pesanan selesai', isi: `${kode} sudah diserahkan. Terima kasih sudah memesan.` };
  return { ...base, tipe: 'info', judul: STATUS[l.status]?.label || 'Pembaruan pesanan', isi: `${kode}. ${k}` };
}

export async function notifPelanggan(userId) {
  const logs = await prisma.orderStatusLog.findMany({
    where: { order: { userId } },
    orderBy: { createdAt: 'desc' },
    take: BATAS * 2,
    include: { order: { select: { kode: true } } },
  });
  return logs.filter((l) => !dariPelanggan(l.keterangan)).map(untukPelanggan).slice(0, BATAS);
}

function untukAdmin(l) {
  const k = l.keterangan || '';
  const kode = l.order.kode;
  const nama = l.order.user?.nama || 'Pelanggan';
  const base = { id: `l${l.id}`, waktu: l.createdAt.toISOString(), href: `/admin/pesanan/${l.orderId}` };
  if (k.startsWith('Pesanan dikirim pelanggan')) return { ...base, tipe: 'tindakan', judul: 'Pesanan baru', isi: `${nama} mengirim pesanan ${kode} (${l.order.jenis}). Menunggu tinjauan.` };
  if (k.startsWith('Penawaran disetujui')) return { ...base, tipe: 'ok', judul: 'Penawaran disetujui', isi: `${nama} menyetujui penawaran ${kode}. Menunggu DP.` };
  if (k.startsWith('Penawaran ditolak')) return { ...base, tipe: 'bad', judul: 'Penawaran ditolak', isi: `${kode}. ${k}` };
  if (k.startsWith('Pesanan dibatalkan')) return { ...base, tipe: 'bad', judul: 'Pesanan dibatalkan pelanggan', isi: `${kode}. ${k}` };
  return { ...base, tipe: 'ok', judul: 'Pesanan diterima pelanggan', isi: `${nama} mengonfirmasi ${kode} sudah diterima.` };
}

export async function notifAdmin() {
  const [logs, bayar] = await Promise.all([
    prisma.orderStatusLog.findMany({
      where: { OR: DARI_PELANGGAN.map((x) => ({ keterangan: { startsWith: x } })) },
      orderBy: { createdAt: 'desc' },
      take: BATAS,
      include: { order: { select: { kode: true, jenis: true, user: { select: { nama: true } } } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: BATAS,
      include: { order: { select: { kode: true, user: { select: { nama: true } } } } },
    }),
  ]);
  const itemBayar = bayar.map((p) => ({
    id: `p${p.id}`,
    waktu: p.createdAt.toISOString(),
    href: `/admin/pembayaran?id=${p.id}`,
    tipe: p.status === 'MENUNGGU_VERIFIKASI' ? 'tindakan' : 'info',
    judul: `Bukti ${p.jenis === 'DP' ? 'DP' : 'pelunasan'} masuk`,
    isi: `${p.order.user?.nama || 'Pelanggan'} mengunggah bukti ${p.jenis === 'DP' ? 'DP' : 'pelunasan'} untuk ${p.order.kode}.`,
  }));
  return [...logs.map(untukAdmin), ...itemBayar].sort((a, b) => b.waktu.localeCompare(a.waktu)).slice(0, BATAS);
}
