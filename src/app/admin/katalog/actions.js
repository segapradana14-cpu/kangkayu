'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibAdmin, angka } from '@/lib/akses';
import { KATEGORI } from '@/lib/opsi';
import { bacaUrlFoto } from '@/lib/foto';

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produk';
}

async function slugBaru(nama) {
  const dasar = slugify(nama);
  let slug = dasar;
  for (let i = 2; await prisma.product.findUnique({ where: { slug } }); i++) slug = `${dasar}-${i}`;
  return slug;
}

// id null = tambah produk baru, selain itu = ubah produk.
export async function simpanProduk(id, state, formData) {
  await wajibAdmin();
  const nama = String(formData.get('nama') || '').trim();
  const kategori = String(formData.get('kategori') || '');
  const hargaMulai = angka(formData.get('hargaMulai'));
  const deskripsi = String(formData.get('deskripsi') || '').trim();
  const aktif = formData.get('aktif') === 'on';

  if (!nama) return { error: 'Nama produk wajib diisi.' };
  if (!KATEGORI.includes(kategori)) return { error: 'Pilih kategori produk.' };
  if (hargaMulai < 1000) return { error: 'Harga mulai belum diisi dengan benar.' };
  if (!deskripsi) return { error: 'Deskripsi singkat wajib diisi.' };

  // Foto produk sudah diunggah dari browser; kosong berarti foto lama dipertahankan.
  const f = bacaUrlFoto(formData.get('urlFoto'), 1);
  if (f.error) return { error: f.error };
  const foto = f.urls[0];

  if (id) {
    await prisma.product.update({ where: { id }, data: { nama, kategori, hargaMulai, deskripsi, aktif, ...(foto ? { foto } : {}) } });
    redirect(`/admin/katalog?pesan=${encodeURIComponent(`Produk "${nama}" diperbarui.`)}`);
  }
  await prisma.product.create({ data: { slug: await slugBaru(nama), nama, kategori, hargaMulai, deskripsi, aktif, foto: foto || null } });
  redirect(`/admin/katalog?pesan=${encodeURIComponent(`Produk "${nama}" ditambahkan.`)}`);
}

export async function ubahTampil(id) {
  await wajibAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (p) await prisma.product.update({ where: { id }, data: { aktif: !p.aktif } });
  redirect('/admin/katalog');
}

export async function hapusProduk(id) {
  await wajibAdmin();
  const p = await prisma.product.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!p) redirect('/admin/katalog');
  if (p._count.orders > 0) {
    redirect(`/admin/katalog?pesan=${encodeURIComponent(`Produk "${p.nama}" sudah dipakai di ${p._count.orders} pesanan, jadi tidak bisa dihapus. Nonaktifkan saja agar tidak tampil di katalog.`)}`);
  }
  await prisma.product.delete({ where: { id } });
  redirect(`/admin/katalog?pesan=${encodeURIComponent(`Produk "${p.nama}" dihapus.`)}`);
}
