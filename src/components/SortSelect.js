'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Dropdown urutan: mengubah parameter ?urut= di alamat halaman.
export default function SortSelect({ opsi, nilai, nama = 'urut', lebar = 190 }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function ubah(e) {
    const p = new URLSearchParams(params.toString());
    p.set(nama, e.target.value);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <select className="in" style={{ width: lebar }} aria-label="Urutkan" value={nilai} onChange={ubah}>
      {opsi.map((o) => <option key={o.nilai} value={o.nilai}>{o.teks}</option>)}
    </select>
  );
}
