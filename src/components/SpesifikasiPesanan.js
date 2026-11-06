import { ukuran } from '@/lib/status';
import GaleriFoto from '@/components/GaleriFoto';
import { fotoUrl } from '@/lib/foto';

// Kartu spesifikasi dan foto referensi. Dipakai di halaman pelanggan dan admin.
export default function SpesifikasiPesanan({ o, judul = 'Spesifikasi pesanan' }) {
  const foto = o.fotoReferensi ? o.fotoReferensi.split(',') : [];
  return (
    <section className="card col g8">
      <h2>{judul}</h2>
      <div>
        <div className="kv"><span className="k">Jenis</span><span className="v">{o.jenis}</span></div>
        {o.product && <div className="kv"><span className="k">Acuan katalog</span><span className="v">{o.product.nama}</span></div>}
        <div className="kv"><span className="k">Ukuran</span><span className="v">{ukuran(o)}</span></div>
        <div className="kv"><span className="k">Bahan</span><span className="v">{o.bahan}</span></div>
        <div className="kv"><span className="k">Finishing</span><span className="v">{o.finishing}, {o.warna}</span></div>
        <div className="kv"><span className="k">Catatan</span><span className="v">{o.catatan || '-'}</span></div>
      </div>
      <h3 style={{ marginTop: 8 }}>Foto referensi</h3>
      {foto.length === 0 ? (
        <p className="mut t13">Pelanggan tidak melampirkan foto.</p>
      ) : (
        <>
          <GaleriFoto foto={foto.map((f, i) => ({ url: fotoUrl('referensi', f), nama: `Foto referensi ${i + 1}` }))} ukuran={110} />
          <p className="t12 mut">Klik foto untuk memperbesar.</p>
        </>
      )}
    </section>
  );
}
