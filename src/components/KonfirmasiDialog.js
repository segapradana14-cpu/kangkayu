'use client';

import { useEffect } from 'react';

// Pop up konfirmasi sederhana. Esc atau klik di luar kotak menutupnya.
export default function KonfirmasiDialog({ judul, children, tombol, bahaya, onYa, onTutup }) {
  useEffect(() => {
    const tutup = (e) => { if (e.key === 'Escape') onTutup(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onTutup]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="jdl-konfirmasi-dlg" onClick={(e) => { if (e.target === e.currentTarget) onTutup(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,30,.55)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
      <div className="card col g16" style={{ width: '100%', maxWidth: 460, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
        <h2 id="jdl-konfirmasi-dlg">{judul}</h2>
        {children}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn lg" type="button" onClick={onTutup}>Periksa lagi</button>
          <button className={`btn lg ${bahaya ? 'dng' : 'pri'}`} type="button" onClick={onYa}>{tombol}</button>
        </div>
      </div>
    </div>
  );
}
