"use client";

import Link from "next/link";
import { ArrowRight, Clock, Star, Truck } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";

export default function Hero() {
  const { t } = useLang();

  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Анимация покачивания суши + управление mix-blend-mode по теме */}
      <style>{`
        @keyframes sushiRock {
          0%   { transform: perspective(800px) rotateY(-8deg) rotateZ(-1deg); }
          50%  { transform: perspective(800px) rotateY( 8deg) rotateZ( 1deg); }
          100% { transform: perspective(800px) rotateY(-8deg) rotateZ(-1deg); }
        }
        .sushi-rock {
          animation: sushiRock 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        /* Светлая тема — multiply убирает белый фон */
        :root .sushi-nobg { mix-blend-mode: multiply; }
        /* Тёмная тема — normal, иначе изображение исчезнет */
        .dark  .sushi-nobg { mix-blend-mode: normal; }
        @media (max-width: 640px) {
          .sushi-rock { animation-duration: 7s; }
        }
        /* Адаптация для мобильных */
        @media (max-width: 768px) {
          .hero-title { font-size: clamp(1.75rem, 8vw, 2.5rem) !important; }
          .hero-desc { font-size: 0.875rem !important; max-width: 100% !important; }
          .hero-stats { flex-direction: column; align-items: flex-start; gap: 0.75rem !important; }
          .hero-buttons { width: 100%; }
          .hero-buttons a, .hero-buttons button { width: 100%; justify-content: center; }
        }
        @media (max-width: 480px) {
          .hero-badge { padding: 0.5rem 0.75rem !important; font-size: 0.75rem !important; }
          .hero-badge .icon { width: 0.875rem !important; height: 0.875rem !important; }
        }
      `}</style>

      {/* Фоновые свечения */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 pointer-events-none hero-glow"
        style={{
          width: 560, height: 560, borderRadius: "50%",
          background: "radial-gradient(circle at 65% 35%, rgba(249,115,22,0.12) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 75%, rgba(249,115,22,0.07) 0%, transparent 62%)",
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-5 py-12 sm:py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

          {/* ── Левая колонка: текст ── */}
          <div className="flex flex-col gap-4 sm:gap-5 order-2 lg:order-1">

            <span
              className="hero-text-1 inline-flex items-center gap-2 w-fit text-xs font-semibold px-3 sm:px-3.5 py-1.5 rounded-full"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--brand)" }} />
              {t.heroBadge}
            </span>

            <h1
              className="hero-text-2 hero-title font-black leading-tight tracking-tight"
              style={{ fontSize: "clamp(2.1rem, 5.2vw, 4rem)", color: "var(--fg)" }}
            >
              {t.heroLine1}
              <br />
              <span style={{ color: "var(--brand)" }}>{t.heroLine2}</span>
              <br />
              {t.heroLine3}
            </h1>

            <p
              className="hero-text-3 hero-desc text-sm sm:text-base leading-relaxed max-w-[420px]"
              style={{ color: "var(--fg-sub)" }}
            >
              {t.heroDesc}
            </p>

            <div className="hero-text-4 hero-buttons flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: "var(--brand)", boxShadow: "0 4px 18px rgba(249,115,22,0.38)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
              >
                {t.openMenu}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#menu"
                className="inline-flex items-center justify-center h-11 sm:h-12 px-6 rounded-xl font-semibold text-sm transition-colors"
                style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
                  (e.currentTarget as HTMLElement).style.color = "var(--brand)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--fg-sub)";
                }}
              >
                {t.seeMenu}
              </a>
            </div>

            <div
              className="hero-text-5 hero-stats flex flex-wrap gap-4 sm:gap-5 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {[
                { Icon: Star,  val: "4.9 / 5",    lbl: t.statRating   },
                { Icon: Truck, val: "от 199 сом", lbl: t.statDelivery },
                { Icon: Clock, val: "40–60 мин",  lbl: t.statTime     },
              ].map(({ Icon, val, lbl }) => (
                <div key={lbl} className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--brand-light)" }}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--brand)" }} />
                  </div>
                  <div>
                    <p className="font-black text-xs sm:text-sm leading-none" style={{ color: "var(--fg)" }}>{val}</p>
                    <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{lbl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Правая колонка: sushigl.png с анимацией ── */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 py-4 lg:py-0">

            {/* Мягкое оранжевое свечение */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 70% 65% at 50% 55%, rgba(249,115,22,0.15) 0%, transparent 72%)",
              }}
            />

            {/* Обёртка — позиционирует плашки относительно самого фото */}
            <div
              className="hero-img relative z-10 inline-block"
              style={{
                width: "min(640px, 96vw)",
                filter: "drop-shadow(0 24px 48px rgba(249,115,22,0.28)) drop-shadow(0 6px 18px rgba(0,0,0,0.20))",
              }}
            >
              {/* PNG без фона с анимацией покачивания */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sushigl.png"
                alt="Суши Жейм"
                className="sushi-rock sushi-nobg"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  background: "transparent",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/rolls.png";
                  (e.currentTarget as HTMLImageElement).style.borderRadius = "20px";
                  (e.currentTarget as HTMLImageElement).className = "sushi-rock";
                }}
              />

              {/* Плашка рейтинг — прямо на фото, правый верхний угол */}
              <div
                className="hero-badge absolute flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl z-20"
                style={{
                  top: "8%",
                  right: "-4px",
                  background: "var(--bg-card)",
                  boxShadow: "var(--card-shadow-hover)",
                  border: "1px solid var(--border)",
                }}
              >
                <Star className="icon w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 shrink-0" />
                <div>
                  <p className="font-black text-xs sm:text-sm leading-none" style={{ color: "var(--fg)" }}>4.9 / 5.0</p>
                  <p className="text-[9px] sm:text-[10px] mt-0.5" style={{ color: "var(--fg-muted)" }}>1 200+ отзывов</p>
                </div>
              </div>

              {/* Плашка доставка — левый нижний угол фото */}
              <div
                className="hero-badge absolute flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl z-20"
                style={{
                  bottom: "8%",
                  left: "-4px",
                  background: "var(--brand)",
                  boxShadow: "0 8px 28px rgba(249,115,22,0.38)",
                }}
              >
                <Truck className="icon w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <p className="font-bold text-xs sm:text-sm text-white whitespace-nowrap">Доставка 40 мин</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
