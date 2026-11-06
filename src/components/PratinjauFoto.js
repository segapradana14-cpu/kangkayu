'use client';

import { useEffect, useState } from 'react';

// Foto produk yang bisa diklik untuk dilihat besar (pratinjau). Mengisi kotak .ph milik kartu.
export default function PratinjauFoto({ url, nama }) {
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    if (!buka) return undefined;
    const tutup = (e) => { if (e.key === 'Escape') setBuka(false); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [buka]);

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        aria-label={`Lihat foto ${nama} lebih besar`}
        title="Klik untuk memperbesar"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 0, background: 'none', cursor: 'zoom-in' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={nama} />
        <span style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(22,32,30,.7)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>Lihat foto</span>
      </button>

      {buka && (
        <div role="dialog" aria-modal="true" aria-label={`Foto ${nama}`} onClick={() => setBuka(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,16,14,.85)', display: 'grid', placeItems: 'center', padding: 24, zIndex: 60, cursor: 'default' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={nama} style={{ position: 'static', width: 'auto', height: 'auto', maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 10, background: '#fff', display: 'block' }} />
            <div className="row sp" style={{ marginTop: 10, color: '#fff' }}>
              <span className="t13">{nama}</span>
              <button type="button" className="btn s" onClick={() => setBuka(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
