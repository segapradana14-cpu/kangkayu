import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import FormPesanan from './FormPesanan';

export const dynamic = 'force-dynamic';

export default async function BuatPesanan({ searchParams }) {
  const daftarProduk = await prisma.product.findMany({ where: { aktif: true }, orderBy: { id: 'asc' } });
  const slug = searchParams?.produk;
  const produk = slug ? daftarProduk.find((x) => x.slug === slug) || null : null;

  return (
    <>
      <main className="page">
        <div className="crumb"><Link href="/pelanggan/dashboard">Dashboard</Link><span>/</span><b style={{ color: 'var(--ink)' }}>Buat Pesanan</b></div>
        <div className="col g8">
          <h1>Buat Pesanan Custom</h1>
          <p className="mut">Isi spesifikasi furniture yang kamu inginkan. Harga ditentukan admin setelah pesanan ditinjau.</p>
        </div>
        <ol className="stepper" aria-label="Tahapan pesanan">
          <li className="st on"><i>1</i>Isi form</li>
          <li className="st"><i>2</i>Tinjauan admin</li>
          <li className="st"><i>3</i>Penawaran dan DP</li>
          <li className="st"><i>4</i>Produksi</li>
        </ol>
        <FormPesanan key={produk ? produk.id : 'bebas'} produk={produk} daftarProduk={daftarProduk} />
      </main>
    </>
  );
}
