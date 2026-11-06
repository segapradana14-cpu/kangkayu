'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { setujuiPenawaran, tolakPenawaran } from '../actions';

function Tombol({ teks, kelas }) {
  const { pending } = useFormStatus();
  return <button className={kelas} type="submit" disabled={pending}>{pending ? 'Memproses...' : teks}</button>;
}

export default function KeputusanPenawaran({ orderId, persenDp }) {
  const [tolak, setTolak] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [state, aksiTolak] = useFormState(tolakPenawaran.bind(null, orderId), null);

  return (
    <>
      <form action={setujuiPenawaran.bind(null, orderId)} className="col g16">
        <label className="chk" style={{ margin: 0 }}>
          <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} required />
          Saya setuju dengan harga, estimasi pengerjaan, dan ketentuan DP{persenDp ? ` ${persenDp}%` : ''} di atas
        </label>
        <div className="row">
          <Tombol teks="Setujui Penawaran" kelas="btn pri lg" />
          <button className="btn dng lg" type="button" onClick={() => setTolak(true)}>Tolak Penawaran</button>
        </div>
      </form>
      <p className="t12 mut">Setelah disetujui, kamu diminta membayar DP. Produksi dimulai setelah DP terverifikasi admin. Jika menolak, pesanan ditutup dan bisa dibuat ulang.</p>
      {tolak && (
        <form action={aksiTolak} className="col g16" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <h3>Alasan penolakan</h3>
          {state?.error && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>}
          <div className="fld">
            <label htmlFor="rj">Pilih alasan</label>
            <select className="in" id="rj" name="alasan" defaultValue="Harga terlalu tinggi">
              <option>Harga terlalu tinggi</option>
              <option>Estimasi pengerjaan terlalu lama</option>
              <option>Spesifikasi ingin diubah</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div className="fld"><label htmlFor="rn">Catatan untuk admin (opsional)</label><textarea className="in" id="rn" name="catatan" placeholder="Contoh: bersedia jika harga bisa disesuaikan" /></div>
          <div className="row"><Tombol teks="Kirim Penolakan" kelas="btn dng" /><button className="btn" type="button" onClick={() => setTolak(false)}>Batal</button></div>
        </form>
      )}
    </>
  );
}
