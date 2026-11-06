import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole, rupiah } from '@/lib/session';
import { STATUS, tanggal, ukuran } from '@/lib/status';
import SortSelect from '@/components/SortSelect';

export const dynamic = 'force-dynamic';

const TAB = [
  { id: 'semua', teks: 'Semua', status: null },
  { id: 'tinjauan', teks: 'Menunggu Tinjauan', status: ['MENUNGGU_TINJAUAN'] },
  { id: 'persetujuan', teks: 'Menunggu Persetujuan', status: ['MENUNGGU_PERSETUJUAN'] },
  { id: 'bayar', teks: 'Menunggu Pembayaran', status: ['MENUNGGU_DP', 'MENUNGGU_PELUNASAN'] },
  { id: 'produksi', teks: 'Dalam Produksi', status: ['DALAM_PRODUKSI', 'SIAP_DIANTAR'] },
  { id: 'selesai', teks: 'Selesai', status: ['SELESAI'] },
  { id: 'batal', teks: 'Dibatalkan / Ditolak', status: ['DIBATALKAN', 'DITOLAK'] },
];

// Tombol aksi sesuai status pesanan.
function aksi(o) {
  if (o.status === 'MENUNGGU_PERSETUJUAN') return { teks: 'Tinjau penawaran', href: `/pelanggan/pesanan/${o.id}`, pri: true };
  if (o.status === 'MENUNGGU_DP') return { teks: 'Bayar DP', href: `/pelanggan/pembayaran?order=${o.id}`, pri: true };
  if (o.status === 'MENUNGGU_PELUNASAN') return { teks: 'Bayar pelunasan', href: `/pelanggan/pembayaran?order=${o.id}`, pri: true };
  return { teks: 'Lihat detail', href: `/pelanggan/pesanan/${o.id}`, pri: false };
}

export default async function PesananSaya({ searchParams }) {
  const session = await requireRole('PELANGGAN');
  const userId = Number(session.user.id);
  const tab = TAB.find((t) => t.id === searchParams?.tab) || TAB[0];
  const q = String(searchParams?.q || '').trim();
  const urut = searchParams?.urut === 'terlama' ? 'asc' : 'desc';

  const semua = await prisma.order.findMany({ where: { userId }, select: { status: true } });
  const jumlah = (t) => (t.status ? semua.filter((o) => t.status.includes(o.status)).length : semua.length);

  const pesanan = await prisma.order.findMany({
    where: {
      userId,
      ...(tab.status ? { status: { in: tab.status } } : {}),
      ...(q ? { OR: [{ kode: { contains: q } }, { jenis: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: urut },
  });

  return (
    <>
      <main className="page">
        <div className="crumb"><Link href="/pelanggan/dashboard">Dashboard</Link><span>/</span><b style={{ color: 'var(--ink)' }}>Pesanan Saya</b></div>
        <div className="col g8"><h1>Pesanan Saya</h1><p className="mut">Semua pesanan custom furniture yang pernah kamu buat.</p></div>

        {searchParams?.baru && (
          <div className="alert ok"><span><b>Pesanan {searchParams.baru} berhasil dikirim.</b> Admin akan meninjau pesananmu, lalu mengirim penawaran.</span></div>
        )}

        <section className="card p0">
          <div className="tabs" style={{ padding: '0 12px' }}>
            {TAB.map((t) => (
              <Link key={t.id} className={t.id === tab.id ? 'on' : ''} href={`/pelanggan/pesanan?tab=${t.id}`}>
                {t.teks}<span className="n">{jumlah(t)}</span>
              </Link>
            ))}
          </div>
          <form className="tb" action="/pelanggan/pesanan">
            <input type="hidden" name="tab" value={tab.id} />
            <div className="srch" style={{ minWidth: 300 }}>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input name="q" defaultValue={q} aria-label="Cari di daftar" placeholder="Cari kode atau jenis, lalu tekan Enter" />
            </div>
            <SortSelect nama="urut" lebar={180} nilai={urut === 'asc' ? 'terlama' : 'terbaru'} opsi={[{ nilai: 'terbaru', teks: 'Terbaru dulu' }, { nilai: 'terlama', teks: 'Terlama dulu' }]} />
          </form>
          {pesanan.length === 0 ? (
            <div style={{ padding: 28 }}>
              <div className="empty" style={{ marginTop: 0 }}>
                {semua.length === 0 ? 'Kamu belum punya pesanan. ' : 'Tidak ada pesanan yang cocok. '}
                {semua.length === 0 && <Link className="lnk" href="/pelanggan/buat-pesanan">Buat pesanan pertamamu</Link>}
              </div>
            </div>
          ) : (
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>Kode</th><th>Produk</th><th>Tanggal</th><th>Status</th><th>Total</th><th><span style={{ position: 'absolute', left: -9999 }}>Aksi</span></th></tr></thead>
                <tbody>
                  {pesanan.map((o) => {
                    const a = aksi(o);
                    const st = STATUS[o.status];
                    return (
                      <tr key={o.id}>
                        <td className="b">{o.kode}</td>
                        <td>{o.jenis}<div className="t12 mut">{ukuran(o)}</div></td>
                        <td>{tanggal(o.createdAt)}</td>
                        <td><span className={`chip ${st.chip}`}>{st.label}</span></td>
                        <td>{o.hargaTotal ? rupiah(o.hargaTotal) : <span className="mut">Belum ada</span>}</td>
                        <td className="r"><Link className={`btn s${a.pri ? ' pri' : ''}`} href={a.href}>{a.teks}</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="pager"><span className="mut t13">Menampilkan {pesanan.length} dari {semua.length} pesanan</span></div>
        </section>
      </main>
    </>
  );
}
