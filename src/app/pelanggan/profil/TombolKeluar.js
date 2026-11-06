'use client';

import { signOut } from 'next-auth/react';

export default function TombolKeluar() {
  return <button className="btn dng blk" type="button" onClick={() => signOut({ callbackUrl: '/login' })}>Keluar</button>;
}
