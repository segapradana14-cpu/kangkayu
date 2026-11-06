'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibPelanggan } from '@/lib/akses';

async function milikku(orderId) {
  const s = await wajibPelanggan();
  return prisma.order.findFirst({ where: { id: orderId, userId: Number(s.user.id) } });
}

export async function setujuiPenawaran(orderId) {
  const o = await milikku(orderId);
  if (o && o.status === 'MENUNGGU_PERSETUJUAN') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'MENUNGGU_DP', logs: { create: { status: 'MENUNGGU_DP', keterangan: 'Penawaran disetujui pelanggan.' } } },
    });
  }
  redirect(`/pelanggan/pesanan/${orderId}`);
}

export async function tolakPenawaran(orderId, state, formData) {
  const o = await milikku(orderId);
  if (!o || o.status !== 'MENUNGGU_PERSETUJUAN') return { error: 'Penawaran ini sudah tidak bisa ditolak.' };
  const alasan = String(formData.get('alasan') || '').trim();
  const catatan = String(formData.get('catatan') || '').trim();
  if (!alasan) return { error: 'Pilih alasan penolakan.' };
  const teks = catatan ? `${alasan}. ${catatan}` : alasan;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DITOLAK',
      alasanTolak: teks,
      logs: { create: { status: 'DITOLAK', keterangan: `Penawaran ditolak pelanggan. Alasan: ${teks}` } },
    },
  });
  redirect(`/pelanggan/pesanan/${orderId}`);
}

export async function konfirmasiDiterima(orderId) {
  const o = await milikku(orderId);
  if (o && o.status === 'SIAP_DIANTAR') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SELESAI', progres: 100, logs: { create: { status: 'SELESAI', keterangan: 'Pesanan diterima pelanggan.' } } },
    });
  }
  redirect(`/pelanggan/pesanan/${orderId}`);
}

const BISA_BATAL = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP'];

export async function batalkanPesanan(orderId, state, formData) {
  const s = await wajibPelanggan();
  const o = await prisma.order.findFirst({
    where: { id: orderId, userId: Number(s.user.id) },
    include: { payments: true },
  });
  if (!o) return { error: 'Pesanan tidak ditemukan.' };
  if (!BISA_BATAL.includes(o.status)) return { error: 'Pesanan ini sudah tidak bisa dibatalkan.' };
  if (o.payments.some((p) => p.status === 'MENUNGGU_VERIFIKASI')) {
    return { error: 'Bukti pembayaran sedang diverifikasi admin, pesanan belum bisa dibatalkan.' };
  }
  const alasan = String(formData.get('alasan') || '').trim();
  const catatan = String(formData.get('catatan') || '').trim();
  if (!alasan) return { error: 'Pilih alasan pembatalan.' };
  if (alasan === 'Lainnya' && !catatan) return { error: 'Tulis alasan pembatalan pada kolom catatan.' };
  const teks = catatan ? `${alasan}. ${catatan}` : alasan;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DIBATALKAN',
      alasanTolak: teks,
      logs: { create: { status: 'DIBATALKAN', keterangan: `Pesanan dibatalkan pelanggan. Alasan: ${teks}` } },
    },
  });
  redirect(`/pelanggan/pesanan/${orderId}`);
}
