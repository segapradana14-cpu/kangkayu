'use client';

import { useRef, useState } from 'react';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';

// Tombol "Tandai selesai" dengan pop up konfirmasi, supaya tidak terpencet tanpa sengaja.
export default function TombolSelesai({ aksi, kode, nama }) {
  const [buka, setBuka] = useState(false);
  const formRef = useRef(null);
  return (
    <form action={aksi} ref={formRef}>
      <button className="btn s pri" type="button" onClick={() => setBuka(true)}>Tandai selesai</button>
      {buka && (
        <KonfirmasiDialog
          judul="Tandai pesanan selesai?"
          tombol="Ya, Tandai Selesai"
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">Pesanan {kode} atas nama {nama} ditutup sebagai Selesai. Lakukan ini setelah barang diserahkan kepada pelanggan.</p>
        </KonfirmasiDialog>
      )}
    </form>
  );
}
