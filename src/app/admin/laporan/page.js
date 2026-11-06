import { wajibAdmin } from '@/lib/akses';
import { rupiah } from '@/lib/session';
import { STATUS, tanggal } from '@/lib/status';
import { ambilLaporan, periode, STATUS_LAPORAN } from '@/lib/laporan';
import TombolCetak from './TombolCetak';

export const dynamic = 'force-dynamic';

const juta = (n) => 'Rp ' + (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
const tgl = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function Laporan({ searchParams }) {
  await wajibAdmin();
  const p = periode(searchParams);
  const lap = await ambilLaporan(p);
  const qs = new URLSearchParams({ dari: p.dari, sampai: p.sampai, ...(p.status ? { status: p.status } : {}) });

  return (
    <main className="page">
      <div className="row sp">
        <div className="col g8"><h1>Laporan Pesanan dan Pendapatan</h1><p className="mut">Periode {tgl(p.dari)} sampai {tgl(p.sampai)}.</p></div>
        <div className="row no-print">
          <TombolCetak />
          <a className="btn" href={`/admin/laporan/export?${qs}`}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>Ekspor Excel
          </a>
        </div>
      </div>

      <form className="card no-print" action="/admin/laporan">
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="fld" style={{ width: 180 }}><label htmlFor="d1">Dari tanggal</label><input className="in" id="d1" type="date" name="dari" defaultValue={p.dari} /></div>
          <div className="fld" style={{ width: 180 }}><label htmlFor="d2">Sampai tanggal</label><input className="in" id="d2" type="date" name="sampai" defaultValue={p.sampai} /></div>
          <div className="fld" style={{ width: 220 }}>
            <label htmlFor="st">Status</label>
            <select className="in" id="st" name="status" defaultValue={p.status}>{STATUS_LAPORAN.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
          </div>
          <button className="btn pri" type="submit">Tampilkan</button>
        </div>
      </form>

      <section className="cards" aria-label="Ringkasan laporan">
        <div className="card stat"><div className="k">Total Pesanan</div><div className="v">{lap.baris.length}</div><div className="t12 mut">{lap.selesai} selesai, {lap.berjalan} berjalan</div></div>
        <div className="card stat"><div className="k">Nilai Pesanan</div><div className="v">{juta(lap.nilai)}</div><div className="t12 mut">Jumlah harga pesanan yang berjalan atau selesai</div></div>
        <div className="card stat"><div className="k">Pendapatan Terverifikasi</div><div className="v">{juta(lap.dibayar)}</div><div className="t12 mut">Pembayaran yang sudah diverifikasi</div></div>
        <div className="card stat"><div className="k">Sisa Tagihan</div><div className="v">{juta(lap.sisa)}</div><div className="t12 mut">Belum dibayar pelanggan</div></div>
      </section>

      <section className="card p0">
        <div className="hd"><h2>Rincian pesanan</h2><span className="t13 mut">{lap.baris.length} pesanan</span></div>
        {lap.baris.length === 0 ? (
          <div style={{ padding: 28 }}><div className="empty" style={{ marginTop: 0 }}>Tidak ada pesanan pada periode ini.</div></div>
        ) : (
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>Tanggal</th><th>Kode</th><th>Pelanggan</th><th>Produk</th><th className="r">Nilai</th><th className="r">Dibayar</th><th>Status</th></tr></thead>
              <tbody>
                {lap.baris.map((b) => (
                  <tr key={b.id}>
                    <td>{tanggal(b.tanggal)}</td><td className="b">{b.kode}</td><td>{b.pelanggan}</td><td>{b.produk}</td>
                    <td className="r">{b.nilai ? b.nilai.toLocaleString('id-ID') : '-'}</td>
                    <td className="r">{b.dibayar.toLocaleString('id-ID')}</td>
                    <td><span className={`chip ${STATUS[b.status].chip}`}>{STATUS[b.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={4}>Total</td><td className="r">{lap.nilai.toLocaleString('id-ID')}</td><td className="r">{lap.dibayar.toLocaleString('id-ID')}</td><td /></tr></tfoot>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
