'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import Ikon from '@/components/Ikon';
import useNotif from '@/components/useNotif';

// items: [{ label: 'Menu' }  atau  { href, text, icon, badge, kunci }]
export default function Sidebar({ items, nama, peran, admin }) {
  const pathname = usePathname();
  const notif = useNotif();
  const inisial = (nama || '?').split(' ').map((k) => k[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={admin ? 'side adm' : 'side'}>
      {admin ? (
        <div className="row sp"><Logo /><span className="tag">Admin</span></div>
      ) : (
        <Logo />
      )}
      <nav className="nav" aria-label={admin ? 'Menu admin' : 'Menu pelanggan'}>
        {items.map((it, i) =>
          it.label ? (
            <span key={i} className="lbl">{it.label}</span>
          ) : (
            <Link key={i} href={it.href} className={pathname.startsWith(it.href) ? 'on' : ''}>
              <Ikon nama={it.icon} />
              {it.text}
              {(notif && it.kunci ? notif[it.kunci] : it.badge) ? <span className="cnt">{notif && it.kunci ? notif[it.kunci] : it.badge}</span> : null}
            </Link>
          )
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: '/login' }); }}>
          <Ikon nama="logout" />Keluar
        </a>
      </nav>
      <div className="me">
        <span className="av">{inisial}</span>
        <div>
          <div className="b" style={admin ? { color: '#fff' } : undefined}>{nama}</div>
          <div className="t12" style={admin ? { color: '#9fb0ab' } : undefined}>{peran}</div>
        </div>
      </div>
    </aside>
  );
}
