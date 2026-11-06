import Link from 'next/link';
import KatalogList from '@/components/KatalogList';

export const dynamic = 'force-dynamic';

export default function KatalogPelanggan({ searchParams }) {
  return (
    <>
      <main className="page">
        <div className="crumb"><Link href="/pelanggan/dashboard">Dashboard</Link><span>/</span><b style={{ color: 'var(--ink)' }}>Katalog Produk</b></div>
        <div className="col g8">
          <h1>Katalog Produk</h1>
          <p className="mut" style={{ maxWidth: 680 }}>
            Pilih sebagai inspirasi, lalu sesuaikan ukuran, bahan, dan warna sesuai kebutuhan ruanganmu.
            Harga adalah harga mulai dari, harga pasti ditentukan lewat penawaran.
          </p>
        </div>
        <KatalogList
          basePath="/pelanggan/katalog"
          kat={searchParams?.kat}
          urut={searchParams?.urut}
          pesanHref={(slug) => `/pelanggan/buat-pesanan?produk=${slug}`}
        />
      </main>
    </>
  );
}
