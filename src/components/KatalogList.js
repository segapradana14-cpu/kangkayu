import Link from 'next/link';
import FotoProduk from '@/components/FotoProduk';
import SortSelect from '@/components/SortSelect';
import { prisma } from '@/lib/prisma';
import { rupiah } from '@/lib/session';
import { KATEGORI } from '@/lib/opsi';

const URUTAN = {
  terbaru: { createdAt: 'desc' },
  termurah: { hargaMulai: 'asc' },
  termahal: { hargaMulai: 'desc' },
};

// Filter kategori, urutan, dan kartu produk. Dipakai halaman publik dan halaman pelanggan.
// pesanHref(slug) menentukan tujuan tombol "Pesan Custom".
export default async function KatalogList({ basePath, kat, urut, pesanHref, catatan }) {
  const kategori = KATEGORI.includes(kat) ? kat : '';
  const urutan = URUTAN[urut] ? urut : 'terbaru';
  const produk = await prisma.product.findMany({
    where: { aktif: true, ...(kategori ? { kategori } : {}) },
    orderBy: URUTAN[urutan],
  });
  const q = (k) => `${basePath}?${new URLSearchParams({ ...(k ? { kat: k } : {}), urut: urutan })}`;

  return (
    <>
      <div className="row sp">
        <div className="row g8" role="group" aria-label="Filter kategori">
          <Link className={`fchip${!kategori ? ' on' : ''}`} href={q('')}>Semua</Link>
          {KATEGORI.map((k) => (
            <Link key={k} className={`fchip${kategori === k ? ' on' : ''}`} href={q(k)}>{k}</Link>
          ))}
        </div>
        <SortSelect
          nilai={urutan}
          opsi={[
            { nilai: 'terbaru', teks: 'Urutkan: Terbaru' },
            { nilai: 'termurah', teks: 'Harga terendah' },
            { nilai: 'termahal', teks: 'Harga tertinggi' },
          ]}
        />
      </div>
      <p className="mut">Menampilkan {produk.length} produk{catatan ? `. ${catatan}` : ''}</p>
      {produk.length === 0 ? (
        <div className="empty">Belum ada produk di kategori ini.</div>
      ) : (
        <div className="g4">
          {produk.map((p) => (
            <article className="prod" key={p.id}>
              <div className="ph"><FotoProduk p={p} perbesar /></div>
              <div className="bd">
                <span className="t12 mut b">{p.kategori.toUpperCase()}</span>
                <h3>{p.nama}</h3>
                <p className="mut t13">{p.deskripsi}</p>
                <span className="pr">Mulai {rupiah(p.hargaMulai)}</span>
                <Link className="btn pri" href={pesanHref(p.slug)}>Pesan Custom</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
