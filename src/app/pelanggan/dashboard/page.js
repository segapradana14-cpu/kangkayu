import Link from 'next/link';
import { requireRole, rupiah } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { STATUS, tanggal } from '@/lib/status';
import Ikon from '@/components/Ikon';

export const dynamic = 'force-dynamic';

const AKTIF = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'DALAM_PRODUKSI', 'MENUNGGU_PELUNASAN', 'SIAP_DIANTAR'];

function sisaBayar(o) {
  if (!o.hargaTotal) return null;
  return o.hargaTotal - (o.nominalDp || 0);
}

function estimasi(o) {
  if (!o.estimasiHari) return null;
  const d = new Date(o.createdAt);
  d.setDate(d.getDate() + o.estimasiHari);
  return tanggal(d);
}

export default async function DashboardPelanggan() {
  const session = await requireRole('PELANGGAN');
  const userId = Number(session.user.id);

  const [pengguna, aktif, persetujuan, selesai, terbaru, tindakan, produksi, jumlahProduksi] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { nama: true } }),
    prisma.order.count({ where: { userId, status: { in: AKTIF } } }),
    prisma.order.count({ where: { userId, status: 'MENUNGGU_PERSETUJUAN' } }),
    prisma.order.count({ where: { userId, status: 'SELESAI' } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.order.findMany({
      where: { userId, status: { in: ['MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP', 'MENUNGGU_PELUNASAN'] } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.order.findMany({ where: { userId, status: 'DALAM_PRODUKSI' }, orderBy: { updatedAt: 'desc' }, take: 2 }),
    prisma.order.count({ where: { userId, status: 'DALAM_PRODUKSI' } }),
  ]);

  const lunas = tindakan.filter((o) => o.status === 'MENUNGGU_PELUNASAN');
  const bayar = tindakan.filter((o) => o.status !== 'MENUNGGU_PERSETUJUAN').length;
  // Pesanan yang harus segera dilunasi ditaruh paling atas, sisanya urut terbaru.
  const daftar = [...lunas, ...terbaru.filter((o) => !lunas.some((l) => l.id === o.id))].slice(0, 6);
  const urgent = lunas[0];
  const urgentLog = urgent
    ? await prisma.orderStatusLog.findFirst({ where: { orderId: urgent.id, status: 'MENUNGGU_PELUNASAN' }, orderBy: { createdAt: 'desc' } })
    : null;

  return (
    <main className="page">
      <div className="col g8">
        <h1>Halo, {(pengguna?.nama || session.user.name).split(' ')[0]}</h1>
        <p className="mut">Ringkasan pesanan custom furniture kamu.</p>
      </div>

      {urgent && (
        <section role="alert" aria-label="Pelunasan segera" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px', borderRadius: 14, background: '#b4440b', color: '#fff', border: '1px solid #8e3406', boxShadow: '0 6px 18px rgba(180,68,11,.28)' }}>
          <div className="row g16" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', flex: '1 1 420px' }}>
            <span style={{ flex: 'none', width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ikon nama="peringatan" style={{ width: 26, height: 26, stroke: '#fff' }} />
            </span>
            <div className="col g8">
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', opacity: 0.9 }}>PELUNASAN SEGERA{lunas.length > 1 ? ` (${lunas.length} PESANAN)` : ''}</div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.25 }}>
                {urgent.jenis} sudah selesai dikerjakan.{sisaBayar(urgent) ? ` Lunasi sisa ${rupiah(sisaBayar(urgent))} agar bisa diantar.` : ' Segera lakukan pelunasan agar bisa diantar.'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.95 }}>
                {urgent.kode}{urgentLog ? ` · produk selesai ${tanggal(urgentLog.createdAt)}` : ''}. Pesanan baru bisa diantar atau diambil setelah pelunasan terverifikasi admin.
              </div>
            </div>
          </div>
          <div className="row g8">
            <Link className="btn lg" style={{ background: '#fff', color: '#8e3406', borderColor: '#fff' }} href={`/pelanggan/pembayaran?order=${urgent.id}`}>Bayar Pelunasan Sekarang</Link>
            <Link className="btn lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.7)' }} href={`/pelanggan/pesanan/${urgent.id}`}>Lihat Pesanan</Link>
          </div>
        </section>
      )}

      <section className="cards" aria-label="Ringkasan">
        <div className="card stat"><div className="row sp"><span className="k">Pesanan Aktif</span><span className="sico"><Ikon nama="kubus" /></span></div><div className="v">{aktif}</div><div className="t12 mut">Sedang diproses</div></div>
        <div className="card stat"><div className="row sp"><span className="k">Menunggu Persetujuan</span><span className="sico amb"><Ikon nama="doc" /></span></div><div className="v">{persetujuan}</div><div className="t12 mut">Penawaran perlu keputusanmu</div></div>
        <div className="card stat" style={lunas.length ? { borderColor: '#b4440b', boxShadow: '0 0 0 3px rgba(180,68,11,.15)' } : undefined}>
          <div className="row sp"><span className="k">Menunggu Pembayaran</span><span className="sico blu"><Ikon nama="card" /></span></div>
          <div className="v">{bayar}</div>
          {lunas.length ? <div className="t12 b" style={{ color: '#b4440b' }}>Ada pelunasan yang harus segera dibayar</div> : <div className="t12 mut">DP dan pelunasan belum dibayar</div>}
        </div>
        <div className="card stat"><div className="row sp"><span className="k">Selesai</span><span className="sico grn"><Ikon nama="cek" /></span></div><div className="v">{selesai}</div><div className="t12 mut">Total pesanan selesai</div></div>
      </section>

      <div className="cols">
        <section className="card p0 a">
          <div className="hd"><h2>Pesanan terbaru</h2><Link className="btn s" href="/pelanggan/pesanan">Lihat semua</Link></div>
          {daftar.length === 0 ? (
            <div style={{ padding: 24 }}><div className="empty" style={{ marginTop: 0 }}>Belum ada pesanan. <Link className="lnk" href="/pelanggan/buat-pesanan">Buat pesanan pertamamu</Link></div></div>
          ) : (
            <div className="scroll">
              <table className="tbl">
                <thead><tr><th>Kode</th><th>Produk</th><th>Status</th><th>Total</th><th><span style={{ position: 'absolute', left: -9999 }}>Aksi</span></th></tr></thead>
                <tbody>
                  {daftar.map((o) => {
                    const st = STATUS[o.status];
                    const lunasi = o.status === 'MENUNGGU_PELUNASAN';
                    const bayarDp = o.status === 'MENUNGGU_DP';
                    return (
                      <tr key={o.id} style={lunasi ? { background: '#fff3e3' } : undefined}>
                        <td className="b">{o.kode}</td>
                        <td>{o.jenis}</td>
                        <td>{lunasi ? <span className="chip" style={{ background: '#b4440b', color: '#fff' }}>Segera Lunasi</span> : <span className={`chip ${st.chip}`}>{st.label}</span>}</td>
                        <td>{o.hargaTotal ? rupiah(o.hargaTotal) : <span className="mut">Belum ada</span>}</td>
                        <td className="r">
                          {lunasi || bayarDp
                            ? <Link className="btn s pri" href={`/pelanggan/pembayaran?order=${o.id}`}>{lunasi ? 'Bayar pelunasan' : 'Bayar DP'}</Link>
                            : <Link className="btn s" href={`/pelanggan/pesanan/${o.id}`}>Lihat</Link>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="b2">
          <section className="card" id="tindakan">
            <h2 style={{ marginBottom: 16 }}>Perlu tindakanmu</h2>
            {tindakan.length === 0 ? (
              <p className="mut t13">Tidak ada yang perlu kamu lakukan sekarang.</p>
            ) : tindakan.map((o) => {
              const k = o.status === 'MENUNGGU_PERSETUJUAN'
                ? { ikon: 'doc', warna: 'amb', judul: `Penawaran baru: ${o.jenis}`, ket: `${o.kode}. Harga dan estimasi sudah tersedia.`, teks: 'Tinjau penawaran', href: `/pelanggan/pesanan/${o.id}` }
                : o.status === 'MENUNGGU_DP'
                  ? { ikon: 'card', warna: 'blu', judul: `Bayar DP ${o.jenis}`, ket: `${o.kode}. Penawaran disetujui${o.nominalDp ? `, DP ${rupiah(o.nominalDp)}` : ''}.`, teks: 'Bayar DP', href: `/pelanggan/pembayaran?order=${o.id}` }
                  : { ikon: 'card', warna: 'blu', judul: `Pelunasan ${o.jenis}`, ket: `${o.kode}. Produk selesai${sisaBayar(o) ? `, sisa ${rupiah(sisaBayar(o))}` : ''}.`, teks: 'Bayar pelunasan', href: `/pelanggan/pembayaran?order=${o.id}` };
              return (
                <div className="act" key={o.id}>
                  <span className={`sico ${k.warna}`}><Ikon nama={k.ikon} /></span>
                  <div className="grow col g8">
                    <div><div className="b">{k.judul}</div><div className="t13 mut">{k.ket}</div></div>
                    <Link className="btn s pri" style={{ alignSelf: 'flex-start' }} href={k.href}>{k.teks}</Link>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="card col g16">
            <div className="row sp"><h2>Progres pesanan</h2><span className="chip c-prod">{jumlahProduksi} dalam produksi</span></div>
            {produksi.length === 0 && <p className="mut t13">Belum ada pesanan yang sedang dikerjakan.</p>}
            {produksi.map((o) => (
              <Link key={o.id} href={`/pelanggan/pesanan/${o.id}`} className="col g8" style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 10, color: 'inherit' }} aria-label={`Lihat detail ${o.jenis}`}>
                <div className="row sp"><div><div className="b">{o.jenis}</div><div className="t13 mut">{o.kode}</div></div>{estimasi(o) && <span className="t12 mut">Est. {estimasi(o)}</span>}</div>
                <div className="prog" role="progressbar" aria-valuenow={o.progres} aria-valuemin="0" aria-valuemax="100" aria-label={`Progres ${o.jenis}`}><i style={{ width: `${o.progres}%` }} /></div>
                <div className="row sp t13"><span className="mut">Tahap: {o.tahapProduksi || 'Belum dimulai'}</span><span className="b">{o.progres}%</span></div>
              </Link>
            ))}
            <Link className="btn s" style={{ alignSelf: 'flex-start' }} href="/pelanggan/pesanan?tab=produksi">Lihat semua pesanan</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
