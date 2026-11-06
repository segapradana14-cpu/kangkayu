import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { wajibAdmin } from '@/lib/akses';
import { rupiah } from '@/lib/session';
import { tanggal } from '@/lib/status';
import FormProgres from './FormProgres';
import TombolSelesai from './TombolSelesai';
import { tandaiSelesai } from './actions';

export const dynamic = 'force-dynamic';

function est(o) {
  if (!o.estimasiHari) return null;
  const d = new Date(o.createdAt);
  d.setDate(d.getDate() + o.estimasiHari);
  return tanggal(d);
}

export default async function Produksi({ searchParams }) {
  await wajibAdmin();
  const dengan = { user: { select: { nama: true } }, payments: { where: { status: 'MENUNGGU_VERIFIKASI' }, select: { id: true } } };
  const ambil = (status) => prisma.order.findMany({ where: { status }, orderBy: { updatedAt: 'desc' }, include: dengan });
  const [dp, prod, lunas, siap] = await Promise.all([ambil('MENUNGGU_DP'), ambil('DALAM_PRODUKSI'), ambil('MENUNGGU_PELUNASAN'), ambil('SIAP_DIANTAR')]);

  const pesananForm = prod.map((o) => ({ id: o.id, kode: o.kode, jenis: o.jenis, nama: o.user.nama, tahap: o.tahapProduksi }));

  return (
    <main className="page">
      <div className="col g8"><h1>Produksi</h1><p className="mut">Pantau posisi tiap pesanan dan perbarui progres pengerjaan agar pelanggan bisa melihatnya.</p></div>
      {searchParams?.ok && <div className="alert ok"><span><b>Progres {searchParams.ok} tersimpan.</b> Pelanggan bisa melihatnya di halaman pesanannya.</span></div>}

      <section className="kan" aria-label="Papan status">
        <div className="kcol">
          <div className="kh"><span>Menunggu DP</span><span className="chip c-wait">{dp.length}</span></div>
          {dp.length === 0 && <div className="empty">Belum ada pesanan di tahap ini</div>}
          {dp.map((o) => (
            <div className="tk" key={o.id}>
              <div className="row sp"><b>{o.kode}</b><span className="t12 mut">{tanggal(o.createdAt)}</span></div>
              <div><div>{o.jenis}</div><div className="t13 mut">{o.user.nama}</div></div>
              <Link className="btn s" href={o.payments[0] ? `/admin/pembayaran?id=${o.payments[0].id}` : `/admin/pesanan/${o.id}`}>{o.payments[0] ? 'Verifikasi DP' : 'Lihat'}</Link>
            </div>
          ))}
        </div>

        <div className="kcol">
          <div className="kh"><span>Dalam Produksi</span><span className="chip c-prod">{prod.length}</span></div>
          {prod.length === 0 && <div className="empty">Belum ada pesanan di tahap ini</div>}
          {prod.map((o) => (
            <div className="tk" key={o.id}>
              <div className="row sp"><b>{o.kode}</b>{est(o) && <span className="t12 mut">Est. {est(o)}</span>}</div>
              <div><div>{o.jenis}</div><div className="t13 mut">{o.user.nama}</div></div>
              <div className="col g8"><div className="prog"><i style={{ width: `${o.progres}%` }} /></div><div className="row sp t12"><span className="mut">{o.tahapProduksi || 'Belum dimulai'}</span><b>{o.progres}%</b></div></div>
              <Link className="btn s pri" href={`/admin/produksi?id=${o.id}#form`}>Update progres</Link>
            </div>
          ))}
        </div>

        <div className="kcol">
          <div className="kh"><span>Menunggu Pelunasan</span><span className="chip c-wait">{lunas.length}</span></div>
          {lunas.length === 0 && <div className="empty">Belum ada pesanan di tahap ini</div>}
          {lunas.map((o) => (
            <div className="tk" key={o.id}>
              <div className="row sp"><b>{o.kode}</b></div>
              <div><div>{o.jenis}</div><div className="t13 mut">{o.user.nama}</div></div>
              <div className="col g8"><div className="prog"><i style={{ width: '100%' }} /></div><div className="row sp t12"><span className="mut">Produksi selesai</span><b>Sisa {rupiah((o.hargaTotal || 0) - (o.nominalDp || 0))}</b></div></div>
              <Link className="btn s" href={o.payments[0] ? `/admin/pembayaran?id=${o.payments[0].id}` : `/admin/pesanan/${o.id}`}>{o.payments[0] ? 'Verifikasi pelunasan' : 'Lihat'}</Link>
            </div>
          ))}
        </div>

        <div className="kcol">
          <div className="kh"><span>Siap Diantar / Diambil</span><span className="chip c-ok">{siap.length}</span></div>
          {siap.length === 0 && <div className="empty">Belum ada pesanan di tahap ini</div>}
          {siap.map((o) => (
            <div className="tk" key={o.id}>
              <div className="row sp"><b>{o.kode}</b></div>
              <div><div>{o.jenis}</div><div className="t13 mut">{o.user.nama}</div></div>
              <TombolSelesai aksi={tandaiSelesai.bind(null, o.id)} kode={o.kode} nama={o.user.nama} />
            </div>
          ))}
        </div>
      </section>

      <section className="card col g16" id="form">
        <h2>Update progres pengerjaan</h2>
        <FormProgres key={searchParams?.id || 'x'} pesanan={pesananForm} awalId={searchParams?.id} />
      </section>
    </main>
  );
}
