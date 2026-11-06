import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole, rupiah } from '@/lib/session';
import { tanggal } from '@/lib/status';
import Ikon from '@/components/Ikon';
import FormBukti from './FormBukti';

export const dynamic = 'force-dynamic';

const CHIP = { TERVERIFIKASI: ['c-ok', 'Terverifikasi'], DITOLAK: ['c-bad', 'Ditolak'], MENUNGGU_VERIFIKASI: ['c-wait', 'Menunggu verifikasi'] };

export default async function Pembayaran({ searchParams }) {
  const session = await requireRole('PELANGGAN');
  const userId = Number(session.user.id);

  const [orders, riwayat] = await Promise.all([
    prisma.order.findMany({
      where: { userId, status: { in: ['MENUNGGU_DP', 'MENUNGGU_PELUNASAN'] } },
      include: { payments: { orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.payment.findMany({ where: { order: { userId } }, orderBy: { createdAt: 'desc' }, include: { order: { select: { kode: true } } } }),
  ]);

  const tagihan = orders.map((o) => {
    const jenis = o.status === 'MENUNGGU_DP' ? 'DP' : 'PELUNASAN';
    const nominal = jenis === 'DP' ? o.nominalDp : (o.hargaTotal || 0) - (o.nominalDp || 0);
    const terakhir = o.payments.find((p) => p.jenis === jenis);
    return { o, jenis, nominal, menunggu: terakhir?.status === 'MENUNGGU_VERIFIKASI', ditolak: terakhir?.status === 'DITOLAK' ? terakhir : null };
  });

  const pilih = tagihan.find((t) => String(t.o.id) === String(searchParams?.order)) || tagihan.find((t) => !t.menunggu) || tagihan[0];

  return (
    <main className="page">
      <div className="col g8"><h1>Pembayaran</h1><p className="mut">Bayar DP setelah menyetujui penawaran, dan pelunasan setelah produk selesai. Pembayaran lewat transfer bank, lalu unggah bukti transfer.</p></div>

      {searchParams?.terkirim && (
        <div className="alert ok"><span><b>Bukti pembayaran {searchParams.terkirim} terkirim.</b> Admin akan memverifikasinya. Status pesanan diperbarui setelah terverifikasi.</span></div>
      )}

      <div className="cols">
        <div className="a col g16">
          <section className="card p0">
            <div className="hd"><h2>Tagihan yang perlu dibayar</h2><span className="chip c-wait">{tagihan.length} tagihan</span></div>
            {tagihan.length === 0 && <div style={{ padding: 20 }} className="mut">Tidak ada tagihan saat ini.</div>}
            {tagihan.map((t) => (
              <div className="act" key={t.o.id} style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
                <span className="sico blu"><Ikon nama="card" /></span>
                <div className="grow">
                  <div className="row sp"><b>{t.jenis === 'DP' ? 'Pembayaran DP' : 'Pelunasan'} {t.o.jenis}</b><span className={`chip ${t.menunggu ? 'c-prod' : 'c-wait'}`}>{t.menunggu ? 'Menunggu verifikasi' : t.ditolak ? 'Bukti ditolak' : 'Belum dibayar'}</span></div>
                  <div className="t13 mut">{t.o.kode}</div>
                  <div className="b" style={{ marginTop: 4 }}>{rupiah(t.nominal)}</div>
                  {t.ditolak && <div className="t12" style={{ color: '#8f2a22', marginTop: 4 }}>Bukti ditolak: {t.ditolak.alasanTolak || 'tidak sesuai'}. Unggah ulang bukti yang benar.</div>}
                </div>
                {!t.menunggu && <Link className={`btn s ${t === pilih ? '' : 'pri'}`} href={`/pelanggan/pembayaran?order=${t.o.id}`}>{t.ditolak ? 'Unggah ulang' : 'Bayar'}</Link>}
              </div>
            ))}
          </section>

          {pilih && !pilih.menunggu && (
            <section className="card col g16">
              <div className="row sp"><h2>{pilih.jenis === 'DP' ? 'Pembayaran DP' : 'Pelunasan'}</h2><span className="chip c-wait">Menunggu pembayaran</span></div>
              <div className="sum">
                <div><span>Pesanan</span><span>{pilih.o.kode} · {pilih.o.jenis}</span></div>
                <div><span>Total pesanan</span><span>{rupiah(pilih.o.hargaTotal)}</span></div>
                <div className="tot"><span>{pilih.jenis === 'DP' ? 'DP yang harus dibayar' : 'Sisa yang harus dibayar'}</span><span>{rupiah(pilih.nominal)}</span></div>
              </div>
              <div className="sum">
                <div><span>Bank tujuan</span><span>SEABANK</span></div>
                <div><span>No. rekening</span><span>9012 4399 7018</span></div>
                <div><span>Atas nama</span><span>SEGA PRADANA</span></div>
              </div>
              <FormBukti key={pilih.o.id} orderId={pilih.o.id} teksKirim={pilih.jenis === 'DP' ? 'Kirim Bukti DP' : 'Kirim Bukti Pelunasan'} />
            </section>
          )}
          {pilih && pilih.menunggu && (
            <section className="card col g16">
              <div className="alert info"><span>Bukti pembayaran untuk {pilih.o.kode} sudah terkirim dan sedang diverifikasi admin.</span></div>
            </section>
          )}

          <section className="card p0">
            <div className="hd"><h2>Riwayat pembayaran</h2></div>
            {riwayat.length === 0 ? <div style={{ padding: 20 }} className="mut">Belum ada pembayaran.</div> : (
              <div className="scroll">
                <table className="tbl">
                  <thead><tr><th>Tanggal</th><th>Pesanan</th><th>Jenis</th><th className="r">Nominal</th><th>Status</th></tr></thead>
                  <tbody>
                    {riwayat.map((p) => (
                      <tr key={p.id}>
                        <td>{tanggal(p.createdAt)}</td><td className="b">{p.order.kode}</td><td>{p.jenis === 'DP' ? 'DP' : 'Pelunasan'}</td>
                        <td className="r">{Number(p.nominal).toLocaleString('id-ID')}</td>
                        <td><span className={`chip ${CHIP[p.status][0]}`}>{CHIP[p.status][1]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="b2">
          <section className="card col g16">
            <h2>Cara membayar</h2>
            <div className="tl">
              <div className="ti done"><span className="pt" /><div><div className="tt">Transfer ke rekening</div><div className="dd">Sesuai nominal tagihan</div></div></div>
              <div className="ti now"><span className="pt" /><div><div className="tt">Unggah bukti transfer</div><div className="dd">Foto atau tangkapan layar</div></div></div>
              <div className="ti todo last"><span className="pt" /><div><div className="tt">Admin memverifikasi</div><div className="dd">Status pesanan diperbarui</div></div></div>
            </div>
          </section>
          <section className="card col g8">
            <h3>Kapan harus membayar?</h3>
            <p className="mut t13"><b>DP</b> dibayar setelah kamu menyetujui penawaran, produksi dimulai setelah DP terverifikasi. <b>Pelunasan</b> dibayar saat produk selesai, sebelum diantar atau diambil.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
