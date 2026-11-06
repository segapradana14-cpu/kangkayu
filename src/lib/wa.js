// Mengubah nomor HP Indonesia (08xx, +62 8xx, 62 8xx) menjadi format WhatsApp (628xx). Mengembalikan '' jika tidak valid.
export function nomorWa(noHp) {
  let n = String(noHp || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = `62${n.slice(1)}`;
  else if (n.startsWith('8')) n = `62${n}`;
  return /^62\d{8,13}$/.test(n) ? n : '';
}

export function linkWa(noHp, teks) {
  const n = nomorWa(noHp);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(teks)}` : '';
}
