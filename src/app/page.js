import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import Logo from '@/components/Logo';
import FotoProduk from '@/components/FotoProduk';
import { prisma } from '@/lib/prisma';
import { rupiah } from '@/lib/session';

export const dynamic = 'force-dynamic';

const centang = <svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>;

export default async function Beranda() {
  const populer = await prisma.product.findMany({ where: { aktif: true }, orderBy: { id: 'asc' }, take: 4 });

  return (
    <>
      <PublicNav aktif="beranda" />

      <section className="hero">
        <div className="wrap">
          <div className="copy">
            <span className="pill">Pemesanan custom furniture</span>
            <h1>Furniture yang pas dengan ruanganmu, dibuat sesuai pesananmu.</h1>
            <p className="lead">
              Tentukan ukuran, bahan, dan warna sendiri. Terima penawaran dari workshop, bayar DP, lalu pantau
              pengerjaannya langsung dari website.
            </p>
            <div className="row" style={{ marginTop: 30 }}>
              <Link className="btn acc lg" href="/daftar">Buat Pesanan Custom</Link>
              <Link className="btn ol lg" href="/katalog">Lihat Katalog</Link>
            </div>
            <ul className="ticks">
              <li>{centang}Ukuran bebas</li>
              <li>{centang}Harga jelas di muka</li>
              <li>{centang}Status bisa dipantau</li>
            </ul>
          </div>
          <div className="vis">
            <div className="vis-card">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <rect x="12" y="8" width="40" height="44" rx="2" /><path d="M32 8v44M27 30v4M37 30v4M16 52v4M48 52v4" />
              </svg>
              <div className="float">
                <div className="row sp"><span className="t12 mut b">FRN-2610-007</span><span className="chip c-prod">Dalam Produksi</span></div>
                <div className="b">Lemari Pakaian, Kayu Jati</div>
                <div className="prog"><i style={{ width: '55%' }} /></div>
                <div className="t12 mut">Estimasi selesai 5 Nov 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap col g24">
          <h2 className="big">Kenapa pesan lewat KangKayu</h2>
          <div className="g3">
            <div className="card feat">
              <span className="sico"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V3M3 21h18M7 17V9M12 17V5M17 17v-6" /></svg></span>
              <h3>Ukuran sesuai ruangan</h3>
              <p className="mut">Isi panjang, lebar, dan tinggi yang kamu butuhkan. Admin menilai kelayakan sebelum membuat penawaran.</p>
            </div>
            <div className="card feat">
              <span className="sico amb"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg></span>
              <h3>Harga jelas di muka</h3>
              <p className="mut">Penawaran berisi harga, estimasi waktu, dan nominal DP. Kamu setuju dulu sebelum membayar.</p>
            </div>
            <div className="card feat">
              <span className="sico blu"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
              <h3>Pantau tanpa bertanya</h3>
              <p className="mut">Status pengerjaan diperbarui admin dan bisa kamu lihat kapan saja dari akun pelanggan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap col g24">
          <div className="row sp"><h2 className="big">Katalog populer</h2><Link className="btn" href="/katalog">Lihat semua produk</Link></div>
          <div className="g4">
            {populer.map((p) => (
              <article className="prod" key={p.id}>
                <div className="ph"><FotoProduk p={p} perbesar /></div>
                <div className="bd">
                  <span className="t12 mut b">{p.kategori.toUpperCase()}</span>
                  <h3>{p.nama}</h3>
                  <span className="pr">Mulai {rupiah(p.hargaMulai)}</span>
                  <Link className="btn pri" href="/login">Pesan Custom</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt" id="cara">
        <div className="wrap col g24">
          <h2 className="big">Cara pesan</h2>
          <div className="g5">
            <div className="stp"><span className="num">1</span><h3>Isi form pesanan</h3><p className="mut">Pilih jenis furniture, ukuran, bahan, warna, dan unggah foto referensi.</p></div>
            <div className="stp"><span className="num">2</span><h3>Terima penawaran</h3><p className="mut">Admin meninjau lalu mengirim harga, estimasi, dan nominal DP.</p></div>
            <div className="stp"><span className="num">3</span><h3>Bayar DP</h3><p className="mut">Transfer lalu unggah bukti. Admin memverifikasi pembayaranmu.</p></div>
            <div className="stp"><span className="num">4</span><h3>Pantau produksi</h3><p className="mut">Lihat status pengerjaan dari akunmu tanpa perlu bertanya.</p></div>
            <div className="stp"><span className="num">5</span><h3>Lunasi dan terima</h3><p className="mut">Setelah selesai, lunasi pembayaran. Produk diantar atau diambil.</p></div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div><h2 className="big">Siap membuat furniture impianmu?</h2><p style={{ marginTop: 6 }}>Daftar gratis dan kirim pesanan pertamamu hari ini.</p></div>
          <Link className="btn pri lg" href="/daftar">Daftar Sekarang</Link>
        </div>
      </section>

      <footer className="foot" id="kontak">
        <div className="wrap">
          <div className="col g8" style={{ maxWidth: 340 }}>
            <Logo />
            <p>Workshop furniture custom. Nama usaha dan logo ini placeholder dan dapat diganti.</p>
          </div>
          <div className="col g8"><h3 style={{ color: '#fff' }}>Kontak</h3><span>[ALAMAT WORKSHOP]</span><span>[NO. WHATSAPP]</span><span>[EMAIL USAHA]</span></div>
          <div className="col g8"><h3 style={{ color: '#fff' }}>Jam operasional</h3><span>[HARI DAN JAM BUKA]</span></div>
        </div>
      </footer>
    </>
  );
}
