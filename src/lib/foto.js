import { MAKS_FOTO } from '@/lib/opsi';

// Alamat foto yang tersimpan di database bisa berupa:
// - alamat penuh dari Vercel Blob (https://....public.blob.vercel-storage.com/...)
// - alamat lokal (/uploads/...), dipakai saat pengembangan di laptop
// - nama file saja (data lama), diarahkan ke folder uploads sesuai jenisnya
export function fotoUrl(jenis, nilai) {
  if (!nilai) return null;
  return nilai.startsWith('http') || nilai.startsWith('/') ? nilai : `/uploads/${jenis}/${nilai}`;
}

function urlAman(u) {
  if (u.startsWith('/uploads/')) return !u.includes('..');
  try {
    const x = new URL(u);
    return x.protocol === 'https:' && x.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

// Membaca daftar alamat foto (dipisah koma) yang dikirim form. Mengembalikan { urls } atau { error }.
export function bacaUrlFoto(nilai, maks = MAKS_FOTO) {
  const urls = String(nilai || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (urls.length > maks) return { error: `Maksimal ${maks} foto.` };
  if (!urls.every(urlAman)) return { error: 'Alamat foto tidak valid. Unggah ulang fotonya.' };
  return { urls };
}
