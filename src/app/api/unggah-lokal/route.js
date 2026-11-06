import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { MAKS_BYTES } from '@/lib/opsi';

const TIPE = { 'image/jpeg': '.jpg', 'image/png': '.png' };

// Hanya untuk pengembangan di laptop: menyimpan foto ke public/uploads. Mati otomatis di Vercel.
export async function POST(request) {
  if (process.env.VERCEL) return NextResponse.json({ error: 'Tidak tersedia.' }, { status: 404 });
  const session = await getSession();
  const peran = session?.user?.role;
  const fd = await request.formData();
  const file = fd.get('file');
  const folder = String(fd.get('folder') || '');

  const boleh = (folder === 'produk' && peran === 'ADMIN') || ((folder === 'referensi' || folder === 'bukti') && peran === 'PELANGGAN');
  if (!boleh) return NextResponse.json({ error: 'Kamu tidak berhak mengunggah foto ini.' }, { status: 403 });
  if (!file || typeof file !== 'object' || !file.size) return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
  if (!TIPE[file.type]) return NextResponse.json({ error: `File "${file.name}" bukan JPG atau PNG.` }, { status: 400 });
  if (file.size > MAKS_BYTES) return NextResponse.json({ error: `File "${file.name}" lebih dari 5 MB.` }, { status: 400 });

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  const nama = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${TIPE[file.type]}`;
  await fs.writeFile(path.join(dir, nama), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${folder}/${nama}` });
}
