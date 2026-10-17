import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: "var(--bg)" }}
    >
      {/* Big 404 */}
      <div
        className="text-[8rem] sm:text-[12rem] font-black leading-none select-none"
        style={{ color: "var(--brand)", opacity: 0.15 }}
        aria-hidden="true"
      >
        404
      </div>

      {/* SVG roll */}
      <div className="-mt-8 mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="var(--brand)" strokeWidth="2.5" opacity="0.5"/>
          <circle cx="40" cy="40" r="24" fill="var(--brand)" opacity="0.12"/>
          <circle cx="40" cy="40" r="14" fill="var(--brand)" opacity="0.25"/>
          <circle cx="40" cy="40" r="6"  fill="var(--brand)" opacity="0.6"/>
          <line x1="16" y1="68" x2="58" y2="20" stroke="#b5883a" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          <line x1="22" y1="72" x2="64" y2="24" stroke="#b5883a" strokeWidth="3" strokeLinecap="round" opacity="0.35"/>
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--fg)" }}>
        Страница не найдена
      </h1>
      <p className="text-base mb-8 max-w-sm" style={{ color: "var(--fg-muted)" }}>
        Возможно, вы ввели неправильный адрес или страница была удалена.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center h-11 px-6 rounded-xl text-white text-sm font-bold transition-colors"
          style={{ background: "var(--brand)" }}
        >
          Вернуться на главную
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center h-11 px-6 rounded-xl text-sm font-bold transition-colors"
          style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
        >
          Перейти в меню
        </Link>
      </div>
    </div>
  );
}
