'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { simpanProfil, gantiPassword } from './actions';

// Tombol di dalam form: klik membuka pop up konfirmasi dulu, belum langsung mengirim.
function Tombol({ teks, onKlik }) {
  const { pending } = useFormStatus();
  return <button className="btn pri" type="button" disabled={pending} onClick={onKlik}>{pending ? 'Menyimpan...' : teks}</button>;
}

function Konfirmasi({ judul, isi, tombol, onYa, onTutup }) {
  useEffect(() => {
    const tutup = (e) => { if (e.key === 'Escape') onTutup(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onTutup]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="jdl-profil" onClick={(e) => { if (e.target === e.currentTarget) onTutup(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,30,.55)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
      <div className="card col g16" style={{ width: '100%', maxWidth: 440, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
        <h2 id="jdl-profil">{judul}</h2>
        <p className="mut t13">{isi}</p>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn lg" type="button" onClick={onTutup}>Periksa lagi</button>
          <button className="btn pri lg" type="button" onClick={onYa}>{tombol}</button>
        </div>
      </div>
    </div>
  );
}

// Validasi bawaan browser dulu, lalu tampilkan pop up; "Ya" mengirim form.
function useKonfirmasi() {
  const formRef = useRef(null);
  const [buka, setBuka] = useState(false);
  const tanya = () => { if (formRef.current.reportValidity()) setBuka(true); };
  const ya = () => { setBuka(false); formRef.current.requestSubmit(); };
  return { formRef, buka, tanya, ya, tutup: () => setBuka(false) };
}

function Pesan({ state }) {
  if (state?.error) return <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}><span>{state.error}</span></div>;
  if (state?.ok) return <div className="alert ok"><span>{state.ok}</span></div>;
  return null;
}

// aksiSimpan dan admin bisa diganti: halaman profil admin memakai form yang sama tanpa kolom alamat.
export function FormDataDiri({ user, aksiSimpan = simpanProfil, admin = false }) {
  const [state, aksi] = useFormState(aksiSimpan, null);
  const k = useKonfirmasi();
  return (
    <form action={aksi} ref={k.formRef} className="card col g16">
      <div className="row sp"><h2>Data diri</h2><span className="chip c-ok">Akun aktif</span></div>
      <Pesan state={state} />
      <div className="fld"><label htmlFor="nm">Nama lengkap</label><input className="in" id="nm" name="nama" defaultValue={user.nama} required /></div>
      <div className="f2">
        <div className="fld"><label htmlFor="em">Email</label><input className="in" id="em" name="email" type="email" defaultValue={user.email} required /></div>
        <div className="fld"><label htmlFor="hp">No. HP</label><input className="in" id="hp" name="noHp" defaultValue={user.noHp || ''} required={!admin} /></div>
      </div>
      {!admin && <div className="fld"><label htmlFor="al">Alamat pengantaran</label><textarea className="in" id="al" name="alamat" defaultValue={user.alamat || ''} required /></div>}
      <div className="row"><Tombol teks="Simpan Perubahan" onKlik={k.tanya} /><Link className="btn" href="/pelanggan/dashboard">Batal</Link></div>
      {k.buka && <Konfirmasi judul="Simpan perubahan data diri?" isi={admin ? 'Nama, email, dan nomor HP yang baru akan tersimpan di akun admin. Email dipakai untuk masuk.' : 'Data diri, email, nomor HP, dan alamat yang baru akan dipakai admin untuk menghubungi dan mengantar pesananmu.'} tombol="Ya, Simpan" onYa={k.ya} onTutup={k.tutup} />}
    </form>
  );
}

export function FormPassword({ aksiGanti = gantiPassword }) {
  const [state, aksi] = useFormState(aksiGanti, null);
  const k = useKonfirmasi();
  return (
    <form action={aksi} ref={k.formRef} className="card col g16" key={state?.ok ? 'sukses' : 'isi'}>
      <h2>Ganti password</h2>
      <Pesan state={state} />
      <div className="fld"><label htmlFor="pl">Password lama</label><input className="in" id="pl" name="lama" type="password" required /></div>
      <div className="f2">
        <div className="fld"><label htmlFor="pb">Password baru</label><input className="in" id="pb" name="baru" type="password" placeholder="Minimal 8 karakter" required /></div>
        <div className="fld"><label htmlFor="pk">Ulangi password baru</label><input className="in" id="pk" name="ulangi" type="password" required /></div>
      </div>
      <div className="row"><Tombol teks="Ubah Password" onKlik={k.tanya} /></div>
      {k.buka && <Konfirmasi judul="Ubah password?" isi="Mulai sekarang kamu masuk memakai password yang baru. Pastikan kamu mengingatnya." tombol="Ya, Ubah Password" onYa={k.ya} onTutup={k.tutup} />}
    </form>
  );
}
