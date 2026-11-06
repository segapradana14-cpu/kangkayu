'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibAdmin, angka } from '@/lib/akses';

// Kirim atau ubah penawaran. Dipakai saat status Menunggu Tinjauan atau Menunggu Persetujuan.
export async function kirimPenawaran(orderId, state, formData) {
  await wajibAdmin();
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o || !['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN'].includes(o.status)) {
    return { error: 'Pesanan ini tidak bisa diberi penawaran lagi.' };
  }

  const harga = angka(formData.get('harga'));
  const mode = String(formData.get('dpMode') || '50');
  const estimasi = angka(formData.get('estimasi'));
  const catatan = String(formData.get('catatan') || '').trim();
  const dp = mode === 'lain' ? angka(formData.get('dpLain')) : Math.round((harga * Number(mode)) / 100);

  if (harga < 1000) return { error: 'Harga total belum diisi dengan benar.' };
  if (!(dp > 0 && dp < harga)) return { error: 'Nominal DP harus lebih dari 0 dan kurang dari harga total.' };
  if (!(estimasi >= 1 && estimasi <= 365)) return { error: 'Estimasi pengerjaan harus 1 sampai 365 hari.' };

  const ubah = o.status === 'MENUNGGU_PERSETUJUAN';
  await prisma.order.update({
    where: { id: orderId },
    data: {
      hargaTotal: harga,
      nominalDp: dp,
      estimasiHari: estimasi,
      catatanAdmin: catatan || null,
      status: 'MENUNGGU_PERSETUJUAN',
      logs: { create: { status: 'MENUNGGU_PERSETUJUAN', keterangan: ubah ? 'Penawaran diubah admin.' : 'Penawaran dikirim admin.' } },
    },
  });
  redirect(`/admin/pesanan/${orderId}`);
}

export async function tolakPesanan(orderId, state, formData) {
  await wajibAdmin();
  const alasan = String(formData.get('alasan') || '').trim();
  if (!alasan) return { error: 'Alasan penolakan wajib diisi.' };
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o || o.status !== 'MENUNGGU_TINJAUAN') return { error: 'Pesanan ini sudah tidak menunggu tinjauan.' };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DITOLAK',
      alasanTolak: alasan,
      logs: { create: { status: 'DITOLAK', keterangan: `Pesanan ditolak admin. Alasan: ${alasan}` } },
    },
  });
  redirect(`/admin/pesanan/${orderId}`);
}

export async function batalkanPesanan(orderId) {
  await wajibAdmin();
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (o && o.status === 'MENUNGGU_PERSETUJUAN') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DIBATALKAN', logs: { create: { status: 'DIBATALKAN', keterangan: 'Pesanan dibatalkan admin.' } } },
    });
  }
  redirect(`/admin/pesanan/${orderId}`);
}
