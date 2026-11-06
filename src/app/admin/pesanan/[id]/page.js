import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { rupiah } from '@/lib/session';
import { STATUS, tanggal } from '@/lib/status';
import SpesifikasiPesanan from '@/components/SpesifikasiPesanan';
import RiwayatStatus from '@/components/RiwayatStatus';
import FormPenawaran from './FormPenawaran';
import FormTolak from './FormTolak';
import TombolKonfirmasi from '@/components/TombolKonfirmasi';
import { batalkanPesanan } from '../actions';

export const dynamic = 'force-dynamic';

function Ringkasan({ o }) {
  const sisa = (o.hargaTotal || 0) - (o.nominalDp || 0);
  return (
    <div className="sum">
      <div><span>Harga total</span><b>{rupiah(o.hargaTotal)}</b></div>
      <div><span>DP</span><b>{rupiah(o.nominalDp)}</b></div>
      <div><span>Sisa pelunasan</span><b>{rupiah(sisa)}</b></div>
      <div className="tot"><span>Estimasi pengerjaan</span><span>{o.estimasiHari} hari</span></div>
    </div>
  );
}

export default async function DetailAdmin({ params, searchParams }) {
  await wajibAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const o = await prisma.order.findUnique({
    where: { id },
    include: { user: true, product: true, logs: { orderBy: { createdAt: 'desc' } }, payments: { orderBy: { createdAt: 'desc' } } },
  });
  if (!o) notFound();

  const st = STATUS[o.status];
  const ubah = o.status === 'MENUNGGU_PERSETUJUAN' && searchParams?.ubah === '1';
  const dpPersen = o.hargaTotal && o.nominalDp ? Math.round((o.nominalDp / o.hargaTotal) * 100) : null;
  const awalForm = o.hargaTotal
    ? { harga: o.hargaTotal, mode: dpPersen === 50 ? '50' : dpPersen === 30 ? '30' : 'lain', dpLain: String(o.nominalDp), estimasi: o.estimasiHari, catatan: o.catatanAdmin }
    : null;
  const batal = batalkanPesanan.bind(null, o.id);

  return (
    <main className="page">
      <div className="crumb"><Link href="/admin/dashboard">Dashboard</Link><span>/</span><Link href="/admin/pesanan">Pesanan Masuk</Link><span>/</span><b style={{ color: 'var(--ink)' }}>{o.kode}</b></div>
      <div className="col g8">
        <div className="row"><h1>{o.kode}</h1><span className={`chip ${o.status === 'MENUNGGU_TINJAUAN' ? 'c-gray' : st.chip}`}>{st.label}</span></div>
        <p className="mut">{o.jenis} oleh {o.user.nama}. Dikirim {tanggal(o.createdAt)}.</p>
      </div>

      <div className="cols">
        <div className="a col g16">
          <SpesifikasiPesanan o={o} judul="Spesifikasi dari pelanggan" />
          <section className="card col g8">
            <h2>Data pelanggan</h2>
            <div>
              <div className="kv"><span className="k">Nama</span><span className="v">{o.user.nama}</span></div>
              <div className="kv"><span className="k">Email</span><span className="v">{o.user.email}</span></div>
              <div className="kv"><span className="k">No. HP</span><span className="v">{o.user.noHp || '-'}</span></div>
              <div className="kv"><span className="k">Alamat</span><span className="v">{o.user.alamat || '-'}</span></div>
            </div>
          </section>
          <RiwayatStatus logs={o.logs} />
        </div>

        <aside className="b2">
          {o.status === 'MENUNGGU_TINJAUAN' && (
            <>
              <FormPenawaran orderId={o.id} />
              <FormTolak orderId={o.id} />
            </>
          )}

          {o.status === 'MENUNGGU_PERSETUJUAN' && (ubah ? (
            <>
              <FormPenawaran orderId={o.id} awal={awalForm} ubah />
              <Link className="btn blk" href={`/admin/pesanan/${o.id}`}>Batal ubah</Link>
            </>
          ) : (
            <section className="card col g16">
              <div className="row sp"><h2>Penawaran terkirim</h2><span className="chip c-wait">Menunggu keputusan pelanggan</span></div>
              <Ringkasan o={o} />
              {o.catatanAdmin && <div className="alert"><span><b>Catatan ke pelanggan:</b> {o.catatanAdmin}</span></div>}
              <div className="alert info"><span>Admin menunggu pelanggan menyetujui. Setelah disetujui, status menjadi Menunggu DP dan bukti bayar masuk ke Verifikasi Pembayaran.</span></div>
              <Link className="btn blk" href={`/admin/pesanan/${o.id}?ubah=1`}>Ubah Penawaran</Link>
              <TombolKonfirmasi aksi={batal} teks="Batalkan Pesanan" kelas="btn dng blk" judul="Batalkan pesanan ini?" isi="Pesanan ditutup sebagai Dibatalkan dan tidak ada tagihan. Pesanan yang sudah dibatalkan tidak bisa dibuka kembali." tombolYa="Ya, Batalkan Pesanan" bahaya />
            </section>
          ))}

          {!['MENUNGGU_TINJAUAN', 'MENUNGGU_PERSETUJUAN'].includes(o.status) && (
            <section className="card col g16">
              <h2>Ringkasan</h2>
              {o.hargaTotal ? <Ringkasan o={o} /> : <p className="mut t13">Pesanan ini tidak memiliki penawaran.</p>}
              {o.alasanTolak && <div className="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span><b>{o.status === 'DIBATALKAN' ? 'Alasan pembatalan' : 'Alasan penolakan'}:</b> {o.alasanTolak}</span></div>}
              {o.payments.length > 0 && (
                <div className="col g8">
                  <h3>Pembayaran</h3>
                  {o.payments.map((p) => (
                    <div key={p.id} className="row sp t13">
                      <span>{p.jenis === 'DP' ? 'DP' : 'Pelunasan'} {rupiah(p.nominal)}</span>
                      <span className={`chip ${p.status === 'TERVERIFIKASI' ? 'c-ok' : p.status === 'DITOLAK' ? 'c-bad' : 'c-wait'}`}>
                        {p.status === 'TERVERIFIKASI' ? 'Terverifikasi' : p.status === 'DITOLAK' ? 'Ditolak' : 'Menunggu verifikasi'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {o.payments.some((p) => p.status === 'MENUNGGU_VERIFIKASI') && (
                <Link className="btn pri blk" href={`/admin/pembayaran?id=${o.payments.find((p) => p.status === 'MENUNGGU_VERIFIKASI').id}`}>Verifikasi pembayaran</Link>
              )}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
