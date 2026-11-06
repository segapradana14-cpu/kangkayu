import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { rupiah } from '@/lib/session';
import Ikon from '@/components/Ikon';
import AksiPembayaran from './AksiPembayaran';
import GaleriFoto from '@/components/GaleriFoto';
import { fotoUrl } from '@/lib/foto';

export const dynamic = 'force-dynamic';

const TAB = [
  { id: 'menunggu', teks: 'Menunggu', status: 'MENUNGGU_VERIFIKASI' },
  { id: 'terverifikasi', teks: 'Terverifikasi', status: 'TERVERIFIKASI' },
  { id: 'ditolak', teks: 'Ditolak', status: 'DITOLAK' },
];

const waktu = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default async function VerifikasiPembayaran({ searchParams }) {
  await wajibAdmin();

  // Jika datang dari ?id=, buka tab sesuai status pembayaran itu.
  let tab = TAB.find((t) => t.id === searchParams?.tab);
  if (!tab && searchParams?.id) {
    const p = await prisma.payment.findUnique({ where: { id: Number(searchParams.id) || 0 }, select: { status: true } });
    tab = TAB.find((t) => t.status === p?.status);
  }
  tab = tab || TAB[0];

  const [hitung, daftar] = await Promise.all([
    prisma.payment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.payment.findMany({
      where: { status: tab.status },
      orderBy: { createdAt: 'desc' },
      include: { order: { include: { user: { select: { nama: true } } } } },
    }),
  ]);
  const jml = (s) => hitung.find((h) => h.status === s)?._count._all || 0;
  const dipilih = daftar.find((p) => String(p.id) === String(searchParams?.id)) || daftar[0];

  return (
    <main className="page">
      <div className="col g8"><h1>Verifikasi Pembayaran</h1><p className="mut">Cocokkan bukti transfer dengan mutasi rekening sebelum menyetujui.</p></div>

      <div className="cols">
        <section className="card p0" style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div className="tabs" style={{ padding: '0 12px' }}>
            {TAB.map((t) => <Link key={t.id} className={t.id === tab.id ? 'on' : ''} href={`/admin/pembayaran?tab=${t.id}`}>{t.teks}<span className="n">{jml(t.status)}</span></Link>)}
          </div>
          {daftar.length === 0 && <div style={{ padding: 20 }} className="mut">Tidak ada pembayaran di tab ini.</div>}
          {daftar.map((p) => (
            <Link key={p.id} className={`pay${dipilih?.id === p.id ? ' on' : ''}`} href={`/admin/pembayaran?tab=${tab.id}&id=${p.id}`}>
              <span className="thumb"><Ikon nama="card" /></span>
              <div className="grow">
                <div className="row sp"><b>{p.order.kode}</b><span className="chip c-wait">{p.jenis === 'DP' ? 'DP' : 'Pelunasan'}</span></div>
                <div className="t13 mut">{p.order.user.nama} · {p.order.jenis}</div>
                <div className="b" style={{ marginTop: 4 }}>{rupiah(p.nominal)}</div>
                <div className="t12 mut">Diunggah {waktu(p.createdAt)}</div>
              </div>
            </Link>
          ))}
        </section>

        {dipilih ? (
          <section className="card col g16" style={{ flex: '2 1 560px', minWidth: 0 }}>
            <div>
              <div className="row"><h2>{dipilih.order.kode}</h2><span className="chip c-wait">Pembayaran {dipilih.jenis === 'DP' ? 'DP' : 'pelunasan'}</span></div>
              <div className="t13 mut" style={{ marginTop: 4 }}>{dipilih.order.user.nama} · {dipilih.order.jenis}</div>
            </div>
            <div className="cols" style={{ gap: 20 }}>
              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                {dipilih.buktiBayar ? (
                  <div className="col g8">
                    <div className="t13 mut b">Bukti transfer ({dipilih.buktiBayar.split(',').length} foto)</div>
                    <GaleriFoto foto={dipilih.buktiBayar.split(',').map((f, i) => ({ url: fotoUrl('bukti', f), nama: `Bukti ${i + 1}` }))} ukuran={110} />
                    <p className="t12 mut">Klik foto untuk memperbesar.</p>
                  </div>
                ) : <div className="proof">Tidak ada bukti</div>}
              </div>
              <div className="col g16" style={{ flex: '1 1 280px', minWidth: 0 }}>
                <div>
                  <div className="kv"><span className="k" style={{ width: 120 }}>Jenis</span><span className="v">{dipilih.jenis === 'DP' ? 'DP' : 'Pelunasan'}</span></div>
                  <div className="kv"><span className="k" style={{ width: 120 }}>Nominal</span><span className="v">{rupiah(dipilih.nominal)}</span></div>
                  <div className="kv"><span className="k" style={{ width: 120 }}>Total pesanan</span><span className="v">{rupiah(dipilih.order.hargaTotal)}</span></div>
                  <div className="kv"><span className="k" style={{ width: 120 }}>Diunggah</span><span className="v">{waktu(dipilih.createdAt)}</span></div>
                  {dipilih.status === 'DITOLAK' && <div className="kv"><span className="k" style={{ width: 120 }}>Alasan ditolak</span><span className="v">{dipilih.alasanTolak}</span></div>}
                  {dipilih.verifiedAt && <div className="kv"><span className="k" style={{ width: 120 }}>Diverifikasi</span><span className="v">{waktu(dipilih.verifiedAt)}</span></div>}
                </div>
                {dipilih.status === 'MENUNGGU_VERIFIKASI' && (
                  <div>
                    <h3>Cek sebelum menyetujui</h3>
                    <div className="ck"><i /><span>Nominal sesuai penawaran</span></div>
                    <div className="ck"><i /><span>Nama pengirim cocok dengan pelanggan</span></div>
                    <div className="ck"><i /><span>Dana sudah masuk di mutasi rekening</span></div>
                  </div>
                )}
              </div>
            </div>
            {dipilih.status === 'MENUNGGU_VERIFIKASI' && <AksiPembayaran key={dipilih.id} paymentId={dipilih.id} dp={dipilih.jenis === 'DP'} />}
          </section>
        ) : null}
      </div>
    </main>
  );
}
