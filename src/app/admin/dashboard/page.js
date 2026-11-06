import Link from 'next/link';
import { requireRole, rupiah } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/status';
import Ikon from '@/components/Ikon';

export const dynamic = 'force-dynamic';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const URUT_STATUS = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'DALAM_PRODUKSI', 'MENUNGGU_PELUNASAN', 'SIAP_DIANTAR', 'SELESAI'];

function juta(n) {
  return (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

export default async function DashboardAdmin() {
  await requireRole('ADMIN');

  const sekarang = new Date();
  const awalRentang = new Date(sekarang.getFullYear(), sekarang.getMonth() - 5, 1);

  const [baru, verifikasi, produksi, lunasMenunggu, bayarTerverifikasi, semuaStatus, terbaru] = await Promise.all([
    prisma.order.count({ where: { status: 'MENUNGGU_TINJAUAN' } }),
    prisma.payment.count({ where: { status: 'MENUNGGU_VERIFIKASI' } }),
    prisma.order.count({ where: { status: 'DALAM_PRODUKSI' } }),
    prisma.order.findMany({ where: { status: 'MENUNGGU_PELUNASAN' }, orderBy: { updatedAt: 'desc' }, include: { user: { select: { nama: true } } } }),
    prisma.payment.findMany({ where: { status: 'TERVERIFIKASI', verifiedAt: { gte: awalRentang } }, select: { nominal: true, verifiedAt: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { nama: true } } } }),
  ]);

  // Pendapatan 6 bulan terakhir dari pembayaran yang sudah diverifikasi.
  const bulan = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1);
    bulan.push({ kunci: `${d.getFullYear()}-${d.getMonth()}`, nama: BULAN[d.getMonth()], total: 0 });
  }
  for (const p of bayarTerverifikasi) {
    const d = new Date(p.verifiedAt);
    const b = bulan.find((x) => x.kunci === `${d.getFullYear()}-${d.getMonth()}`);
    if (b) b.total += p.nominal;
  }
  const maks = Math.max(...bulan.map((b) => b.total), 1);
  const bulanIni = bulan[bulan.length - 1];

  const hitung = Object.fromEntries(semuaStatus.map((s) => [s.status, s._count._all]));
  const totalPesanan = semuaStatus.reduce((a, s) => a + s._count._all, 0);

  // Pesanan yang menunggu pelunasan pelanggan ditaruh paling atas.
  const daftar = [...lunasMenunggu, ...terbaru.filter((o) => !lunasMenunggu.some((l) => l.id === o.id))].slice(0, 5);

  const tindakan = [];
  if (baru) tindakan.push({ ikon: 'inbox', warna: 'amb', judul: `${baru} pesanan baru`, ket: 'Menunggu tinjauan dan penawaran.', teks: 'Tinjau pesanan', href: '/admin/pesanan', pri: true });
  if (verifikasi) tindakan.push({ ikon: 'card', warna: 'blu', judul: `${verifikasi} bukti pembayaran menunggu verifikasi`, ket: 'Cocokkan dengan mutasi rekening.', teks: 'Verifikasi pembayaran', href: '/admin/pembayaran', pri: true });
  if (lunasMenunggu.length) tindakan.push({ ikon: 'kubus', warna: 'grn', judul: `${lunasMenunggu.length} pesanan menunggu pelunasan`, ket: lunasMenunggu.slice(0, 3).map((o) => o.kode).join(', '), teks: 'Lihat produksi', href: '/admin/produksi', pri: false });

  return (
    <main className="page">
      <div className="col g8"><h1>Dashboard Admin</h1><p className="mut">Ringkasan operasional workshop.</p></div>

      <section className="cards" aria-label="Ringkasan">
        <div className="card stat"><div className="row sp"><span className="k">Pesanan Baru</span><span className="sico amb"><Ikon nama="inbox" /></span></div><div className="v">{baru}</div><div className="t12 mut">Menunggu tinjauan</div></div>
        <div className="card stat"><div className="row sp"><span className="k">Menunggu Verifikasi</span><span className="sico blu"><Ikon nama="card" /></span></div><div className="v">{verifikasi}</div><div className="t12 mut">Bukti pembayaran masuk</div></div>
        <div className="card stat"><div className="row sp"><span className="k">Dalam Produksi</span><span className="sico"><Ikon nama="kubus" /></span></div><div className="v">{produksi}</div><div className="t12 mut">Sedang dikerjakan</div></div>
        <div className="card stat"><div className="row sp"><span className="k">Pendapatan {bulanIni.nama}</span><span className="sico grn"><Ikon nama="chart" /></span></div><div className="v">{rupiah(bulanIni.total)}</div><div className="t12 mut">Pembayaran terverifikasi bulan ini</div></div>
      </section>

      <div className="cols">
        <div className="a col g24">
          <section className="card col g16">
            <div className="row sp"><h2>Pendapatan 6 bulan terakhir</h2><span className="t12 mut">Dalam juta rupiah</span></div>
            <div className="bars" role="img" aria-label={'Pendapatan per bulan: ' + bulan.map((b) => `${b.nama} ${juta(b.total)}`).join('; ') + ' juta rupiah'}>
              {bulan.map((b, i) => (
                <div key={b.kunci} className={`c${i === bulan.length - 1 ? ' cur' : ''}`}>
                  <div className="bw"><div className="bar" style={{ height: `${Math.max((b.total / maks) * 100, b.total ? 3 : 0)}%` }} /></div>
                  <span className="v">{juta(b.total)}</span><span className="m">{b.nama}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p0">
            <div className="hd"><h2>Pesanan terbaru</h2><Link className="btn s" href="/admin/pesanan">Lihat semua</Link></div>
            {daftar.length === 0 ? (
              <div style={{ padding: 24 }}><div className="empty" style={{ marginTop: 0 }}>Belum ada pesanan masuk.</div></div>
            ) : (
              <div className="scroll">
                <table className="tbl">
                  <thead><tr><th>Kode</th><th>Pelanggan</th><th>Produk</th><th>Status</th><th><span style={{ position: 'absolute', left: -9999 }}>Aksi</span></th></tr></thead>
                  <tbody>
                    {daftar.map((o) => {
                      const st = STATUS[o.status];
                      const tinjau = o.status === 'MENUNGGU_TINJAUAN';
                      const lunasi = o.status === 'MENUNGGU_PELUNASAN';
                      return (
                        <tr key={o.id} style={lunasi ? { background: '#fff3e3' } : undefined}>
                          <td className="b">{o.kode}</td><td>{o.user.nama}</td><td>{o.jenis}</td>
                          <td>{lunasi ? <span className="chip" style={{ background: '#b4440b', color: '#fff' }}>Menunggu Pelunasan</span> : <span className={`chip ${st.chip}`}>{st.label}</span>}</td>
                          <td className="r"><Link className={`btn s${tinjau ? ' pri' : ''}`} href={`/admin/pesanan/${o.id}`}>{tinjau ? 'Tinjau' : 'Detail'}</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="b2">
          <section className="card" id="tindakan">
            <h2 style={{ marginBottom: 16 }}>Perlu tindakan</h2>
            {tindakan.length === 0 ? <p className="mut t13">Tidak ada yang perlu ditindak sekarang.</p> : tindakan.map((t) => (
              <div className="act" key={t.judul}>
                <span className={`sico ${t.warna}`}><Ikon nama={t.ikon} /></span>
                <div className="grow col g8">
                  <div><div className="b">{t.judul}</div><div className="t13 mut">{t.ket}</div></div>
                  <Link className={`btn s${t.pri ? ' pri' : ''}`} style={{ alignSelf: 'flex-start' }} href={t.href}>{t.teks}</Link>
                </div>
              </div>
            ))}
          </section>

          <section className="card col g16">
            <div className="row sp"><h2>Status pesanan</h2><span className="t12 mut">Total {totalPesanan} pesanan</span></div>
            {URUT_STATUS.map((s) => (
              <div className="col g8" key={s}>
                <div className="row sp t13"><span>{STATUS[s].label}</span><b>{hitung[s] || 0}</b></div>
                <div className="prog"><i style={{ width: `${totalPesanan ? ((hitung[s] || 0) / totalPesanan) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
