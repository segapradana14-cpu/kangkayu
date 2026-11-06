'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LABEL = {
  tindakan: { teks: 'Perlu tindakan', chip: 'c-wait' },
  ok: { teks: 'Berhasil', chip: 'c-ok' },
  bad: { teks: 'Ditolak', chip: 'c-bad' },
  info: { teks: 'Info', chip: 'c-gray' },
};

// "Baru" = lebih baru dari kunjungan terakhir ke halaman ini (disimpan di browser ini saja).
export default function DaftarNotif({ items, kunci }) {
  const [batas, setBatas] = useState(null);

  useEffect(() => {
    const k = `kk-notif-${kunci}`;
    try {
      const lama = localStorage.getItem(k);
      setBatas(lama ? Number(lama) : null);
      localStorage.setItem(k, String(Date.now()));
    } catch {
      setBatas(null);
    }
  }, [kunci]);

  if (items.length === 0) {
    return <div style={{ padding: 28 }}><div className="empty" style={{ marginTop: 0 }}>Belum ada notifikasi.</div></div>;
  }

  return (
    <div>
      {items.map((n) => {
        const baru = batas !== null && new Date(n.waktu).getTime() > batas;
        const lb = LABEL[n.tipe] || LABEL.info;
        return (
          <Link key={n.id} href={n.href} className="row sp" style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', alignItems: 'flex-start', background: baru ? 'var(--pril)' : 'transparent', textDecoration: 'none', color: 'inherit' }}>
            <div className="col g8" style={{ minWidth: 0 }}>
              <div className="row g8">
                <b>{n.judul}</b>
                {baru && <span className="chip c-ok">Baru</span>}
              </div>
              <div className="t13 mut">{n.isi}</div>
              <time className="t12 mut" suppressHydrationWarning dateTime={n.waktu}>
                {new Date(n.waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
            <span className={`chip ${lb.chip}`} style={{ flex: 'none' }}>{lb.teks}</span>
          </Link>
        );
      })}
    </div>
  );
}
