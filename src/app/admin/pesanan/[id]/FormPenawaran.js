'use client';

import { useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { kirimPenawaran } from '../actions';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';

const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const angka = (t) => Number(String(t || '').replace(/[^\d]/g, '')) || 0;

function Kirim({ teks, onKlik }) {
  const { pending } = useFormStatus();
  return <button className="btn pri lg blk" type="button" disabled={pending} onClick={onKlik}>{pending ? 'Menyimpan...' : teks}</button>;
}

export default function FormPenawaran({ orderId, awal, ubah }) {
  const [state, aksi] = useFormState(kirimPenawaran.bind(null, orderId), null);
  const [harga, setHarga] = useState(awal?.harga ? String(awal.harga) : '');
  const [mode, setMode] = useState(awal?.mode || '50');
  const [dpLain, setDpLain] = useState(awal?.dpLain || '');

  const [buka, setBuka] = useState(false);
  const [hari, setHari] = useState('');
  const formRef = useRef(null);
  const tanya = () => {
    if (!formRef.current.reportValidity()) return;
    setHari(formRef.current.elements.estimasi.value);
    setBuka(true);
  };

  const total = angka(harga);
  const dp = mode === 'lain' ? angka(dpLain) : Math.round((total * Number(mode)) / 100);

  return (
    <form action={aksi} ref={formRef} className="card col g16">
      <h2>{ubah ? 'Ubah penawaran' : 'Buat penawaran'}</h2>
      {state?.error && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>}
      <div className="fld">
        <label htmlFor="hg">Harga total</label>
        <div className="unit"><input className="in" id="hg" name="harga" inputMode="numeric" placeholder="Contoh: 12500000" style={{ paddingLeft: 44, paddingRight: 12 }} value={harga} onChange={(e) => setHarga(e.target.value)} required /><span style={{ left: 12, right: 'auto' }}>Rp</span></div>
      </div>
      <div className="fld">
        <label htmlFor="dp">Nominal DP</label>
        <select className="in" id="dp" name="dpMode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="50">50% dari harga total</option>
          <option value="30">30% dari harga total</option>
          <option value="lain">Nominal lain</option>
        </select>
      </div>
      {mode === 'lain' && (
        <div className="fld"><label htmlFor="dl">Nominal DP (Rp)</label><input className="in" id="dl" name="dpLain" inputMode="numeric" value={dpLain} onChange={(e) => setDpLain(e.target.value)} required /></div>
      )}
      <div className="fld">
        <label htmlFor="es">Estimasi pengerjaan</label>
        <div className="unit"><input className="in" id="es" name="estimasi" inputMode="numeric" placeholder="Contoh: 30" defaultValue={awal?.estimasi || ''} required /><span>hari</span></div>
      </div>
      <div className="fld"><label htmlFor="cn">Catatan untuk pelanggan</label><textarea className="in" id="cn" name="catatan" placeholder="Contoh: harga sudah termasuk pemasangan" defaultValue={awal?.catatan || ''} /></div>
      <div className="sum"><div><span>DP yang harus dibayar</span><b>{rp(dp)}</b></div><div><span>Sisa pelunasan</span><b>{rp(Math.max(total - dp, 0))}</b></div></div>
      <Kirim teks={ubah ? 'Simpan Perubahan' : 'Kirim Penawaran'} onKlik={tanya} />
      {buka && (
        <KonfirmasiDialog
          judul={ubah ? 'Simpan perubahan penawaran?' : 'Kirim penawaran ini?'}
          tombol={ubah ? 'Ya, Simpan' : 'Ya, Kirim Penawaran'}
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">Pastikan harga dan DP sudah benar. Pelanggan akan melihat penawaran ini di halaman pesanannya dan diminta memutuskan.</p>
          <div>
            <div className="kv"><span className="k" style={{ width: 130 }}>Harga total</span><span className="v">{rp(total)}</span></div>
            <div className="kv"><span className="k" style={{ width: 130 }}>DP</span><span className="v">{rp(dp)}</span></div>
            <div className="kv"><span className="k" style={{ width: 130 }}>Sisa pelunasan</span><span className="v">{rp(Math.max(total - dp, 0))}</span></div>
            <div className="kv"><span className="k" style={{ width: 130 }}>Estimasi</span><span className="v">{hari} hari</span></div>
          </div>
        </KonfirmasiDialog>
      )}
      <p className="t12 mut">Status berubah menjadi Menunggu Persetujuan. Pelanggan melihat penawaran di halaman pesanannya.</p>
    </form>
  );
}
