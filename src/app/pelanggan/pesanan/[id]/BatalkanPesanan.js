'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { batalkanPesanan } from '../actions';

const ALASAN = ['Salah mengisi pesanan', 'Ingin mengubah spesifikasi', 'Sudah tidak membutuhkan', 'Menemukan pilihan lain', 'Lainnya'];
const MERAH = { background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' };

function Tombol() {
  const { pending } = useFormStatus();
  return <button className="btn dng lg" type="submit" disabled={pending}>{pending ? 'Memproses...' : 'Ya, Batalkan Pesanan'}</button>;
}

export default function BatalkanPesanan({ orderId }) {
  const [buka, setBuka] = useState(false);
  const [alasan, setAlasan] = useState(ALASAN[0]);
  const [state, aksi] = useFormState(batalkanPesanan.bind(null, orderId), null);
  const lainnya = alasan === 'Lainnya';

  // Tutup dengan tombol Esc.
  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => { if (e.key === 'Escape') setBuka(false); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [buka]);

  return (
    <>
      <section className="card col g16">
        <h2>Batalkan pesanan</h2>
        <p className="t13 mut">Pesanan masih bisa dibatalkan selama DP belum dibayar. Setelah DP terverifikasi dan produksi dimulai, pesanan tidak bisa dibatalkan dari sini.</p>
        <div className="row"><button className="btn dng" type="button" onClick={() => setBuka(true)}>Batalkan Pesanan</button></div>
      </section>

      {buka && (
        <div role="dialog" aria-modal="true" aria-labelledby="jdl-batal" onClick={(e) => { if (e.target === e.currentTarget) setBuka(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,30,.55)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
          <form action={aksi} className="card col g16" style={{ width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
            <h2 id="jdl-batal">Yakin membatalkan pesanan ini?</h2>
            <p className="mut t13">Pesanan akan ditutup dan tidak bisa dibuka lagi. Kamu bisa membuat pesanan baru kapan saja.</p>
            {state?.error && <div className="alert" role="alert" style={MERAH}><span>{state.error}</span></div>}
            <div className="fld">
              <label htmlFor="bt">Alasan pembatalan</label>
              <select className="in" id="bt" name="alasan" value={alasan} onChange={(e) => setAlasan(e.target.value)}>
                {ALASAN.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="fld">
              <label htmlFor="bc">{lainnya ? 'Tulis alasanmu' : 'Catatan (opsional)'}</label>
              <textarea className="in" id="bc" name="catatan" required={lainnya} placeholder={lainnya ? 'Jelaskan alasan pembatalan' : ''} />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn lg" type="button" onClick={() => setBuka(false)}>Tidak Jadi</button>
              <Tombol />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
