// Halaman sementara untuk menu yang akan dibuat pada tahap berikutnya.
export default function Segera({ params }) {
  return (
    <>
      <main className="page">
        <div className="col g8">
          <h1 style={{ textTransform: 'capitalize' }}>{params.halaman.replace(/-/g, ' ')}</h1>
          <p className="mut">Halaman ini akan dibuat pada tahap pengembangan berikutnya.</p>
        </div>
      </main>
    </>
  );
}
