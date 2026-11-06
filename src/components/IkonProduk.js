// Gambar garis sederhana untuk tiap produk (sama seperti di prototype).
const IKON = {
  lemari: <><rect x="12" y="8" width="40" height="44" rx="2" /><path d="M32 8v44M27 30v4M37 30v4M16 52v4M48 52v4" /></>,
  'meja-makan': <><rect x="8" y="20" width="48" height="6" rx="1" /><path d="M14 26v26M50 26v26M24 26v14M40 26v14" /></>,
  'kitchen-set': <><rect x="6" y="10" width="52" height="12" rx="1" /><rect x="6" y="32" width="52" height="22" rx="1" /><path d="M6 28h52M22 32v22M42 32v22M16 43h2M36 43h2M50 43h2" /></>,
  'tempat-tidur': <><path d="M8 50V20M56 50V30M8 40h48M8 50h48" /><rect x="14" y="30" width="14" height="10" rx="2" /><path d="M28 40v-6h24a4 4 0 0 1 4 4v2" /></>,
  'rak-buku': <><rect x="12" y="8" width="40" height="48" /><path d="M12 22h40M12 36h40M12 50h40M22 8v14M30 22v14M40 36v14" /></>,
  'meja-kerja': <><rect x="6" y="22" width="52" height="5" /><path d="M10 27v26M54 27v26M38 27v14h16" /></>,
  'kursi-makan': <><path d="M20 10h24v22H20zM18 32h28v6H18zM20 38v18M44 38v18" /></>,
  'rak-tv': <><rect x="6" y="32" width="52" height="14" rx="1" /><path d="M6 39h52M20 46v8M44 46v8M24 24h16v8" /></>,
};

export default function IkonProduk({ slug }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {IKON[slug] || IKON.lemari}
    </svg>
  );
}
