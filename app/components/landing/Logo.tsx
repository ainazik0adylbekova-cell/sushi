/**
 * СушиЖейм — SVG логотип без фона (чистый на любом фоне).
 * Воспроизводит идею логотипа: ролл с лососем, палочки, название.
 */
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Суши Жейм"
    >
      {/* Outer red ring */}
      <circle cx="40" cy="40" r="36" stroke="#f97316" strokeWidth="3" />

      {/* Chopstick 1 (left-bottom to right-top) */}
      <line x1="14" y1="58" x2="52" y2="16" stroke="#d4a96a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="52" cy="16" r="3" fill="#2a2a2a" />
      <circle cx="14" cy="58" r="2.5" fill="#2a2a2a" />

      {/* Chopstick 2 */}
      <line x1="22" y1="62" x2="58" y2="20" stroke="#d4a96a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="20" r="3" fill="#2a2a2a" />
      <circle cx="22" cy="62" r="2.5" fill="#2a2a2a" />

      {/* Roll: seaweed base */}
      <circle cx="40" cy="38" r="14" fill="#1a1a1a" />
      {/* Rice ring */}
      <circle cx="40" cy="38" r="11" fill="#f5f0e8" />
      {/* Salmon */}
      <ellipse cx="40" cy="38" rx="7" ry="6" fill="#f4845f" />
      {/* Avocado */}
      <ellipse cx="44" cy="34" rx="3.5" ry="2.5" fill="#7bb858" />
      {/* Salmon highlight */}
      <path d="M36 36 Q38 34 40 36 Q42 38 44 36" stroke="#fba58a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}
