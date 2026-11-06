'use client';

import { useEffect, useState } from 'react';

// Deretan foto kecil. Jika diklik, foto tampil besar (bisa digeser dan ditutup).
// onHapus(index) opsional: menampilkan tombol hapus di tiap foto kecil.
export default function GaleriFoto({ foto, onHapus, ukuran = 96 }) {
  const [buka, setBuka] = useState(null);

  useEffect(() => {
    if (buka === null) return undefined;
    function tombol(e) {
      if (e.key === 'Escape') setBuka(null);
      if (e.key === 'ArrowRight') setBuka((i) => (i + 1) % foto.length);
      if (e.key === 'ArrowLeft') setBuka((i) => (i - 1 + foto.length) % foto.length);
    }
    window.addEventListener('keydown', tombol);
    return () => window.removeEventListener('keydown', tombol);
  }, [buka, foto.length]);

  // Jika foto yang sedang dibuka dihapus, tutup tampilan besar.
  useEffect(() => {
    if (buka !== null && buka >= foto.length) setBuka(null);
  }, [foto.length, buka]);

  const nav = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,.9)', fontSize: 24, cursor: 'pointer' };

  return (
    <>
      <div className="row g8">
        {foto.map((f, i) => (
          <div key={f.url} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setBuka(i)} aria-label={`Lihat foto ${i + 1} lebih besar`} style={{ border: '1px solid var(--line)', padding: 0, borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in', background: '#eef1f0', display: 'block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.nama || `Foto ${i + 1}`} style={{ width: ukuran, height: ukuran, objectFit: 'cover', display: 'block' }} />
            </button>
            {onHapus && (
              <button type="button" onClick={() => onHapus(i)} aria-label={`Hapus foto ${i + 1}`} title="Hapus foto" style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff', background: '#c2412d', color: '#fff', fontWeight: 800, lineHeight: 1, cursor: 'pointer', fontSize: 14 }}>×</button>
            )}
          </div>
        ))}
      </div>

      {buka !== null && foto[buka] && (
        <div role="dialog" aria-modal="true" aria-label="Foto ukuran besar" onClick={() => setBuka(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,16,14,.85)', display: 'grid', placeItems: 'center', padding: 24, zIndex: 60 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '92vw', maxHeight: '88vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto[buka].url} alt={foto[buka].nama || `Foto ${buka + 1}`} style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 10, background: '#fff', display: 'block' }} />
            <div className="row sp" style={{ marginTop: 10, color: '#fff' }}>
              <span className="t13">{foto[buka].nama ? `${foto[buka].nama} · ` : ''}Foto {buka + 1} dari {foto.length}</span>
              <button type="button" className="btn s" onClick={() => setBuka(null)}>Tutup</button>
            </div>
            {foto.length > 1 && (
              <>
                <button type="button" aria-label="Foto sebelumnya" style={{ ...nav, left: 8 }} onClick={() => setBuka((buka - 1 + foto.length) % foto.length)}>&lsaquo;</button>
                <button type="button" aria-label="Foto berikutnya" style={{ ...nav, right: 8 }} onClick={() => setBuka((buka + 1) % foto.length)}>&rsaquo;</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
