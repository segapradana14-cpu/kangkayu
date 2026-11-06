'use client';

export default function TombolHapus({ nama }) {
  return (
    <button className="btn s dng" type="submit" onClick={(e) => { if (!window.confirm(`Hapus produk "${nama}"?`)) e.preventDefault(); }}>Hapus</button>
  );
}
