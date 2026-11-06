'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibPelanggan } from '@/lib/akses';
import { bacaUrlFoto } from '@/lib/foto';

// Pelanggan mengunggah bukti transfer untuk DP atau pelunasan, sesuai status pesanan.
export async function unggahBukti(orderId, state, formData) {
  const s = await wajibPelanggan();
  const o = await prisma.order.findFirst({
    where: { id: orderId, userId: Number(s.user.id) },
    include: { payments: true },
  });
  if (!o) return { error: 'Pesanan tidak ditemukan.' };

  const jenis = o.status === 'MENUNGGU_DP' ? 'DP' : o.status === 'MENUNGGU_PELUNASAN' ? 'PELUNASAN' : null;
  if (!jenis) return { error: 'Pesanan ini tidak sedang menunggu pembayaran.' };
  if (o.payments.some((p) => p.jenis === jenis && p.status === 'MENUNGGU_VERIFIKASI')) {
    return { error: 'Bukti pembayaran sebelumnya masih menunggu verifikasi admin.' };
  }

  // Foto bukti sudah diunggah dari browser; di sini hanya alamatnya yang diterima.
  const foto = bacaUrlFoto(formData.get('urlFoto'));
  if (foto.error) return { error: foto.error };
  if (foto.urls.length === 0) return { error: 'Bukti transfer belum diunggah. Pilih foto bukti terlebih dahulu.' };

  const nominal = jenis === 'DP' ? o.nominalDp : (o.hargaTotal || 0) - (o.nominalDp || 0);
  if (!nominal || nominal <= 0) return { error: 'Nominal tagihan belum tersedia. Hubungi admin.' };

  await prisma.payment.create({ data: { orderId, jenis, nominal, buktiBayar: foto.urls.join(',') } });
  redirect(`/pelanggan/pembayaran?terkirim=${o.kode}`);
}
