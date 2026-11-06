'use client';

import { useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';
import TombolKonfirmasi from '@/components/TombolKonfirmasi';
import { setujuiPembayaran, tolakPembayaran } from './actions';

export default function AksiPembayaran({ paymentId, dp }) {
  const [state, aksiTolak] = useFormState(tolakPembayaran.bind(null, paymentId), null);
  const [buka, setBuka] = useState(false);
  const formRef = useRef(null);
  const tanyaTolak = () => { if (formRef.current.reportValidity()) setBuka(true); };
  return (
    <div className="col g16">
      {state?.error && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>}
      <form action={aksiTolak} ref={formRef} className="col g16">
        <div className="fld">
          <label htmlFor="rs">Alasan penolakan (isi jika menolak)</label>
          <select className="in" id="rs" name="alasan" defaultValue="" required>
            <option value="">Pilih alasan</option>
            <option>Nominal tidak sesuai</option>
            <option>Bukti tidak terbaca</option>
            <option>Dana belum masuk</option>
          </select>
        </div>
        <div className="row">
          <button className="btn dng lg" type="button" onClick={tanyaTolak}>Tolak Bukti</button>
        </div>
      </form>
      <TombolKonfirmasi
        aksi={setujuiPembayaran.bind(null, paymentId)}
        teks="Setujui Pembayaran"
        kelas="btn pri lg"
        judul="Setujui pembayaran ini?"
        isi={`Pastikan dana sudah masuk di mutasi rekening dan nominalnya sesuai. ${dp ? 'Status pesanan berubah menjadi Dalam Produksi.' : 'Status pesanan berubah menjadi Siap Diantar.'}`}
        tombolYa="Ya, Setujui"
      />
      <p className="t12 mut">{dp ? 'Jika disetujui, status pesanan berubah menjadi Dalam Produksi.' : 'Jika disetujui, status pesanan berubah menjadi Siap Diantar.'} Jika ditolak, pelanggan diminta mengunggah ulang.</p>
      {buka && (
        <KonfirmasiDialog
          judul="Tolak bukti pembayaran ini?"
          tombol="Ya, Tolak Bukti"
          bahaya
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">Pelanggan diminta mengunggah bukti baru. Alasan penolakan akan terlihat oleh pelanggan: <b>{formRef.current?.elements.alasan?.value}</b>.</p>
        </KonfirmasiDialog>
      )}
    </div>
  );
}
