import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { ambilLaporan, periode } from '@/lib/laporan';
import { STATUS } from '@/lib/status';

export const dynamic = 'force-dynamic';

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// Ekspor laporan ke CSV (pemisah titik koma agar terbuka rapi di Excel Indonesia).
export async function GET(req) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') return new NextResponse('Tidak diizinkan', { status: 401 });

  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const p = periode(sp);
  const lap = await ambilLaporan(p);

  const baris = [
    ['Tanggal', 'Kode', 'Pelanggan', 'Produk', 'Nilai (Rp)', 'Dibayar (Rp)', 'Status'],
    ...lap.baris.map((b) => [
      new Date(b.tanggal).toLocaleDateString('id-ID'), b.kode, b.pelanggan, b.produk,
      b.nilai ?? '', b.dibayar, STATUS[b.status].label,
    ]),
    ['', '', '', 'Total', lap.nilai, lap.dibayar, ''],
  ];
  const csv = '﻿' + baris.map((r) => r.map(esc).join(';')).join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-kangkayu-${p.dari}-sd-${p.sampai}.csv"`,
    },
  });
}
