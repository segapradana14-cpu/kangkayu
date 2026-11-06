'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { unggahBukti } from './actions';
import GaleriFoto from '@/components/GaleriFoto';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';
import { MAKS_FOTO, MAKS_BYTES } from '@/lib/opsi';
import { unggahFoto } from '@/lib/unggah';

function Kirim({ teks, onKlik, proses }) {
  const { pending } = useFormStatus();
  const sibuk = pending || proses;
  return <button className="btn pri lg" type="button" disabled={sibuk} onClick={onKlik}>{sibuk ? 'Mengunggah...' : teks}</button>;
}

export default function FormBukti({ orderId, teksKirim }) {
  const [state, aksi] = useFormState(unggahBukti.bind(null, orderId), null);
  const [berkas, setBerkas] = useState([]);
  const [kosong, setKosong] = useState(false);
  const [galat, setGalat] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const [buka, setBuka] = useState(false);
  const [proses, setProses] = useState(false);
  const urlRef = useRef(null);
  const jenis = teksKirim.includes('Pelunasan') ? 'pelunasan' : 'DP';

  // Alamat sementara untuk pratinjau; dilepas saat daftar berubah.
  const pratinjau = useMemo(() => berkas.map((f) => ({ url: URL.createObjectURL(f), nama: f.name })), [berkas]);
  useEffect(() => () => pratinjau.forEach((p) => URL.revokeObjectURL(p.url)), [pratinjau]);

  // Samakan isi input file dengan daftar berkas yang dipilih.
  function sinkron(daftar) {
    const dt = new DataTransfer();
    daftar.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
    setBerkas(daftar);
  }

  function pilih(e) {
    const baru = Array.from(e.target.files);
    let pesan = '';
    const layak = baru.filter((f) => {
      if (!['image/jpeg', 'image/png'].includes(f.type)) { pesan = `File "${f.name}" bukan JPG atau PNG.`; return false; }
      if (f.size > MAKS_BYTES) { pesan = `File "${f.name}" lebih dari 5 MB.`; return false; }
      return true;
    });
    // Gabungkan dengan pilihan sebelumnya, hindari duplikat.
    const gabung = [...berkas];
    for (const f of layak) if (!gabung.some((g) => g.name === f.name && g.size === f.size)) gabung.push(f);
    if (gabung.length > MAKS_FOTO) pesan = `Maksimal ${MAKS_FOTO} foto per pembayaran.`;
    setGalat(pesan);
    setKosong(false);
    sinkron(gabung.slice(0, MAKS_FOTO));
  }

  function hapus(i) {
    setGalat('');
    sinkron(berkas.filter((_, x) => x !== i));
  }

  // Tanpa foto: tampilkan peringatan. Dengan foto: minta konfirmasi dulu.
  function tanya() {
    if (berkas.length === 0) { setKosong(true); return; }
    setBuka(true);
  }

  // Foto diunggah langsung dari browser; ke server hanya dikirim alamatnya.
  async function kirim() {
    setBuka(false);
    setProses(true);
    try {
      const urls = await Promise.all(berkas.map((f) => unggahFoto(f, 'bukti')));
      urlRef.current.value = urls.join(',');
      formRef.current.requestSubmit();
    } catch (e) {
      setGalat(e.message || 'Gagal mengunggah foto. Coba lagi.');
    } finally {
      setProses(false);
    }
  }

  const merah = { background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' };

  return (
    <form
      action={aksi}
      ref={formRef}
      className="col g16"
      onSubmit={(e) => {
        // Cegah pengiriman jika belum ada foto bukti yang dipilih.
        if (berkas.length === 0) { e.preventDefault(); setKosong(true); }
      }}
    >
      {kosong && berkas.length === 0 && (
        <div className="alert" role="alert" style={merah}>
          <span><b>Bukti transfer belum diunggah.</b> Pilih foto atau tangkapan layar bukti transfer terlebih dahulu sebelum mengirim.</span>
        </div>
      )}
      {galat && <div className="alert" role="alert" style={merah}><span>{galat}</span></div>}
      {state?.error && <div className="alert" role="alert" style={merah}><span>{state.error}</span></div>}

      <input type="hidden" name="urlFoto" ref={urlRef} />
      <input ref={inputRef} id="bukti" type="file" accept="image/jpeg,image/png" multiple style={{ display: 'none' }} onChange={pilih} />

      {berkas.length > 0 ? (
        <div className="col g16" style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16 }}>
          <div className="row sp">
            <div className="t13 mut b">{berkas.length} foto bukti dipilih</div>
            {berkas.length < MAKS_FOTO && <label className="btn s" htmlFor="bukti" style={{ marginBottom: 0, cursor: 'pointer' }}>Tambah foto</label>}
          </div>
          <GaleriFoto foto={pratinjau} onHapus={hapus} ukuran={96} />
          <p className="t12 mut">Klik foto untuk melihatnya lebih besar. Klik tanda × untuk menghapus foto yang salah pilih.</p>
        </div>
      ) : (
        <label className="drop" htmlFor="bukti" style={{ cursor: 'pointer', marginBottom: 0, ...(kosong ? { borderColor: '#c2412d', background: '#fdf3f2' } : {}) }}>
          <svg className="ic" viewBox="0 0 24 24" style={{ width: 28, height: 28 }} aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
          <b style={{ color: 'var(--ink)' }}>Klik untuk memilih bukti transfer</b>
          <span className="t13">JPG atau PNG, maksimal 5 MB per foto, sampai {MAKS_FOTO} foto</span>
        </label>
      )}

      <div className="row"><Kirim teks={teksKirim} onKlik={tanya} proses={proses} /><Link className="btn lg" href="/pelanggan/pesanan">Nanti saja</Link></div>
      {buka && (
        <KonfirmasiDialog
          judul={`Kirim bukti ${jenis}?`}
          tombol="Ya, Kirim Bukti"
          onYa={kirim}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">Pastikan foto di bawah benar-benar bukti transfer {jenis}. Setelah dikirim, bukti menunggu verifikasi admin.</p>
          <div className="row g8">
            {pratinjau.map((f) => <img key={f.url} src={f.url} alt={f.nama} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />)}
          </div>
          <div className="t13 mut b">{berkas.length} foto akan dikirim</div>
        </KonfirmasiDialog>
      )}
    </form>
  );
}
