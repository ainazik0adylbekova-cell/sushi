"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";

const REVIEWS = [
  {
    initials: "АА", name: "Айдана А.",    rating: 5,
    text: "Филадельфия просто великолепна! Всегда свежий лосось, рис идеально приготовлен. Доставили за 35 минут — быстрее обещанного!",
    dish: "Ролл Филадельфия", city: "Бишкек",
  },
  {
    initials: "НУ", name: "Нурбек У.",    rating: 5,
    text: "Заказал большой сет на день рождения. Все гости были в восторге. Красивая упаковка, вкус отменный. Однозначно рекомендую всем!",
    dish: "Сет «Жейм»", city: "Бишкек",
  },
  {
    initials: "БК", name: "Бекзат К.",    rating: 5,
    text: "Том Ям обожаю! Такого насыщенного вкуса я давно не пробовал. Каждый раз заказываю именно здесь. Спасибо за качество!",
    dish: "Том Ям", city: "Бишкек",
  },
  {
    initials: "АЖ", name: "Айпери Ж.",   rating: 5,
    text: "Wok с курицей — моё любимое блюдо здесь. Порция большая, специи подобраны идеально. Курьер всегда вежливый и пунктуальный.",
    dish: "Wok с курицей", city: "Бишкек",
  },
  {
    initials: "АС", name: "Азамат С.",   rating: 5,
    text: "Уже шестой раз заказываю Калифорнию. Каждый раз качество стабильно высокое. Цены адекватные для Бишкека. Буду заказывать ещё!",
    dish: "Ролл Калифорния", city: "Бишкек",
  },
  {
    initials: "НМ", name: "Нурсултан М.", rating: 5,
    text: "Суши с лososем нежнейшие. Качество как в хорошем ресторане, а цена приятно удивляет. Теперь это наш семейный выбор по пятницам.",
    dish: "Суши с лososем", city: "Бишкек",
  },
];

const INTERVAL_MS = 3_000;
const BRAND = "#f97316";

