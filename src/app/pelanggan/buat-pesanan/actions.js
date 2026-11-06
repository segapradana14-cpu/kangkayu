'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { BAHAN, FINISHING, WARNA } from '@/lib/opsi';
import { bacaUrlFoto } from '@/lib/foto';

function ukuranValid(n) {
  return Number.isInteger(n) && n >= 10 && n <= 1000;
}

// Membuat kode pesanan berikutnya, contoh FRN-2610-008.
async function buatKode() {
  const d = new Date();
  const awal = `FRN-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-`;
  const terakhir = await prisma.order.findFirst({
    where: { kode: { startsWith: awal } },
    orderBy: { kode: 'desc' },
  });
  const nomor = terakhir ? Number(terakhir.kode.slice(awal.length)) + 1 : 1;
  return awal + String(nomor).padStart(3, '0');
}

export async function kirimPesanan(state, formData) {
  const session = await getSession();
  if (!session || session.user.role !== 'PELANGGAN') redirect('/login');

  const jenis = String(formData.get('jenis') || '').trim();
  const panjang = Number(formData.get('panjang'));
  const lebar = Number(formData.get('lebar'));
  const tinggi = Number(formData.get('tinggi'));
  const bahan = String(formData.get('bahan') || '');
  const finishing = String(formData.get('finishing') || '');
  const warna = String(formData.get('warna') || '');
  const catatan = String(formData.get('catatan') || '').trim();
  const produkId = Number(formData.get('produkId')) || null;

  if (!jenis) return { error: 'Jenis furniture wajib diisi.' };
  if (![panjang, lebar, tinggi].every(ukuranValid)) {
    return { error: 'Ukuran harus berupa angka bulat antara 10 dan 1000 cm.' };
  }
  if (!BAHAN.includes(bahan) || !FINISHING.includes(finishing) || !WARNA.some((w) => w.nama === warna)) {
    return { error: 'Bahan, finishing, atau warna tidak valid.' };
  }

  // Foto referensi (opsional) sudah diunggah dari browser; di sini hanya alamatnya yang diterima.
  const foto = bacaUrlFoto(formData.get('urlFoto'));
  if (foto.error) return { error: foto.error };

  let produk = null;
  if (produkId) produk = await prisma.product.findFirst({ where: { id: produkId, aktif: true } });

  const kode = await buatKode();
  const order = await prisma.order.create({
    data: {
      kode,
      userId: Number(session.user.id),
      productId: produk ? produk.id : null,
      jenis,
      panjang,
      lebar,
      tinggi,
      bahan,
      finishing,
      warna,
      catatan: catatan || null,
      fotoReferensi: foto.urls.length ? foto.urls.join(',') : null,
      status: 'MENUNGGU_TINJAUAN',
      logs: { create: { status: 'MENUNGGU_TINJAUAN', keterangan: 'Pesanan dikirim pelanggan.' } },
    },
  });

  redirect(`/pelanggan/pesanan?baru=${order.kode}`);
}
