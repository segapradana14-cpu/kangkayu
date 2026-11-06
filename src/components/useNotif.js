'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Mengambil jumlah notifikasi terbaru: saat pindah halaman, tiap 60 detik (hanya jika tab sedang dilihat), dan saat tab dibuka lagi.
export default function useNotif() {
  const [data, setData] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    let mati = false;
    async function muat() {
      if (document.visibilityState !== 'visible') return;
      try {
        const r = await fetch('/api/notif', { cache: 'no-store' });
        if (r.ok && !mati) setData(await r.json());
      } catch { /* abaikan, coba lagi nanti */ }
    }
    muat();
    const t = setInterval(muat, 60000);
    const lihat = () => { if (document.visibilityState === 'visible') muat(); };
    document.addEventListener('visibilitychange', lihat);
    return () => { mati = true; clearInterval(t); document.removeEventListener('visibilitychange', lihat); };
  }, [pathname]);

  return data;
}
