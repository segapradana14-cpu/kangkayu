import Link from 'next/link';
import Ikon from '@/components/Ikon';
import LonceNotif from '@/components/LonceNotif';

// Bilah atas: kolom cari, tombol notifikasi, dan tombol aksi sesuai peran.
export default function TopBar({ admin, cariAksi, placeholder, adaNotif }) {
  return (
    <header className="top">
      <form className="srch" action={cariAksi} role="search">
        <Ikon nama="search" />
        <input name="q" aria-label="Cari" placeholder={placeholder} />
      </form>
      <div className="row">
        {admin && <Link className="btn" href="/">Lihat Website</Link>}
        <LonceNotif admin={admin} awal={adaNotif} />
        {!admin && <Link className="btn pri" href="/pelanggan/buat-pesanan"><Ikon nama="plus" />Buat Pesanan Baru</Link>}
      </div>
    </header>
  );
}