export default function Reviews() {
  const { t } = useLang();
  const total = REVIEWS.length;

  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const progressKeyRef        = useRef(0);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, dir: "next" | "prev" = "next") => {
    setAnimDir(dir);
    setAnimKey(k => k + 1);
    setActive((idx + total) % total);
    progressKeyRef.current += 1;
  }, [total]);

  const next = useCallback(() => goTo(active + 1, "next"), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1, "prev"), [active, goTo]);

  useEffect(() => {
    if (paused) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const idxPrev = (active - 1 + total) % total;
  const idxNext = (active + 1) % total;

  const r = REVIEWS[active];

  return (
    <section
      id="reviews"
      className="py-16 sm:py-20 overflow-hidden"
      style={{ background: "var(--bg-section)" }}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-5">

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BRAND }}>
            {t.reviewsSubtitle}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "var(--fg)" }}>
            {t.reviewsTitle}
          </h2>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="font-black text-sm" style={{ color: "var(--fg)" }}>4.9</span>
            <span className="text-xs" style={{ color: "var(--fg-muted)" }}>{t.reviewsCount}</span>
          </div>
        </div>

        {/* Carousel row */}
        <div className="flex items-center gap-4 select-none">

          {/* ── Left side peek (orange accent) ── */}
          <div
            className="hidden sm:flex shrink-0 cursor-pointer"
            style={{ width: 200 }}
            onClick={() => { setPaused(true); prev(); }}
          >
            <div
              className="w-full rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:opacity-80"
              style={{
                background: "var(--bg-card)",
                border: `2px solid ${BRAND}`,
                boxShadow: `0 4px 20px ${BRAND}22`,
                opacity: 0.55,
                transform: "scale(0.94)",
              }}
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--fg-sub)" }}>
                «{REVIEWS[idxPrev].text}»
              </p>
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${BRAND}40` }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ background: BRAND }}
                >
                  {REVIEWS[idxPrev].initials}
                </div>
                <p className="text-xs font-bold truncate" style={{ color: "var(--fg)" }}>
                  {REVIEWS[idxPrev].name}
                </p>
              </div>
            </div>
          </div>

          {/* ── Center: main active card ── */}
          <div className="flex-1 flex items-center justify-center min-w-0">

            {/* Arrow prev — mobile */}
            <button
              aria-label="Предыдущий"
              onClick={() => { setPaused(true); prev(); }}
              className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-2 transition-all"
              style={{ background: "var(--bg-card)", border: `1.5px solid ${BRAND}`, color: BRAND }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              key={animKey}
              className="w-full max-w-lg flex flex-col gap-4 p-6 rounded-3xl cursor-pointer relative"
              style={{
                background: "var(--bg-card)",
                border: `2px solid ${BRAND}`,
                boxShadow: `0 16px 48px ${BRAND}30, 0 4px 16px rgba(0,0,0,0.12)`,
                animation: `${animDir === "next" ? "reviewSlideFromRight" : "reviewSlideFromLeft"} 0.40s cubic-bezier(0.22,1,0.36,1) both`,
              }}
              onClick={() => setPaused(true)}
            >
              {/* Quote decoration */}
              <Quote
                className="absolute top-5 right-5 w-7 h-7"
                style={{ color: BRAND, opacity: 0.12 }}
              />

              {/* Stars */}
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-base leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                «{r.text}»
              </p>

              {/* Dish chip */}
              <span
                className="inline-flex w-fit text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: `${BRAND}18`, color: BRAND, border: `1px solid ${BRAND}40` }}
              >
                {r.dish}
              </span>

              {/* Author */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: `1.5px solid ${BRAND}30` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                    style={{ background: BRAND }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>{r.name}</p>
                    <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{r.city}</p>
                  </div>
                </div>

                {/* Nav arrows (desktop inside card) */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPaused(true); prev(); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ border: `1.5px solid ${BRAND}`, color: BRAND }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BRAND; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = BRAND; }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPaused(true); next(); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ border: `1.5px solid ${BRAND}`, color: BRAND }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BRAND; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = BRAND; }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Arrow next — mobile */}
            <button
              aria-label="Следующий"
              onClick={() => { setPaused(true); next(); }}
              className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all"
              style={{ background: "var(--bg-card)", border: `1.5px solid ${BRAND}`, color: BRAND }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Right side peek (orange accent) ── */}
          <div
            className="hidden sm:flex shrink-0 cursor-pointer"
            style={{ width: 200 }}
            onClick={() => { setPaused(true); next(); }}
          >
            <div
              className="w-full rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 hover:opacity-80"
              style={{
                background: "var(--bg-card)",
                border: `2px solid ${BRAND}`,
                boxShadow: `0 4px 20px ${BRAND}22`,
                opacity: 0.55,
                transform: "scale(0.94)",
              }}
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--fg-sub)" }}>
                «{REVIEWS[idxNext].text}»
              </p>
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${BRAND}40` }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                  style={{ background: BRAND }}
                >
                  {REVIEWS[idxNext].initials}
                </div>
                <p className="text-xs font-bold truncate" style={{ color: "var(--fg)" }}>
                  {REVIEWS[idxNext].name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              aria-label={`Отзыв ${i + 1}`}
              onClick={() => { setPaused(true); goTo(i, i > active ? "next" : "prev"); }}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === active ? 28 : 8,
                height:     8,
                background: i === active ? BRAND : `${BRAND}40`,
              }}
            />
          ))}
        </div>

        {paused && (
          <p className="text-center text-xs mt-3" style={{ color: "var(--fg-muted)" }}>
            Отведите мышь, чтобы возобновить
          </p>
        )}
      </div>

      <style>{`
        @keyframes reviewSlideFromRight {
          from { opacity: 0; transform: translateX(48px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
        @keyframes reviewSlideFromLeft {
          from { opacity: 0; transform: translateX(-48px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)     scale(1); }
        }
      `}</style>
    </section>
  );
}
