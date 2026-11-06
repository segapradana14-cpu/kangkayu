'use client';

import Link from 'next/link';
import Ikon from '@/components/Ikon';
import useNotif from '@/components/useNotif';

export default function LonceNotif({ admin, awal }) {
  const data = useNotif();
  const ada = data ? data.lonceng : awal;
  return (
    <Link className="ibtn" href={admin ? '/admin/notifikasi' : '/pelanggan/notifikasi'} aria-label="Notifikasi" title="Lihat notifikasi">
      <Ikon nama="bell" />
      {ada ? <span className="dot" /> : null}
    </Link>
  );
}
