import PublicNav from '@/components/PublicNav';
import KatalogList from '@/components/KatalogList';

export const dynamic = 'force-dynamic';

export default function Katalog({ searchParams }) {
  return (
    <>
      <PublicNav aktif="katalog" />
      <section style={{ background: '#fff', borderBottom: '1px solid var(--line)', padding: '36px 64px 28px' }}>
        <div className="col g8">
          <h1>Katalog Produk</h1>
          <p className="mut" style={{ maxWidth: 680 }}>
            Pilih sebagai inspirasi, lalu sesuaikan ukuran, bahan, dan warna sesuai kebutuhan ruanganmu.
            Harga adalah harga mulai dari, harga pasti ditentukan lewat penawaran.
          </p>
        </div>
      </section>
      <section className="sec col g16" style={{ padding: '32px 64px 72px' }}>
        <KatalogList
          basePath="/katalog"
          kat={searchParams?.kat}
          urut={searchParams?.urut}
          pesanHref={() => '/login'}
          catatan="Masuk atau daftar untuk memesan."
        />
      </section>
    </>
  );
}
