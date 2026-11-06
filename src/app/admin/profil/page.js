import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { tanggal } from '@/lib/status';
import { FormDataDiri, FormPassword } from '@/app/pelanggan/profil/FormProfil';
import TombolKeluar from '@/app/pelanggan/profil/TombolKeluar';
import { simpanProfilAdmin, gantiPasswordAdmin } from './actions';

export const dynamic = 'force-dynamic';

export default async function ProfilAdmin() {
  const session = await requireRole('ADMIN');
  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });

  return (
    <main className="page">
      <div className="col g8"><h1>Profil Saya</h1><p className="mut">Kelola data akun admin dan ganti password.</p></div>
      <div className="cols">
        <div className="a col g16">
          <FormDataDiri admin aksiSimpan={simpanProfilAdmin} user={{ nama: user.nama, email: user.email, noHp: user.noHp }} />
          <FormPassword aksiGanti={gantiPasswordAdmin} />
        </div>
        <aside className="b2">
          <section className="card col g16">
            <h2>Ringkasan akun</h2>
            <div>
              <div className="kv"><span className="k">Peran</span><span className="v">Admin</span></div>
              <div className="kv"><span className="k">Dibuat</span><span className="v">{tanggal(user.createdAt)}</span></div>
            </div>
            <Link className="btn blk" href="/admin/dashboard">Kembali ke Dashboard</Link>
            <TombolKeluar />
          </section>
        </aside>
      </div>
    </main>
  );
}
