'use client';

import { useRef, useState } from 'react';
import KonfirmasiDialog from '@/components/KonfirmasiDialog';

// Tombol aksi sederhana (tanpa isian) dengan pop up konfirmasi sebelum form dikirim.
export default function TombolKonfirmasi({ aksi, teks, kelas, judul, isi, tombolYa, bahaya }) {
  const [buka, setBuka] = useState(false);
  const formRef = useRef(null);
  return (
    <form action={aksi} ref={formRef}>
      <button className={kelas} type="button" onClick={() => setBuka(true)}>{teks}</button>
      {buka && (
        <KonfirmasiDialog
          judul={judul}
          tombol={tombolYa}
          bahaya={bahaya}
          onYa={() => { setBuka(false); formRef.current.requestSubmit(); }}
          onTutup={() => setBuka(false)}
        >
          <p className="mut t13">{isi}</p>
        </KonfirmasiDialog>
      )}
    </form>
  );
}
