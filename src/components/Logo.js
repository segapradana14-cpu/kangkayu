import Link from 'next/link';

// href: tujuan klik logo. Di halaman publik ke beranda, di sidebar ke dashboard masing-masing.
export default function Logo({ href = '/' }) {
  return (
    <Link className="brand" href={href}>
      <span className="logo">
        <svg className="ic" viewBox="0 0 64 64" style={{ strokeWidth: 7 }} aria-hidden="true">
          <path d="M20 10v44M20 34L44 10M28 30L46 54" />
        </svg>
      </span>
      KangKayu
    </Link>
  );
}
