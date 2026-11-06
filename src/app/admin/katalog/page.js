import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { rupiah } from '@/lib/session';
import { KATEGORI } from '@/lib/opsi';
import FotoProduk from '@/components/FotoProduk';
import FormProduk from './FormProduk';
import TombolHapus from './TombolHapus';
import { ubahTampil, hapusProduk } from './actions';

export const dynamic = 'force-dynamic';

export default async function KatalogAdmin({ searchParams }) {
  await wajibAdmin();
  const q = String(searchParams?.q || '').trim();
  const kat = KATEGORI.includes(searchParams?.kat) ? searchParams.kat : '';
  const idUbah = Number(searchParams?.ubah) || null;

  const [produk, total, diubah] = await Promise.all([
    prisma.product.findMany({ where: { ...(q ? { nama: { contains: q } } : {}), ...(kat ? { kategori: kat } : {}) }, orderBy: { id: 'asc' } }),
    prisma.product.count(),
    idUbah ? prisma.product.findUnique({ where: { id: idUbah } }) : null,
  ]);

  return (
    <main className="page">
      <div className="row sp">
        <div className="col g8"><h1>Katalog Produk</h1><p className="mut">Kelola produk yang tampil di halaman katalog pelanggan.</p></div>
        <Link className="btn pri" href="/admin/katalog#form"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Tambah Produk</Link>
      </div>
      {searchParams?.pesan && <div className="alert ok"><span>{searchParams.pesan}</span></div>}

      <div className="cols">
        <section className="card p0 a">
          <form className="tb" action="/admin/katalog">
            <div className="srch" style={{ minWidth: 260 }}>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input name="q" defaultValue={q} aria-label="Cari produk" placeholder="Cari produk, lalu tekan Enter" />
            </div>
            <select className="in" style={{ width: 170 }} name="kat" defaultValue={kat} aria-label="Kategori">
              <option value="">Semua kategori</option>
              {KATEGORI.map((k) => <option key={k}>{k}</option>)}
            </select>
            <button className="btn" type="submit">Terapkan</button>
          </form>
          {produk.length === 0 ? (
            <div style={{ padding: 28 }}><div className="empty" style={{ marginTop: 0 }}>Tidak ada produk yang cocok.</div></div>
          ) : (
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>Produk</th><th>Kategori</th><th>Harga mulai</th><th>Tampil</th><th><span style={{ position: 'absolute', left: -9999 }}>Aksi</span></th></tr></thead>
                <tbody>
                  {produk.map((p) => (
                    <tr key={p.id}>
                      <td><div className="row" style={{ flexWrap: 'nowrap' }}><span className="thumb" style={{ overflow: 'hidden' }}><FotoProduk p={p} /></span><b>{p.nama}</b></div></td>
                      <td>{p.kategori}</td>
                      <td>{rupiah(p.hargaMulai)}</td>
                      <td>
                        <form action={ubahTampil.bind(null, p.id)}>
                          <button type="submit" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} aria-label={p.aktif ? 'Aktif, klik untuk menonaktifkan' : 'Nonaktif, klik untuk mengaktifkan'}>
                            <span className={`tg${p.aktif ? '' : ' off'}`} />
                          </button>
                        </form>
                      </td>
                      <td className="r">
                        <div className="row g8" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <Link className="btn s" href={`/admin/katalog?ubah=${p.id}#form`}>Ubah</Link>
                          <form action={hapusProduk.bind(null, p.id)}><TombolHapus nama={p.nama} /></form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pager"><span className="mut t13">Menampilkan {produk.length} dari {total} produk</span></div>
        </section>

        <aside className="b2" id="form">
          <FormProduk key={diubah ? diubah.id : 'baru'} produk={diubah} />
        </aside>
      </div>
    </main>
  );
}
