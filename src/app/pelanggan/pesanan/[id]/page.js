import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireRole, rupiah } from '@/lib/session';
import { STATUS, tanggal } from '@/lib/status';
import SpesifikasiPesanan from '@/components/SpesifikasiPesanan';
import KeputusanPenawaran from './KeputusanPenawaran';
import BatalkanPesanan from './BatalkanPesanan';
import { konfirmasiDiterima } from '../actions';

export const dynamic = 'force-dynamic';

const MERAH = { background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' };

function tambahHari(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default async function DetailPesanan({ params }) {
  const session = await requireRole('PELANGGAN');
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const o = await prisma.order.findFirst({
    where: { id, userId: Number(session.user.id) },
    include: { product: true, logs: { orderBy: { createdAt: 'desc' } }, payments: { orderBy: { createdAt: 'asc' } } },
  });
  if (!o) notFound();

  const st = STATUS[o.status];
  const sisa = (o.hargaTotal || 0) - (o.nominalDp || 0);
  const persenDp = o.hargaTotal && o.nominalDp ? Math.round((o.nominalDp / o.hargaTotal) * 100) : null;
  const logTolak = o.logs.find((l) => l.status === 'DITOLAK');
  const olehPelanggan = logTolak?.keterangan?.startsWith('Penawaran ditolak pelanggan');
  const logSetuju = o.logs.find((l) => l.keterangan === 'Penawaran disetujui pelanggan.');
  const bayar = (jenis) => o.payments.filter((p) => p.jenis === jenis);
  const dpOk = bayar('DP').find((p) => p.status === 'TERVERIFIKASI');
  const lunasOk = bayar('PELUNASAN').find((p) => p.status === 'TERVERIFIKASI');
  const estSelesai = o.estimasiHari && dpOk?.verifiedAt ? tambahHari(dpOk.verifiedAt, o.estimasiHari) : null;
  const konfirmasi = konfirmasiDiterima.bind(null, o.id);
  const logBatal = o.logs.find((l) => l.status === 'DIBATALKAN');
  const batalOlehPelanggan = logBatal?.keterangan?.startsWith('Pesanan dibatalkan pelanggan');
  const tungguVerifikasi = o.payments.some((p) => p.status === 'MENUNGGU_VERIFIKASI');
  const statusBisaBatal = ['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_DP'].includes(o.status);

  const Ringkas = ({ children }) => (
    <div className="sum">
      <div><span>Harga total</span><b>{rupiah(o.hargaTotal)}</b></div>
      {children}
    </div>
  );

  return (
    <main className="page">
      <div className="crumb"><Link href="/pelanggan/dashboard">Dashboard</Link><span>/</span><Link href="/pelanggan/pesanan">Pesanan Saya</Link><span>/</span><b style={{ color: 'var(--ink)' }}>{o.kode}</b></div>
      <div className="col g8">
        <div className="row"><h1>{o.kode}</h1><span className={`chip ${st.chip}`}>{st.label}</span></div>
        <p className="mut">{o.jenis}. Dikirim {tanggal(o.createdAt)}.</p>
      </div>

      <div className="cols">
        <div className="a col g16">
          <SpesifikasiPesanan o={o} />

          {o.status === 'MENUNGGU_TINJAUAN' && (
            <section className="card col g16">
              <div className="row sp"><h2>Pesanan sedang ditinjau</h2><span className="chip c-gray">Menunggu tinjauan</span></div>
              <div className="alert info"><span>Admin sedang memeriksa spesifikasi pesananmu. Penawaran berisi harga, estimasi, dan nominal DP akan dikirim setelah tinjauan selesai.</span></div>
              <div className="row"><Link className="btn" href="/pelanggan/pesanan">Kembali ke Pesanan Saya</Link></div>
            </section>
          )}

          {o.status === 'MENUNGGU_PERSETUJUAN' && (
            <section className="card col g16">
              <div className="row sp"><h2>Penawaran dari admin</h2><span className="chip c-wait">Menunggu keputusanmu</span></div>
              <Ringkas>
                <div><span>DP{persenDp ? ` (${persenDp}%)` : ''}, dibayar sekarang</span><b>{rupiah(o.nominalDp)}</b></div>
                <div><span>Sisa, dibayar saat produk selesai</span><b>{rupiah(sisa)}</b></div>
                <div className="tot"><span>Estimasi pengerjaan</span><span>{o.estimasiHari} hari</span></div>
              </Ringkas>
              {o.catatanAdmin && <div className="alert"><span><b>Catatan admin:</b> {o.catatanAdmin}</span></div>}
              <KeputusanPenawaran orderId={o.id} persenDp={persenDp} />
            </section>
          )}

          {o.status === 'DITOLAK' && (
            <section className="card col g16">
              <div className="row sp"><h2>{olehPelanggan ? 'Penawaran ditolak' : 'Pesanan ditolak admin'}</h2><span className="chip c-bad">Ditolak</span></div>
              <div className="alert" style={MERAH}>
                <span>
                  {olehPelanggan ? `Kamu menolak penawaran ini pada ${tanggal(logTolak.createdAt)}.` : `Admin tidak dapat mengerjakan pesanan ini${logTolak ? ` (${tanggal(logTolak.createdAt)})` : ''}.`}
                  {' '}Alasan: <b>{o.alasanTolak || '-'}</b>. Pesanan ditutup dan tidak ada tagihan.
                </span>
              </div>
              <div className="row"><Link className="btn pri lg" href="/pelanggan/buat-pesanan">Buat Pesanan Baru</Link><Link className="btn lg" href="/pelanggan/pesanan">Kembali ke Pesanan Saya</Link></div>
            </section>
          )}

          {o.status === 'DIBATALKAN' && (
            <section className="card col g16">
              <div className="row sp"><h2>Pesanan dibatalkan</h2><span className="chip c-gray">Dibatalkan</span></div>
              <div className="alert">
                <span>
                  {batalOlehPelanggan ? `Kamu membatalkan pesanan ini pada ${tanggal(logBatal.createdAt)}.` : 'Pesanan ini dibatalkan oleh admin.'}
                  {o.alasanTolak ? <> Alasan: <b>{o.alasanTolak}</b>.</> : null} Tidak ada tagihan.
                </span>
              </div>
              <div className="row"><Link className="btn pri lg" href="/pelanggan/buat-pesanan">Buat Pesanan Baru</Link></div>
            </section>
          )}

          {o.status === 'MENUNGGU_DP' && (
            <section className="card col g16">
              <div className="row sp"><h2>Penawaran disetujui</h2><span className="chip c-wait">Menunggu DP</span></div>
              <div className="alert ok"><span>Kamu sudah menyetujui penawaran ini{logSetuju ? ` pada ${tanggal(logSetuju.createdAt)}` : ''}. Bayar DP agar produksi bisa dimulai.</span></div>
              <Ringkas>
                <div className="tot"><span>DP{persenDp ? ` ${persenDp}%` : ''} yang harus dibayar</span><span>{rupiah(o.nominalDp)}</span></div>
                <div><span>Sisa, dibayar saat produk selesai</span><b>{rupiah(sisa)}</b></div>
              </Ringkas>
              <div className="row"><Link className="btn pri lg" href={`/pelanggan/pembayaran?order=${o.id}`}>Bayar DP Sekarang</Link></div>
            </section>
          )}

          {o.status === 'DALAM_PRODUKSI' && (
            <>
              <section className="card col g16">
                <div className="row sp"><h2>Progres produksi</h2><span className="chip c-prod">{o.progres}%</span></div>
                <div className="prog" role="progressbar" aria-valuenow={o.progres} aria-valuemin="0" aria-valuemax="100"><i style={{ width: `${o.progres}%` }} /></div>
                <div className="t13 mut">Tahap: {o.tahapProduksi || 'Belum dimulai'}</div>
              </section>
              <section className="card col g16">
                <h2>Pembayaran</h2>
                <div className="row sp"><div><div className="b">DP{persenDp ? ` ${persenDp}%` : ''}</div><div className="t13 mut">{rupiah(o.nominalDp)}</div></div><span className="chip c-ok">Terverifikasi</span></div>
                <div className="row sp" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}><div><div className="b">Pelunasan</div><div className="t13 mut">{rupiah(sisa)}</div></div><span className="chip c-gray">Dibayar setelah produk selesai</span></div>
                <div className="alert info"><span>Kamu akan melihat tagihan pelunasan di sini dan di dashboard saat produk selesai.</span></div>
              </section>
            </>
          )}

          {o.status === 'MENUNGGU_PELUNASAN' && (
            <section className="card col g16">
              <div className="row sp"><h2>Pelunasan</h2><span className="chip c-wait">Menunggu pembayaran</span></div>
              <div className="row sp"><div><div className="b">DP{persenDp ? ` ${persenDp}%` : ''}</div><div className="t13 mut">{rupiah(o.nominalDp)}</div></div><span className="chip c-ok">Terverifikasi</span></div>
              <div className="sum"><div><span>Sisa yang harus dibayar</span><b>{rupiah(sisa)}</b></div></div>
              <div className="row"><Link className="btn pri lg" href={`/pelanggan/pembayaran?order=${o.id}`}>Bayar Pelunasan</Link></div>
            </section>
          )}

          {o.status === 'SIAP_DIANTAR' && (
            <section className="card col g16">
              <div className="row sp"><h2>Siap diantar atau diambil</h2><span className="chip c-ok">Pelunasan terverifikasi</span></div>
              <div className="alert ok"><span>Pembayaran lunas. Pesananmu sudah selesai dikerjakan dan siap diserahterimakan. Admin akan menghubungimu untuk jadwalnya.</span></div>
              <div className="sum"><div><span>Total dibayar</span><b>{rupiah(o.hargaTotal)}</b></div></div>
              <form action={konfirmasi}><button className="btn pri lg" type="submit">Konfirmasi Pesanan Diterima</button></form>
            </section>
          )}

          {o.status === 'SELESAI' && (
            <section className="card col g16">
              <div className="row sp"><h2>Pesanan selesai</h2><span className="chip c-ok">Selesai</span></div>
              <div className="alert ok"><span>Pesanan sudah kamu terima. Terima kasih sudah memesan di KangKayu.</span></div>
              <h3>Ringkasan pembayaran</h3>
              <div className="sum">
                <div><span>DP{dpOk?.verifiedAt ? ` (${tanggal(dpOk.verifiedAt)})` : ''}</span><span>{rupiah(o.nominalDp)} <span className="chip c-ok">Terverifikasi</span></span></div>
                <div><span>Pelunasan{lunasOk?.verifiedAt ? ` (${tanggal(lunasOk.verifiedAt)})` : ''}</span><span>{rupiah(sisa)} <span className="chip c-ok">Terverifikasi</span></span></div>
                <div className="tot"><span>Total dibayar</span><span>{rupiah(o.hargaTotal)}</span></div>
              </div>
              <div className="row"><Link className="btn" href="/pelanggan/pembayaran">Lihat Riwayat Pembayaran</Link><Link className="btn pri" href="/pelanggan/buat-pesanan">Pesan Furniture Lagi</Link></div>
            </section>
          )}

          {statusBisaBatal && !tungguVerifikasi && <BatalkanPesanan orderId={o.id} />}
          {statusBisaBatal && tungguVerifikasi && (
            <div className="alert info"><span>Pesanan belum bisa dibatalkan karena bukti pembayaran sedang diverifikasi admin.</span></div>
          )}
        </div>

        <aside className="b2">
          <section className="card col g16">
            <h2>Status pesanan</h2>
            <div className="tl">
              {o.logs.map((lg, i) => (
                <div key={lg.id} className={`ti ${i === 0 && lg.status !== 'SELESAI' ? 'now' : 'done'}${i === o.logs.length - 1 ? ' last' : ''}`}>
                  <span className="pt" />
                  <div><div className="tt">{STATUS[lg.status].label}</div><div className="dd">{tanggal(lg.createdAt)}{lg.keterangan ? `. ${lg.keterangan}` : ''}</div></div>
                </div>
              ))}
            </div>
          </section>
          <section className="card col g8">
            <div className="t12 mut b">ESTIMASI SELESAI</div>
            <div className="b" style={{ fontSize: 18 }}>
              {o.status === 'SELESAI' ? 'Sudah selesai' : estSelesai ? tanggal(estSelesai) : o.estimasiHari ? `${o.estimasiHari} hari sejak DP terverifikasi` : 'Ditentukan setelah penawaran'}
            </div>
          </section>
          <Link className="btn blk" href="/pelanggan/pesanan">Kembali ke daftar pesanan</Link>
        </aside>
      </div>
    </main>
  );
}
