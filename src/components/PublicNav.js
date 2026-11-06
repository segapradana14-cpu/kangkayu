import Link from 'next/link';
import Logo from '@/components/Logo';

export default function PublicNav({ aktif }) {
  return (
    <header className="pnav">
      <Logo />
      <nav aria-label="Menu utama">
        <Link className={aktif === 'beranda' ? 'on' : ''} href="/">Beranda</Link>
        <Link className={aktif === 'katalog' ? 'on' : ''} href="/katalog">Katalog</Link>
        <Link href="/#cara">Cara Pesan</Link>
        <Link href="/#kontak">Kontak</Link>
      </nav>
      <div className="row">
        <Link className="btn" href="/login">Masuk</Link>
        <Link className="btn pri" href="/daftar">Daftar</Link>
      </div>
    </header>
  );
}
