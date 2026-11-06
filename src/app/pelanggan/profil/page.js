import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { tanggal } from '@/lib/status';
import { FormDataDiri, FormPassword } from './FormProfil';
import TombolKeluar from './TombolKeluar';

export const dynamic = 'force-dynamic';

export default async function Profil() {
  const session = await requireRole('PELANGGAN');
  const id = Number(session.user.id);
  const [user, jumlah] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.order.count({ where: { userId: id } }),
  ]);

  return (
    <main className="page">
      <div className="col g8"><h1>Profil Saya</h1><p className="mut">Data kontak dan alamat dipakai admin untuk menghubungi dan mengantar pesananmu.</p></div>
      <div className="cols">
        <div className="a col g16">
          <FormDataDiri user={{ nama: user.nama, email: user.email, noHp: user.noHp, alamat: user.alamat }} />
          <FormPassword />
        </div>
        <aside className="b2">
          <section className="card col g16">
            <h2>Ringkasan akun</h2>
            <div>
              <div className="kv"><span className="k">Peran</span><span className="v">Pelanggan</span></div>
              <div className="kv"><span className="k">Bergabung</span><span className="v">{tanggal(user.createdAt)}</span></div>
              <div className="kv"><span className="k">Total pesanan</span><span className="v">{jumlah} pesanan</span></div>
            </div>
            <Link className="btn blk" href="/pelanggan/pesanan">Lihat Pesanan Saya</Link>
            <TombolKeluar />
          </section>
        </aside>
      </div>
    </main>
  );
}
