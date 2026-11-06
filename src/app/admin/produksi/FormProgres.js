'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { simpanProgres } from './actions';
import { TAHAP } from '@/lib/opsi';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';

function Simpan({ onKlik }) {
  const { pending } = useFormStatus();
  return <button className="btn pri" type="button" disabled={pending} onClick={onKlik}>{pending ? 'Menyimpan...' : 'Simpan Progres'}</button>;
}

export default function FormProgres({ pesanan, awalId }) {
  const [state, aksi] = useFormState(simpanProgres, null);
  const [id, setId] = useState(String(awalId || pesanan[0]?.id || ''));
  const [selesai, setSelesai] = useState(false);
  const [buka, setBuka] = useState(false);
  const [tahapPilih, setTahapPilih] = useState('');
  const formRef = useRef(null);
  const terpilih = pesanan.find((p) => String(p.id) === id);

  // Validasi bawaan browser dulu, lalu tampilkan pop up konfirmasi.
  function tanya() {
    const f = formRef.current;
    if (!f.reportValidity()) return;
    const sel = f.elements.tahap;
    const t = TAHAP.find((x) => x.nama === sel?.value);
    setTahapPilih(t ? `${t.nama} (${t.persen}%)` : '');
    setBuka(true);
  }

  if (pesanan.length === 0) {
    return <p className="mut t13">Belum ada pesanan yang sedang dalam produksi. Pesanan muncul di sini setelah DP terverifikasi.</p>;
  }

  return (
    <form action={aksi} ref={formRef} className="col g16">
      {state?.error && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>}
      <div className="f2">
        <div className="fld">
          <label htmlFor="ps">Pesanan</label>
          <select className="in" id="ps" name="orderId" value={id} onChange={(e) => setId(e.target.value)}>
            {pesanan.map((p) => <option key={p.id} value={p.id}>{p.kode}, {p.jenis} ({p.nama})</option>)}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="th">Tahap pengerjaan</label>
          <select className="in" id="th" name="tahap" key={id} defaultValue={terpilih?.tahap} disabled={selesai}>
            {TAHAP.map((t) => <option key={t.nama} value={t.nama}>{t.nama} ({t.persen}%)</option>)}
          </select>
        </div>
      </div>
      <div className="fld"><label htmlFor="ctt">Catatan untuk pelanggan (opsional)</label><textarea className="in" id="ctt" name="catatan" placeholder="Contoh: rangka selesai, lanjut pemasangan pintu" /></div>
      <label className="chk" style={{ margin: 0 }}><input type="checkbox" name="selesai" checked={selesai} onChange={(e) => setSelesai(e.target.checked)} />Tandai pengerjaan selesai (status berubah menjadi Menunggu Pelunasan)</label>
      <div className="row"><Simpan onKlik={tanya} /><Link className="btn" href="/admin/produksi">Batal</Link></div>
      {buka && (
        <KonfirmasiDialog
          judul={selesai ? 'Tandai pengerjaan selesai?' : 'Simpan progres pengerjaan?'}
          tombol={selesai ? 'Ya, Tandai Selesai' : 'Ya, Simpan Progres'}
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">
            {selesai
              ? 'Status pesanan berubah menjadi Menunggu Pelunasan dan pelanggan diminta melunasi pembayaran. Pastikan barang benar-benar sudah selesai.'
              : 'Pelanggan akan melihat tahap dan catatan terbaru ini di halaman pesanannya.'}
          </p>
          <div>
            <div className="kv"><span className="k" style={{ width: 100 }}>Pesanan</span><span className="v">{terpilih?.kode}, {terpilih?.jenis}</span></div>
            <div className="kv"><span className="k" style={{ width: 100 }}>Pelanggan</span><span className="v">{terpilih?.nama}</span></div>
            <div className="kv"><span className="k" style={{ width: 100 }}>Tahap</span><span className="v">{selesai ? 'Pengerjaan selesai' : tahapPilih}</span></div>
          </div>
        </KonfirmasiDialog>
      )}
    </form>
  );
}
