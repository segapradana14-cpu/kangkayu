'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Logo from '@/components/Logo';

export default function LoginForm({ baruDaftar }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (!res || res.error) {
      setError('Email atau password salah. Periksa kembali data yang kamu masukkan, lalu coba lagi.');
      return;
    }
    router.push('/arah');
    router.refresh();
  }

  return (
    <div className="auth" style={{ minHeight: '100vh' }}>
      <section className="l">
        <Logo />
        <div className="col g16">
          <h1 style={{ fontSize: 40, lineHeight: 1.15 }}>Pesan furniture custom tanpa ribet.</h1>
          <p style={{ color: '#cfe1db', fontSize: 17, maxWidth: 460 }}>
            Masuk untuk mengirim pesanan, menyetujui penawaran, dan memantau pengerjaan furnituremu.
          </p>
        </div>
        <span className="t13" style={{ color: '#9fbdb3' }}></span>
      </section>
      <section className="r">
        <form className="fm" onSubmit={onSubmit}>
          <Link className="back" href="/"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>Kembali ke beranda</Link>
          <div className="col g8">
            <h1>Masuk ke akun</h1>
            <p className="mut">Belum punya akun? <Link className="lnk" href="/daftar">Daftar di sini</Link></p>
          </div>
          {baruDaftar && (
            <div className="alert ok"><span><b>Pendaftaran berhasil.</b> Silakan masuk dengan akun barumu.</span></div>
          )}
          {error && (
            <div className="alert" role="alert" style={{ background: '#fde8e6', color: '#7a1f16', borderColor: '#f3bcb6' }}>
              <span><b>Login gagal.</b> {error}</span>
            </div>
          )}
          <div className="fld">
            <label htmlFor="em">Email</label>
            <input className="in" id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="pw">Password</label>
            <input className="in" id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn pri lg blk" type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button>
        </form>
      </section>
    </div>
  );
}
