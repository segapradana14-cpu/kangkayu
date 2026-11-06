import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { getSession } from '@/lib/session';
import { MAKS_BYTES } from '@/lib/opsi';

// Memberi izin unggah langsung dari browser ke Vercel Blob, hanya untuk pengguna yang berhak.
export async function POST(request) {
  const body = await request.json();
  try {
    const session = await getSession();
    const hasil = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const folder = pathname.split('/')[0];
        const peran = session?.user?.role;
        const boleh =
          (folder === 'produk' && peran === 'ADMIN') ||
          ((folder === 'referensi' || folder === 'bukti') && peran === 'PELANGGAN');
        if (!boleh) throw new Error('Kamu tidak berhak mengunggah foto ini.');
        return { allowedContentTypes: ['image/jpeg', 'image/png'], maximumSizeInBytes: MAKS_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(hasil);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
