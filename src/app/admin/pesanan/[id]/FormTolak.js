'use client';

import { useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';
import { tolakPesanan } from '../actions';

function Tombol({ onKlik }) {
  const { pending } = useFormStatus();
  return <button className="btn dng blk" type="button" disabled={pending} onClick={onKlik}>{pending ? 'Mengirim...' : 'Tolak dan Kirim Alasan'}</button>;
}

export default function FormTolak({ orderId }) {
  const [state, aksi] = useFormState(tolakPesanan.bind(null, orderId), null);
  const [buka, setBuka] = useState(false);
  const formRef = useRef(null);
  const tanya = () => { if (formRef.current.reportValidity()) setBuka(true); };
  return (
    <form action={aksi} ref={formRef} className="card col g16">
      <h3>Jika pesanan tidak bisa dikerjakan</h3>
      {state?.error && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>}
      <div className="fld"><label htmlFor="al">Alasan penolakan</label><textarea className="in" id="al" name="alasan" placeholder="Jelaskan alasan agar pelanggan paham" required /></div>
      <Tombol onKlik={tanya} />
      {buka && (
        <KonfirmasiDialog
          judul="Tolak pesanan ini?"
          tombol="Ya, Tolak Pesanan"
          bahaya
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">Pesanan ditutup tanpa tagihan dan pelanggan menerima alasan penolakan. Pesanan yang sudah ditolak tidak bisa dibuka kembali.</p>
        </KonfirmasiDialog>
      )}
    </form>
  );
}
