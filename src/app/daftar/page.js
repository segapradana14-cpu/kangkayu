'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import Logo from '@/components/Logo';
import { daftarAkun } from './actions';

function Tombol() {
  const { pending } = useFormStatus();
  return (
    <button className="btn pri lg blk" type="submit" disabled={pending}>
      {pending ? 'Memproses...' : 'Daftar'}
    </button>
  );
}

export default function DaftarPage() {
  const [state, formAction] = useFormState(daftarAkun, null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header className="row sp" style={{ padding: '20px 64px' }}>
        <Logo />
        <span>Sudah punya akun? <Link className="lnk" href="/login">Masuk</Link></span>
      </header>
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px 24px 56px' }}>
        <form className="card" action={formAction} style={{ width: '100%', maxWidth: 720, padding: 36, display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'flex-start', textAlign: 'left' }}>
          <div className="col g8">
            <h1>Buat akun pelanggan</h1>
            <p className="mut">Akun dipakai untuk membuat pesanan dan memantau status pengerjaan.</p>
          </div>
          {state?.error && (
            <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}>
              <span><b>Pendaftaran belum berhasil.</b> {state.error}</span>
            </div>
          )}
          <div className="f2">
            <div className="fld"><label htmlFor="nm">Nama lengkap</label><input className="in" id="nm" name="nama" placeholder="Contoh: Sega" required /></div>
            <div className="fld"><label htmlFor="hp">No. HP / WhatsApp</label><input className="in" id="hp" name="noHp" placeholder="08xx-xxxx-xxxx" required /><span className="hint">Dipakai admin untuk menghubungi kamu terkait pesanan.</span></div>
          </div>
          <div className="fld"><label htmlFor="em">Email</label><input className="in" id="em" name="email" type="email" placeholder="nama@email.com" required /><span className="hint">Email harus belum pernah terdaftar.</span></div>
          <div className="fld"><label htmlFor="al">Alamat pengiriman</label><textarea className="in" id="al" name="alamat" placeholder="Jalan, nomor rumah, RT/RW, desa, kecamatan, kabupaten" required /></div>
          <div className="f2">
            <div className="fld"><label htmlFor="p1">Password</label><input className="in" id="p1" name="password" type="password" placeholder="Minimal 8 karakter" required /></div>
            <div className="fld"><label htmlFor="p2">Konfirmasi password</label><input className="in" id="p2" name="ulangi" type="password" placeholder="Ulangi password" required /></div>
          </div>
          <label className="chk" htmlFor="setuju"><input id="setuju" type="checkbox" required />Saya menyetujui syarat dan ketentuan pemesanan.</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <div style={{ flex: 1 }}><Tombol /></div>
            <Link className="btn lg" href="/">Batal</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
