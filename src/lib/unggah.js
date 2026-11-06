import { upload } from '@vercel/blob/client';

// Mengunggah satu foto langsung dari browser dan mengembalikan alamatnya.
// Di Vercel: ke Vercel Blob. Di laptop (NEXT_PUBLIC_PENYIMPANAN=lokal): ke folder public/uploads.
export async function unggahFoto(file, folder) {
  if (process.env.NEXT_PUBLIC_PENYIMPANAN === 'lokal') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/unggah-lokal', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto.');
    return data.url;
  }
  const ext = file.type === 'image/png' ? '.png' : '.jpg';
  try {
    const blob = await upload(`${folder}/${Date.now()}${ext}`, file, { access: 'public', handleUploadUrl: '/api/blob/upload' });
    return blob.url;
  } catch (e) {
    throw new Error(e?.message || 'Gagal mengunggah foto. Coba lagi.');
  }
}
