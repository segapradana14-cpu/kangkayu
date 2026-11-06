import IkonProduk from '@/components/IkonProduk';
import PratinjauFoto from '@/components/PratinjauFoto';
import { fotoUrl } from '@/lib/foto';

// Foto produk jika ada, kalau tidak pakai ikon garis sesuai slug.
// perbesar: foto bisa diklik untuk pratinjau besar (dipakai di katalog pelanggan).
export default function FotoProduk({ p, perbesar = false }) {
  if (p.foto) {
    const url = fotoUrl('produk', p.foto);
    if (perbesar) return <PratinjauFoto url={url} nama={p.nama} />;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={p.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return <IkonProduk slug={p.slug} />;
}
