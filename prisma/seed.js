// Mengisi data awal: akun admin, akun pelanggan contoh, dan 8 produk katalog.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const produk = [
  { slug: 'lemari', nama: 'Lemari Pakaian', kategori: 'Lemari', hargaMulai: 2500000, deskripsi: 'Pintu swing atau sliding, laci dan gantungan sesuai kebutuhan.' },
  { slug: 'meja-makan', nama: 'Meja Makan', kategori: 'Meja', hargaMulai: 1800000, deskripsi: 'Ukuran dan jumlah kursi menyesuaikan ruang makan keluarga.' },
  { slug: 'kitchen-set', nama: 'Kitchen Set', kategori: 'Kitchen Set', hargaMulai: 6000000, deskripsi: 'Kabinet atas dan bawah, lengkap lubang kompor dan bak cuci.' },
  { slug: 'tempat-tidur', nama: 'Tempat Tidur', kategori: 'Tempat Tidur', hargaMulai: 2200000, deskripsi: 'Ukuran single sampai king, bisa dengan laci penyimpanan.' },
  { slug: 'rak-buku', nama: 'Rak Buku', kategori: 'Rak', hargaMulai: 850000, deskripsi: 'Jumlah sekat dan tinggi rak mengikuti dinding yang tersedia.' },
  { slug: 'meja-kerja', nama: 'Meja Kerja', kategori: 'Meja', hargaMulai: 1200000, deskripsi: 'Dengan laci dan rak, cocok untuk ruang kerja di rumah.' },
  { slug: 'kursi-makan', nama: 'Kursi Makan', kategori: 'Kursi', hargaMulai: 350000, deskripsi: 'Dipesan per unit, model sandaran dan dudukan bisa dipilih.' },
  { slug: 'rak-tv', nama: 'Rak TV', kategori: 'Rak', hargaMulai: 900000, deskripsi: 'Panjang menyesuaikan ukuran televisi dan ruang keluarga.' },
];

async function main() {
  const passAdmin = await bcrypt.hash('admin12345', 10);
  const passAndi = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@kayukita.test' },
    update: {},
    create: { nama: 'Admin Workshop', email: 'admin@kayukita.test', password: passAdmin, role: 'ADMIN', noHp: '0800-0000-0000', alamat: 'Workshop KangKayu' },
  });

  await prisma.user.upsert({
    where: { email: 'andi@email.com' },
    update: {},
    create: { nama: 'Andi Pratama', email: 'andi@email.com', password: passAndi, role: 'PELANGGAN', noHp: '0812-3456-7890', alamat: 'Jl. Contoh No. 12, Gresik' },
  });

  for (const p of produk) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  console.log('Seed selesai.');
  console.log('Admin     : admin@kayukita.test / admin12345');
  console.log('Pelanggan : andi@email.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
