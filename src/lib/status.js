// Label dan warna chip untuk tiap status pesanan.
export const STATUS = {
  MENUNGGU_TINJAUAN: { label: 'Menunggu Tinjauan', chip: 'c-wait' },
  MENUNGGU_PERSETUJUAN: { label: 'Menunggu Persetujuan', chip: 'c-wait' },
  MENUNGGU_DP: { label: 'Menunggu DP', chip: 'c-wait' },
  DALAM_PRODUKSI: { label: 'Dalam Produksi', chip: 'c-prod' },
  MENUNGGU_PELUNASAN: { label: 'Menunggu Pelunasan', chip: 'c-wait' },
  SIAP_DIANTAR: { label: 'Siap Diantar', chip: 'c-prod' },
  SELESAI: { label: 'Selesai', chip: 'c-ok' },
  DITOLAK: { label: 'Ditolak', chip: 'c-bad' },
  DIBATALKAN: { label: 'Dibatalkan', chip: 'c-gray' },
};

export function tanggal(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ukuran(o) {
  return `${o.panjang} x ${o.lebar} x ${o.tinggi} cm`;
}
