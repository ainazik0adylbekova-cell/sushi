"use client";

/**
 * SushiLoader
 * -----------
 * Five square cards with sushi/roll photos orbit around a centre point,
 * mimicking the "moving squares" loading animation pattern.
 *
 * Each tile:
 *  - 56×56 px square with 14px border-radius
 *  - real sushi photo (white-background style, matching the site reference)
 *  - object-fit: cover
 *  - unique orbit keyframe + staggered delay
 *
 * Props:
 *  size    — diameter of the orbit container (default 160)
 *  label   — optional text below the animation
 *  visible — when false the loader fades out; parent should unmount after ~400ms
 */

interface SushiLoaderProps {
  size?: number;
  label?: string;
  visible?: boolean;
}

// Five Unsplash sushi/roll photos — clean white/light background, overhead/3/4 angle,
// matching the reference photo style: bright, even lighting, product-centred.
const TILES = [
  {
    src: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=120&q=80&auto=format&fit=crop",
    alt: "Ролл Филадельфия",
    animation: "sushi-orbit   3.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
    delay: "0s",
  },
  {
    src: "https://images.unsplash.com/photo-1617196034099-e66a539bad0c?w=120&q=80&auto=format&fit=crop",
    alt: "Суши с лососем",
    animation: "sushi-orbit-2 3.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
    delay: "0.18s",
  },
  {
    src: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=120&q=80&auto=format&fit=crop",
    alt: "Ролл Калифорния",
    animation: "sushi-orbit-3 3.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
    delay: "0.36s",
  },
  {
    src: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=120&q=80&auto=format&fit=crop",
    alt: "Суши ассорти",
    animation: "sushi-orbit-4 3.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
    delay: "0.54s",
  },
  {
    src: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=120&q=80&auto=format&fit=crop",
    alt: "Ролл с угрём",
    animation: "sushi-orbit-5 3.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
    delay: "0.72s",
  },
];

const TILE_SIZE = 56;

// Fallback SVG shown if an image fails to load
function FallbackTile() {
  return (
    <div
      style={{
        width: TILE_SIZE, height: TILE_SIZE,
        borderRadius: 14,
        background: "var(--brand-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <circle cx="17" cy="17" r="15" stroke="var(--brand)" strokeWidth="2" />
        <circle cx="17" cy="18" r="7" fill="#f0ede6" />
        <circle cx="17" cy="18" r="4.5" fill="var(--brand)" />
        <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c" />
      </svg>
    </div>
  );
}

export default function SushiLoader({
  size = 160,
  label = "Загружаем меню...",
  visible = true,
}: SushiLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        animation: visible
          ? "sushi-loader-appear 0.35s ease both"
          : "sushi-loader-leave 0.35s ease both forwards",
      }}
    >
      {/* Orbit container */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Subtle centre ring */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: size * 0.55,
            height: size * 0.55,
            borderRadius: "50%",
            border: "1.5px dashed var(--border)",
            opacity: 0.6,
          }}
        />

        {/* The 5 sushi tiles */}
        {TILES.map((tile, i) => (
          <TileItem key={i} tile={tile} size={TILE_SIZE} />
        ))}
      </div>

      {/* Label */}
      {label && (
        <p
          className="text-sm font-semibold"
          style={{
            color: "var(--fg-muted)",
            animation: "sushi-fade-in-out 1.8s ease infinite",
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

function TileItem({
  tile,
  size,
}: {
  tile: (typeof TILES)[number];
  size: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: size,
        height: size,
        animation: tile.animation,
        animationDelay: tile.delay,
      } as React.CSSProperties}
    >
      <ImageWithFallback src={tile.src} alt={tile.alt} size={size} />
    </div>
  );
}

function ImageWithFallback({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
        border: "1.5px solid var(--border)",
        background: "var(--bg-card)",
        animation: "sushi-fade-in-out 1.8s ease infinite",
      }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          // Replace the entire parent container with the fallback
          const parent = (e.currentTarget as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `
              <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--brand-light)">
                <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
                  <circle cx="17" cy="17" r="15" stroke="#f97316" stroke-width="2"/>
                  <circle cx="17" cy="18" r="7" fill="#f0ede6"/>
                  <circle cx="17" cy="18" r="4.5" fill="#f97316"/>
                  <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c"/>
                </svg>
              </div>`;
          }
        }}
      />
    </div>
  );
}

/**
 * FullPageLoader — centres the SushiLoader in a full-screen overlay.
 * Use as the Suspense fallback for the menu page.
 */
export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <SushiLoader label={label} size={160} />
    </div>
  );
}
