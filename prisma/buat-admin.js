// Membuat akun admin baru dari terminal.
// Pemakaian: npm run db:admin -- "Nama Admin" email@contoh.com passwordnya
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [nama, emailMentah, password] = process.argv.slice(2);
  if (!nama || !emailMentah || !password) {
    console.log('Pemakaian: npm run db:admin -- "Nama Admin" email@contoh.com password');
    process.exit(1);
  }
  const email = emailMentah.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Format email tidak valid.');
  if (password.length < 8) throw new Error('Password minimal 8 karakter.');

  const ada = await prisma.user.findUnique({ where: { email } });
  if (ada) throw new Error(`Email ${email} sudah terdaftar (peran: ${ada.role}). Pakai email lain.`);

  await prisma.user.create({
    data: { nama: nama.trim(), email, password: await bcrypt.hash(password, 10), role: 'ADMIN' },
  });
  console.log(`Akun admin dibuat: ${email}`);
}

main()
  .catch((e) => { console.error('Gagal:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
