import Link from 'next/link';

export default function Logo() {
  return (
    <Link className="brand" href="/">
      <span className="logo">
        <svg className="ic" viewBox="0 0 64 64" style={{ strokeWidth: 7 }} aria-hidden="true">
          <path d="M20 10v44M20 34L44 10M28 30L46 54" />
        </svg>
      </span>
      KangKayu
    </Link>
  );
}
