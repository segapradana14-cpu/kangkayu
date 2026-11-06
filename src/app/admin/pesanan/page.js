import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { STATUS, tanggal, ukuran } from '@/lib/status';

export const dynamic = 'force-dynamic';

const PER_HAL = 10;
const TAB = [
  { id: 'semua', teks: 'Semua', status: null },
  { id: 'tinjauan', teks: 'Menunggu Tinjauan', status: ['MENUNGGU_TINJAUAN'] },
  { id: 'persetujuan', teks: 'Menunggu Persetujuan', status: ['MENUNGGU_PERSETUJUAN'] },
  { id: 'dp', teks: 'Menunggu DP', status: ['MENUNGGU_DP'] },
  { id: 'produksi', teks: 'Dalam Produksi', status: ['DALAM_PRODUKSI'] },
  { id: 'pelunasan', teks: 'Menunggu Pelunasan', status: ['MENUNGGU_PELUNASAN', 'SIAP_DIANTAR'] },
  { id: 'selesai', teks: 'Selesai', status: ['SELESAI'] },
  { id: 'batal', teks: 'Dibatalkan / Ditolak', status: ['DIBATALKAN', 'DITOLAK'] },
];

function aksi(o) {
  const bayar = o.payments.find((p) => p.status === 'MENUNGGU_VERIFIKASI');
  if (o.status === 'MENUNGGU_TINJAUAN') return { teks: 'Tinjau', href: `/admin/pesanan/${o.id}`, pri: true };
  if (bayar) return { teks: bayar.jenis === 'DP' ? 'Verifikasi DP' : 'Verifikasi pelunasan', href: `/admin/pembayaran?id=${bayar.id}`, pri: true };
  if (o.status === 'DALAM_PRODUKSI') return { teks: 'Update status', href: '/admin/produksi', pri: false };
  return { teks: 'Detail', href: `/admin/pesanan/${o.id}`, pri: false };
}

export default async function PesananMasuk({ searchParams }) {
  await wajibAdmin();
  const tab = TAB.find((t) => t.id === searchParams?.tab) || TAB[0];
  const q = String(searchParams?.q || '').trim();
  const jenis = String(searchParams?.jenis || '');
  const dari = searchParams?.dari || '';
  const sampai = searchParams?.sampai || '';
  const hal = Math.max(1, Number(searchParams?.hal) || 1);

  const where = {
    ...(tab.status ? { status: { in: tab.status } } : {}),
    ...(q ? { OR: [{ kode: { contains: q } }, { jenis: { contains: q } }, { user: { nama: { contains: q } } }] } : {}),
    ...(jenis ? { jenis } : {}),
    ...(dari || sampai
      ? { createdAt: { ...(dari ? { gte: new Date(`${dari}T00:00:00`) } : {}), ...(sampai ? { lte: new Date(`${sampai}T23:59:59`) } : {}) } }
      : {}),
  };

  const [semua, total, pesanan, produk] = await Promise.all([
    prisma.order.findMany({ select: { status: true } }),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (hal - 1) * PER_HAL,
      take: PER_HAL,
      include: { user: { select: { nama: true } }, payments: { where: { status: 'MENUNGGU_VERIFIKASI' } } },
    }),
    prisma.product.findMany({ select: { nama: true }, orderBy: { id: 'asc' } }),
  ]);

  const jumlah = (t) => (t.status ? semua.filter((o) => t.status.includes(o.status)).length : semua.length);
  const halamanTotal = Math.max(1, Math.ceil(total / PER_HAL));
  const url = (h) => `/admin/pesanan?${new URLSearchParams({ tab: tab.id, ...(q ? { q } : {}), ...(jenis ? { jenis } : {}), ...(dari ? { dari } : {}), ...(sampai ? { sampai } : {}), hal: String(h) })}`;

  return (
    <main className="page">
      <div className="col g8"><h1>Pesanan Masuk</h1><p className="mut">Tinjau pesanan, kirim penawaran, dan pantau status semua pesanan pelanggan.</p></div>

      <section className="card p0">
        <div className="tabs" style={{ padding: '0 12px' }}>
          {TAB.map((t) => (
            <Link key={t.id} className={t.id === tab.id ? 'on' : ''} href={`/admin/pesanan?tab=${t.id}`}>{t.teks}<span className="n">{jumlah(t)}</span></Link>
          ))}
        </div>
        <form className="tb" action="/admin/pesanan">
          <input type="hidden" name="tab" value={tab.id} />
          <div className="srch" style={{ minWidth: 300 }}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input name="q" defaultValue={q} aria-label="Cari pesanan" placeholder="Cari kode, pelanggan, atau produk" />
          </div>
          <select className="in" style={{ width: 200 }} name="jenis" defaultValue={jenis} aria-label="Jenis furniture">
            <option value="">Semua jenis</option>
            {produk.map((p) => <option key={p.nama}>{p.nama}</option>)}
          </select>
          <input className="in" style={{ width: 170 }} type="date" name="dari" defaultValue={dari} aria-label="Dari tanggal" />
          <input className="in" style={{ width: 170 }} type="date" name="sampai" defaultValue={sampai} aria-label="Sampai tanggal" />
          <button className="btn" type="submit">Terapkan Filter</button>
        </form>
        {pesanan.length === 0 ? (
          <div style={{ padding: 28 }}><div className="empty" style={{ marginTop: 0 }}>Tidak ada pesanan yang cocok.</div></div>
        ) : (
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>Kode</th><th>Pelanggan</th><th>Produk</th><th>Ukuran (cm)</th><th>Tanggal</th><th>Status</th><th><span style={{ position: 'absolute', left: -9999 }}>Aksi</span></th></tr></thead>
              <tbody>
                {pesanan.map((o) => {
                  const a = aksi(o);
                  const st = STATUS[o.status];
                  const lunasi = o.status === 'MENUNGGU_PELUNASAN';
                  return (
                    <tr key={o.id} style={lunasi ? { background: '#fff3e3' } : undefined}>
                      <td className="b">{o.kode}</td><td>{o.user.nama}</td><td>{o.jenis}</td>
                      <td>{ukuran(o).replace(' cm', '')}</td><td>{tanggal(o.createdAt)}</td>
                      <td>{lunasi ? <span className="chip" style={{ background: '#b4440b', color: '#fff' }}>Menunggu Pelunasan</span> : <span className={`chip ${o.status === 'MENUNGGU_TINJAUAN' ? 'c-gray' : st.chip}`}>{st.label}</span>}</td>
                      <td className="r"><Link className={`btn s${a.pri ? ' pri' : ''}`} href={a.href}>{a.teks}</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="pager">
          <span className="mut t13">Menampilkan {pesanan.length} dari {total} pesanan</span>
          <div className="row g8">
            {hal > 1 && <Link className="pgb" href={url(hal - 1)}>&lsaquo;</Link>}
            <span className="pgb on">{hal}</span>
            {hal < halamanTotal && <Link className="pgb" href={url(hal + 1)}>&rsaquo;</Link>}
          </div>
        </div>
      </section>
    </main>
  );
}
