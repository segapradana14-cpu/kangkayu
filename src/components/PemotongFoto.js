'use client';

import { useEffect, useRef, useState } from 'react';

// Bingkai potong 3:2 (sama dengan kartu katalog). Hasil akhir 900x600 JPEG.
const FW = 480, FH = 320, OW = 900, OH = 600;

export default function PemotongFoto({ file, onSelesai, onBatal }) {
  const [dim, setDim] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // URL dibuat di dalam effect (bukan useMemo) agar tetap valid saat React Strict Mode
  // menjalankan effect dua kali di mode development.
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setDim(null);
    setZoom(1);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const imgRef = useRef(null);
  const tarik = useRef(null);

  useEffect(() => {
    const tutup = (e) => { if (e.key === 'Escape') onBatal(); };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onBatal]);

  const base = dim ? Math.max(FW / dim.w, FH / dim.h) : 1;
  const skala = base * zoom;
  // Posisi foto dijaga agar bingkai selalu terisi penuh.
  const batas = (x, y, s = skala) => ({
    x: Math.min(0, Math.max(FW - dim.w * s, x)),
    y: Math.min(0, Math.max(FH - dim.h * s, y)),
  });

  function saatMuat(e) {
    const w = e.target.naturalWidth, h = e.target.naturalHeight;
    const s = Math.max(FW / w, FH / h);
    setDim({ w, h });
    setPos({ x: (FW - w * s) / 2, y: (FH - h * s) / 2 });
  }

  function ubahZoom(z) {
    const s1 = base * z;
    const cx = (FW / 2 - pos.x) / skala;
    const cy = (FH / 2 - pos.y) / skala;
    setZoom(z);
    setPos(batas(FW / 2 - cx * s1, FH / 2 - cy * s1, s1));
  }

  function mulaiTarik(e) {
    if (!dim) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    tarik.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  }
  function geser(e) {
    if (!tarik.current) return;
    setPos(batas(tarik.current.px + e.clientX - tarik.current.x, tarik.current.py + e.clientY - tarik.current.y));
  }
  function lepas() { tarik.current = null; }

  function gunakan() {
    const c = document.createElement('canvas');
    c.width = OW; c.height = OH;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, OW, OH);
    ctx.drawImage(imgRef.current, -pos.x / skala, -pos.y / skala, FW / skala, FH / skala, 0, 0, OW, OH);
    c.toBlob((b) => {
      if (b) onSelesai(new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="jdl-potong" style={{ position: 'fixed', inset: 0, background: 'rgba(22,32,30,.55)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 60 }}>
      <div className="card col g16" style={{ width: '100%', maxWidth: 540, boxShadow: '0 20px 50px rgba(0,0,0,.3)' }}>
        <h2 id="jdl-potong">Atur foto produk</h2>
        <p className="mut t13">Geser foto untuk memilih bagian yang tampil, dan atur perbesaran dengan penggeser. Bingkai ini sama dengan tampilan di katalog.</p>
        <div
          onPointerDown={mulaiTarik}
          onPointerMove={geser}
          onPointerUp={lepas}
          onPointerCancel={lepas}
          style={{ position: 'relative', width: FW, maxWidth: '100%', height: FH, overflow: 'hidden', borderRadius: 12, background: '#e6eeeb', cursor: dim ? 'grab' : 'default', touchAction: 'none', margin: '0 auto' }}
        >
          {!dim && <span className="t13 mut" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>Memuat foto…</span>}
          {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={url}
            alt="Foto yang dipotong"
            onLoad={saatMuat}
            draggable={false}
            style={{ position: 'absolute', left: pos.x, top: pos.y, width: dim ? dim.w * skala : 'auto', height: dim ? dim.h * skala : 'auto', maxWidth: 'none', userSelect: 'none', visibility: dim ? 'visible' : 'hidden' }}
          />
          )}
        </div>
        <div className="row g8" style={{ alignItems: 'center' }}>
          <span className="t13 mut">Perbesar</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => ubahZoom(Number(e.target.value))} style={{ flex: 1 }} aria-label="Perbesaran foto" />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn lg" type="button" onClick={onBatal}>Batal</button>
          <button className="btn pri lg" type="button" onClick={gunakan} disabled={!dim}>Gunakan Foto</button>
        </div>
      </div>
    </div>
  );
}
