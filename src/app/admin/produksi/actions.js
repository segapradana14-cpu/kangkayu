'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { TAHAP } from '@/lib/opsi';

export async function simpanProgres(state, formData) {
  await wajibAdmin();
  const orderId = Number(formData.get('orderId'));
  const tahap = TAHAP.find((t) => t.nama === formData.get('tahap'));
  const catatan = String(formData.get('catatan') || '').trim();
  const selesai = formData.get('selesai') === 'on';

  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o || o.status !== 'DALAM_PRODUKSI') return { error: 'Pesanan ini tidak sedang dalam produksi.' };
  if (!selesai && !tahap) return { error: 'Pilih tahap pengerjaan.' };

  const tambah = catatan ? ` Catatan: ${catatan}` : '';
  await prisma.order.update({
    where: { id: orderId },
    data: selesai
      ? {
          status: 'MENUNGGU_PELUNASAN',
          progres: 100,
          tahapProduksi: 'Produksi selesai',
          logs: { create: { status: 'MENUNGGU_PELUNASAN', keterangan: `Produksi selesai. Pelanggan diminta melunasi pembayaran.${tambah}` } },
        }
      : {
          progres: tahap.persen,
          tahapProduksi: tahap.nama,
          logs: { create: { status: 'DALAM_PRODUKSI', keterangan: `Tahap: ${tahap.nama} (${tahap.persen}%).${tambah}` } },
        },
  });
  redirect(`/admin/produksi?ok=${o.kode}`);
}

// Dipakai jika pelanggan belum mengonfirmasi, tetapi pesanan sudah diserahkan.
export async function tandaiSelesai(orderId) {
  await wajibAdmin();
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (o && o.status === 'SIAP_DIANTAR') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SELESAI', progres: 100, logs: { create: { status: 'SELESAI', keterangan: 'Pesanan diserahkan, ditandai selesai oleh admin.' } } },
    });
  }
  redirect('/admin/produksi');
}
