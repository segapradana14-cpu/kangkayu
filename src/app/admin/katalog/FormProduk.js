'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { simpanProduk } from './actions';
import { KATEGORI, MAKS_BYTES } from '@/lib/opsi';
import { unggahFoto } from '@/lib/unggah';
import PemotongFoto from '@/components/PemotongFoto';

function Simpan({ proses }) {
  const { pending } = useFormStatus();
  return <button className="btn pri" type="submit" disabled={pending || proses}>{proses ? 'Mengunggah foto...' : pending ? 'Menyimpan...' : 'Simpan Produk'}</button>;
}

export default function FormProduk({ produk }) {
  const [state, aksi] = useFormState(simpanProduk.bind(null, produk ? produk.id : null), null);
  const [berkas, setBerkas] = useState(null);
  const [mentah, setMentah] = useState(null);
  const prat = useMemo(() => (berkas ? URL.createObjectURL(berkas) : null), [berkas]);
  useEffect(() => () => { if (prat) URL.revokeObjectURL(prat); }, [prat]);
  const [galat, setGalat] = useState('');
  const [proses, setProses] = useState(false);
  const urlRef = useRef(null);
  const formRef = useRef(null);

  function pilih(e) {
    const f = e.target.files[0];
    setGalat('');
    urlRef.current.value = '';
    if (!f) { setBerkas(null); return; }
    if (!['image/jpeg', 'image/png'].includes(f.type)) { setGalat(`File "${f.name}" bukan JPG atau PNG.`); e.target.value = ''; setBerkas(null); return; }
    if (f.size > MAKS_BYTES) { setGalat(`File "${f.name}" lebih dari 5 MB.`); e.target.value = ''; setBerkas(null); return; }
    setMentah(f); // buka jendela potong dulu
  }

  // Foto diunggah langsung dari browser; ke server hanya dikirim alamatnya.
  async function saring(e) {
    if (!berkas || urlRef.current.value) return;
    e.preventDefault();
    setProses(true);
    try {
      urlRef.current.value = await unggahFoto(berkas, 'produk');
      formRef.current.requestSubmit();
    } catch (err) {
      setGalat(err.message || 'Gagal mengunggah foto. Coba lagi.');
    } finally {
      setProses(false);
    }
  }

  return (
    <form action={aksi} ref={formRef} onSubmit={saring} className="card col g16">
      <div className="row sp"><h2>{produk ? 'Ubah produk' : 'Tambah produk'}</h2><span className="chip c-gray">Form</span></div>
      {(galat || state?.error) && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{galat || state.error}</span></div>}
      <div className="fld"><label htmlFor="np">Nama produk</label><input className="in" id="np" name="nama" placeholder="Contoh: Lemari Pakaian" defaultValue={produk?.nama} required /></div>
      <div className="f2">
        <div className="fld"><label htmlFor="kt">Kategori</label><select className="in" id="kt" name="kategori" defaultValue={produk?.kategori || KATEGORI[0]}>{KATEGORI.map((k) => <option key={k}>{k}</option>)}</select></div>
        <div className="fld"><label htmlFor="hm">Harga mulai</label><div className="unit"><input className="in" id="hm" name="hargaMulai" inputMode="numeric" placeholder="2500000" style={{ paddingLeft: 44, paddingRight: 12 }} defaultValue={produk?.hargaMulai} required /><span style={{ left: 12, right: 'auto' }}>Rp</span></div></div>
      </div>
      <div className="fld"><label htmlFor="ds">Deskripsi singkat</label><textarea className="in" id="ds" name="deskripsi" placeholder="Tuliskan keunggulan dan pilihan model" defaultValue={produk?.deskripsi} required /></div>
      <label className="drop" htmlFor="foto" style={{ padding: 20, cursor: 'pointer', marginBottom: 0 }}>
        <svg className="ic" viewBox="0 0 24 24" style={{ width: 26, height: 26 }} aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
        {prat && <img src={prat} alt="Pratinjau foto produk" style={{ width: 150, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />}
        <b style={{ color: 'var(--ink)' }}>{berkas ? 'Klik untuk mengganti foto' : produk?.foto ? 'Ganti foto produk (opsional)' : 'Unggah foto produk (opsional)'}</b>
        <span className="t13">JPG atau PNG, maksimal 5 MB. Foto bisa diatur dan dipotong sebelum diunggah.</span>
        <input id="foto" type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={pilih} />
      </label>
      <input type="hidden" name="urlFoto" ref={urlRef} />
      <label className="chk" style={{ margin: 0 }}><input type="checkbox" name="aktif" defaultChecked={produk ? produk.aktif : true} />Tampilkan di katalog pelanggan</label>
      <div className="row"><Simpan proses={proses} /><Link className="btn" href="/admin/katalog">Batal</Link></div>
      {mentah && (
        <PemotongFoto
          file={mentah}
          onBatal={() => { setMentah(null); document.getElementById('foto').value = ''; }}
          onSelesai={(f) => { setBerkas(f); setMentah(null); document.getElementById('foto').value = ''; }}
        />
      )}
    </form>
  );
}
