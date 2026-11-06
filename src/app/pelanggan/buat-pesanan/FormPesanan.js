'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { kirimPesanan } from './actions';
import GaleriFoto from '@/components/GaleriFoto';
import { BAHAN, FINISHING, WARNA, JENIS_LAIN, MAKS_FOTO, MAKS_BYTES } from '@/lib/opsi';
import { rupiah } from '@/lib/session';
import { unggahFoto } from '@/lib/unggah';

function Kirim({ onKlik, proses }) {
  const { pending } = useFormStatus();
  const sibuk = pending || proses;
  return (
    <button className="btn pri lg" type="button" disabled={sibuk} onClick={onKlik}>
      {proses ? 'Mengunggah foto...' : pending ? 'Mengirim...' : 'Ya, Kirim Pesanan'}
    </button>
  );
}

export default function FormPesanan({ produk, daftarProduk }) {
  const [state, formAction] = useFormState(kirimPesanan, null);
  const [jenis, setJenis] = useState(produk ? produk.nama : daftarProduk[0]?.nama || JENIS_LAIN);
  const [acuanId, setAcuanId] = useState('');
  const [p, setP] = useState('');
  const [l, setL] = useState('');
  const [t, setT] = useState('');
  const [bahan, setBahan] = useState(BAHAN[0]);
  const [finishing, setFinishing] = useState(FINISHING[0]);
  const [warna, setWarna] = useState(WARNA[0].nama);
  const [berkas, setBerkas] = useState([]);
  const [galatFoto, setGalatFoto] = useState('');
  const inputFotoRef = useRef(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [proses, setProses] = useState(false);
  const urlRef = useRef(null);
  const formRef = useRef(null);
  const galatRef = useRef(null);

  // Jika server menolak, tutup dialog dan tampilkan pesan error.
  useEffect(() => {
    if (state?.error) {
      setKonfirmasi(false);
      galatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [state]);

  function bukaKonfirmasi() {
    // Pakai validasi bawaan browser dulu (kolom wajib, rentang ukuran).
    if (formRef.current.reportValidity()) setKonfirmasi(true);
  }

  // Foto diunggah langsung dari browser; ke server hanya dikirim alamatnya.
  async function kirim() {
    setProses(true);
    try {
      const urls = await Promise.all(berkas.map((f) => unggahFoto(f, 'referensi')));
      urlRef.current.value = urls.join(',');
      formRef.current.requestSubmit();
    } catch (e) {
      setKonfirmasi(false);
      setGalatFoto(e.message || 'Gagal mengunggah foto. Coba lagi.');
    } finally {
      setProses(false);
    }
  }

  const jumlahFoto = berkas.length;
  // Alamat sementara untuk pratinjau; dilepas saat daftar berubah.
  const pratinjau = useMemo(() => berkas.map((f) => ({ url: URL.createObjectURL(f), nama: f.name })), [berkas]);
  useEffect(() => () => pratinjau.forEach((x) => URL.revokeObjectURL(x.url)), [pratinjau]);

  // Samakan isi input file dengan daftar berkas yang dipilih.
  function sinkronFoto(daftar) {
    const dt = new DataTransfer();
    daftar.forEach((f) => dt.items.add(f));
    if (inputFotoRef.current) inputFotoRef.current.files = dt.files;
    setBerkas(daftar);
  }

  function pilihFoto(e) {
    const baru = Array.from(e.target.files);
    let pesan = '';
    const layak = baru.filter((f) => {
      if (!['image/jpeg', 'image/png'].includes(f.type)) { pesan = `File "${f.name}" bukan JPG atau PNG.`; return false; }
      if (f.size > MAKS_BYTES) { pesan = `File "${f.name}" lebih dari 5 MB.`; return false; }
      return true;
    });
    const gabung = [...berkas];
    for (const f of layak) if (!gabung.some((g) => g.name === f.name && g.size === f.size)) gabung.push(f);
    if (gabung.length > MAKS_FOTO) pesan = `Maksimal ${MAKS_FOTO} foto per pesanan.`;
    setGalatFoto(pesan);
    sinkronFoto(gabung.slice(0, MAKS_FOTO));
  }

  function hapusFoto(i) {
    setGalatFoto('');
    sinkronFoto(berkas.filter((_, x) => x !== i));
  }

  const acuan = produk ? produk.nama : daftarProduk.find((x) => String(x.id) === acuanId)?.nama;
  const ukuran = p && l && t ? `${p} x ${l} x ${t} cm` : '-';

  return (
    <form action={formAction} ref={formRef}>
      <input type="hidden" name="produkId" value={produk ? produk.id : acuanId} />
      <div className="cols">
        <div className="a col g16">
          {state?.error && (
            <div className="alert" role="alert" ref={galatRef} style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}>
              <span><b>Pesanan belum terkirim.</b> {state.error}</span>
            </div>
          )}

          {produk && (
            <section className="card col g16" style={{ borderColor: 'var(--pri)', boxShadow: '0 0 0 3px rgba(31,107,87,.10)' }}>
              <div className="row sp"><h2>Produk yang kamu pilih dari katalog</h2><span className="chip c-ok">Dari katalog</span></div>
              <div className="row g16" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                <div className="photo" style={{ width: 120, height: 96, flex: 'none' }}>
                  <svg className="ic" viewBox="0 0 64 64" style={{ width: 44, height: 44, strokeWidth: 3 }} aria-hidden="true">
                    <rect x="12" y="8" width="40" height="44" rx="2" /><path d="M32 8v44M27 30v4M37 30v4" />
                  </svg>
                </div>
                <div className="col g8" style={{ minWidth: 0 }}>
                  <div><span className="t12 mut b">{produk.kategori.toUpperCase()}</span><h3 style={{ margin: '2px 0 0' }}>{produk.nama}</h3></div>
                  <p className="mut t13">{produk.deskripsi}</p>
                  <div className="b">Harga mulai {rupiah(produk.hargaMulai)} <span className="t12 mut">(harga pasti ditentukan lewat penawaran admin)</span></div>
                </div>
              </div>
              <div className="row">
                <Link className="btn s" href="/pelanggan/katalog">Ganti produk</Link>
                <Link className="btn s" href="/pelanggan/buat-pesanan">Hapus pilihan</Link>
              </div>
            </section>
          )}

          <section className="card col g16">
            <h2>1. Jenis furniture</h2>
            <div className="f2">
              {produk ? (
                <>
                  <div className="fld"><label htmlFor="jn">Jenis</label><input className="in" id="jn" name="jenis" value={jenis} onChange={(e) => setJenis(e.target.value)} required /></div>
                  <div className="fld"><label htmlFor="rf">Mengacu ke produk katalog</label><input className="in" id="rf" value={produk.nama} readOnly /></div>
                </>
              ) : (
                <>
                  <div className="fld">
                    <label htmlFor="jn">Jenis</label>
                    <select className="in" id="jn" name="jenis" value={jenis} onChange={(e) => setJenis(e.target.value)}>
                      {daftarProduk.map((x) => <option key={x.id}>{x.nama}</option>)}
                      <option>{JENIS_LAIN}</option>
                    </select>
                  </div>
                  <div className="fld">
                    <label htmlFor="rf">Mengacu ke produk katalog (opsional)</label>
                    <select className="in" id="rf" value={acuanId} onChange={(e) => setAcuanId(e.target.value)}>
                      <option value="">Tanpa acuan</option>
                      {daftarProduk.map((x) => <option key={x.id} value={x.id}>{x.nama} (mulai {rupiah(x.hargaMulai)})</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="card col g16">
            <h2>2. Ukuran</h2>
            <div className="f3">
              <div className="fld"><label htmlFor="pj">Panjang</label><div className="unit"><input className="in" id="pj" name="panjang" type="number" min="10" max="1000" required value={p} onChange={(e) => setP(e.target.value)} placeholder="200" /><span>cm</span></div></div>
              <div className="fld"><label htmlFor="lb">Lebar</label><div className="unit"><input className="in" id="lb" name="lebar" type="number" min="10" max="1000" required value={l} onChange={(e) => setL(e.target.value)} placeholder="60" /><span>cm</span></div></div>
              <div className="fld"><label htmlFor="tg">Tinggi</label><div className="unit"><input className="in" id="tg" name="tinggi" type="number" min="10" max="1000" required value={t} onChange={(e) => setT(e.target.value)} placeholder="220" /><span>cm</span></div></div>
            </div>
            <p className="hint" style={{ margin: 0 }}>Ukur ruangan sebelum mengisi. Admin dapat menghubungimu jika ukuran perlu disesuaikan.</p>
          </section>

          <section className="card col g16">
            <h2>3. Bahan dan finishing</h2>
            <div className="f2">
              <div className="fld"><label htmlFor="bh">Bahan utama</label><select className="in" id="bh" name="bahan" value={bahan} onChange={(e) => setBahan(e.target.value)}>{BAHAN.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div className="fld"><label htmlFor="fn">Jenis finishing</label><select className="in" id="fn" name="finishing" value={finishing} onChange={(e) => setFinishing(e.target.value)}>{FINISHING.map((b) => <option key={b}>{b}</option>)}</select></div>
            </div>
            <div className="fld">
              <label id="wl">Warna</label>
              <div className="swatches" role="radiogroup" aria-labelledby="wl">
                {WARNA.map((w) => (
                  <label key={w.nama} className={`sw${warna === w.nama ? ' on' : ''}`} style={{ marginBottom: 0, cursor: 'pointer' }}>
                    <input type="radio" name="warna" value={w.nama} checked={warna === w.nama} onChange={() => setWarna(w.nama)} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                    <i style={{ background: w.hex }} />{w.nama}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="card col g16">
            <h2>4. Catatan dan foto referensi</h2>
            <div className="fld"><label htmlFor="ct">Catatan tambahan</label><textarea className="in" id="ct" name="catatan" placeholder="Contoh: 3 pintu, 1 laci, cermin di pintu tengah" /></div>
            {galatFoto && <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{galatFoto}</span></div>}
            <input type="hidden" name="urlFoto" ref={urlRef} />
            <input ref={inputFotoRef} id="foto" type="file" accept="image/jpeg,image/png" multiple style={{ display: 'none' }} onChange={pilihFoto} />
            {berkas.length > 0 ? (
              <div className="col g16" style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16 }}>
                <div className="row sp">
                  <div className="t13 mut b">{berkas.length} foto referensi dipilih</div>
                  {berkas.length < MAKS_FOTO && <label className="btn s" htmlFor="foto" style={{ marginBottom: 0, cursor: 'pointer' }}>Tambah foto</label>}
                </div>
                <GaleriFoto foto={pratinjau} onHapus={hapusFoto} ukuran={96} />
                <p className="t12 mut">Klik foto untuk melihatnya lebih besar. Klik tanda × untuk menghapus foto yang salah pilih.</p>
              </div>
            ) : (
              <label className="drop" htmlFor="foto" style={{ cursor: 'pointer', marginBottom: 0 }}>
                <svg className="ic" viewBox="0 0 24 24" style={{ width: 28, height: 28 }} aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
                <b style={{ color: 'var(--ink)' }}>Klik untuk memilih foto referensi (opsional)</b>
                <span className="t13">JPG atau PNG, maksimal 5 MB per foto, sampai {MAKS_FOTO} foto</span>
              </label>
            )}
          </section>
        </div>

        <aside className="b2">
          <section className="card col g16">
            <h2>Ringkasan pesanan</h2>
            <div>
              <div className="kv"><span className="k" style={{ width: 110 }}>Jenis</span><span className="v">{jenis || '-'}</span></div>
              {acuan && <div className="kv"><span className="k" style={{ width: 110 }}>Acuan katalog</span><span className="v">{acuan}</span></div>}
              <div className="kv"><span className="k" style={{ width: 110 }}>Ukuran</span><span className="v">{ukuran}</span></div>
              <div className="kv"><span className="k" style={{ width: 110 }}>Bahan</span><span className="v">{bahan}</span></div>
              <div className="kv"><span className="k" style={{ width: 110 }}>Finishing</span><span className="v">{finishing}, {warna}</span></div>
              <div className="kv"><span className="k" style={{ width: 110 }}>Foto</span><span className="v">{jumlahFoto} file</span></div>
            </div>
            <div className="alert info"><span>Setelah dikirim, admin meninjau pesanan lalu mengirim penawaran berisi harga, estimasi, dan nominal DP.</span></div>
            <button className="btn pri lg blk" type="button" onClick={bukaKonfirmasi}>Kirim Pesanan</button>
            <Link className="btn blk" href="/pelanggan/dashboard">Batal</Link>
          </section>
        </aside>
      </div>

      {konfirmasi && (
        <div role="dialog" aria-modal="true" aria-labelledby="jdl-konfirmasi" style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,30,.55)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
          <div className="card col g16" style={{ width: '100%', maxWidth: 460, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
            <h2 id="jdl-konfirmasi">Kirim pesanan ini?</h2>
            <p className="mut t13">Pastikan data di bawah sudah benar. Setelah dikirim, admin akan meninjau pesananmu dan mengirim penawaran.</p>
            <div>
              <div className="kv"><span className="k" style={{ width: 100 }}>Jenis</span><span className="v">{jenis}</span></div>
              <div className="kv"><span className="k" style={{ width: 100 }}>Ukuran</span><span className="v">{ukuran}</span></div>
              <div className="kv"><span className="k" style={{ width: 100 }}>Bahan</span><span className="v">{bahan}</span></div>
              <div className="kv"><span className="k" style={{ width: 100 }}>Finishing</span><span className="v">{finishing}, {warna}</span></div>
              <div className="kv"><span className="k" style={{ width: 100 }}>Foto</span><span className="v">{jumlahFoto} file</span></div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn lg" type="button" onClick={() => setKonfirmasi(false)}>Periksa lagi</button>
              <Kirim onKlik={kirim} proses={proses} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
