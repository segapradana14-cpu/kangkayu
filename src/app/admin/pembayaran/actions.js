'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';

export async function setujuiPembayaran(paymentId) {
  await wajibAdmin();
  const p = await prisma.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
  if (p && p.status === 'MENUNGGU_VERIFIKASI') {
    const dp = p.jenis === 'DP';
    await prisma.$transaction([
      prisma.payment.update({ where: { id: paymentId }, data: { status: 'TERVERIFIKASI', verifiedAt: new Date() } }),
      prisma.order.update({
        where: { id: p.orderId },
        data: dp
          ? { status: 'DALAM_PRODUKSI', progres: 0, tahapProduksi: 'Persiapan bahan', logs: { create: { status: 'DALAM_PRODUKSI', keterangan: 'DP terverifikasi, produksi dimulai.' } } }
          : { status: 'SIAP_DIANTAR', logs: { create: { status: 'SIAP_DIANTAR', keterangan: 'Pelunasan terverifikasi. Pesanan siap diantar atau diambil.' } } },
      }),
    ]);
  }
  redirect('/admin/pembayaran');
}

export async function tolakPembayaran(paymentId, state, formData) {
  await wajibAdmin();
  const alasan = String(formData.get('alasan') || '').trim();
  if (!alasan) return { error: 'Pilih alasan penolakan terlebih dahulu.' };
  const p = await prisma.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
  if (!p || p.status !== 'MENUNGGU_VERIFIKASI') return { error: 'Pembayaran ini sudah diproses.' };

  await prisma.$transaction([
    prisma.payment.update({ where: { id: paymentId }, data: { status: 'DITOLAK', alasanTolak: alasan } }),
    prisma.order.update({
      where: { id: p.orderId },
      data: { logs: { create: { status: p.order.status, keterangan: `Bukti ${p.jenis === 'DP' ? 'DP' : 'pelunasan'} ditolak: ${alasan}. Pelanggan diminta mengunggah ulang.` } } },
    }),
  ]);
  redirect('/admin/pembayaran?tab=ditolak');
}
