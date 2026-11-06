import { STATUS, tanggal } from '@/lib/status';

// logs: urut terbaru dulu.
export default function RiwayatStatus({ logs }) {
  return (
    <section className="card col g16">
      <h2>Riwayat status</h2>
      <div className="tl">
        {logs.map((lg, i) => (
          <div key={lg.id} className={`ti ${i === 0 && lg.status !== 'SELESAI' ? 'now' : 'done'}${i === logs.length - 1 ? ' last' : ''}`}>
            <span className="pt" />
            <div>
              <div className="tt">{STATUS[lg.status].label}</div>
              <div className="dd">{tanggal(lg.createdAt)}{lg.keterangan ? `. ${lg.keterangan}` : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
