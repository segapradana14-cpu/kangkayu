'use client';


export default function TombolCetak() {
  return (
    <button className="btn" type="button" onClick={() => window.print()}>
      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /></svg>
      Cetak PDF
    </button>
  );
}
