"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Plus, Star } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";
import { useCart } from "../../providers/CartProvider";

// Качественные фотографии блюд из Unsplash (бесплатные, высокое разрешение)
const DISH_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80", // Philadelphia roll
  2: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80", // California roll
  3: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80", // Sushi set
  4: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80", // Salmon sushi
  5: "https://images.unsplash.com/photo-1547928576-b259fe7a73f7?w=800&q=80", // Tom Yam soup
  6: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80", // Wok with chicken
};
const FALLBACK = "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80";

function DishPhoto({ id, name }: { id: number; name: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? FALLBACK : (DISH_IMAGES[id] ?? FALLBACK)}
      alt={name}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

const CATS = [
  { slug: "sushi",   color: "#f97316" },
  { slug: "rolls",   color: "#ef4444" },
  { slug: "sets",    color: "#f59e0b" },
  { slug: "hot",     color: "#f97316" },
  { slug: "noodles", color: "#22c55e" },
  { slug: "snacks",  color: "#a78bfa" },
  { slug: "drinks",  color: "#38bdf8" },
];

const DISHES = [
  { id: 1, slug: "rolls",   nameKey: "dishPhilly",     price: 490,  weight: "8 шт · 260 г",  rating: 4.9, accent: "#f97316", tagKey: "tagHit"   },
  { id: 2, slug: "rolls",   nameKey: "dishCalifornia", price: 440,  weight: "8 шт · 240 г",  rating: 4.8, accent: "#ef4444", tagKey: "tagTop"   },
  { id: 3, slug: "sets",    nameKey: "dishSet",        price: 1290, weight: "32 шт",          rating: 4.9, accent: "#f59e0b", tagKey: "tagValue" },
  { id: 4, slug: "sushi",   nameKey: "dishSalmon",     price: 165,  weight: "2 шт · 70 г",   rating: 4.7, accent: "#f97316", tagKey: null       },
  { id: 5, slug: "hot",     nameKey: "dishTomYam",     price: 520,  weight: "400 мл",         rating: 4.8, accent: "#22c55e", tagKey: "tagNew"   },
  { id: 6, slug: "noodles", nameKey: "dishWok",        price: 410,  weight: "350 г",          rating: 4.6, accent: "#a78bfa", tagKey: null       },
];

export default function MenuSection() {
  const { t } = useLang();
  const { addToCart } = useCart();

  const catLabels: Record<string, string> = {
    sushi:   t.catSushi,
    rolls:   t.catRolls,
    sets:    t.catSets,
    hot:     t.catHot,
    noodles: t.catNoodles,
    snacks:  t.catSnacks,
    drinks:  t.catDrinks,
  };

  const dishNames: Record<string, string> = {
    dishPhilly:     t.dishPhilly,
    dishCalifornia: t.dishCalifornia,
    dishSet:        t.dishSet,
    dishSalmon:     t.dishSalmon,
    dishTomYam:     t.dishTomYam,
    dishWok:        t.dishWok,
  };

  const tagLabels: Record<string, string> = {
    tagHit:   t.tagHit,
    tagTop:   t.tagTop,
    tagValue: t.tagValue,
    tagNew:   t.tagNew,
  };

  return (
    <section id="menu" style={{ background: "var(--bg-section)" }} className="py-20">
      <div className="max-w-6xl mx-auto px-5">

        {/* ── Section header ── */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
              {t.menuSubtitle}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--fg)" }}>
              {t.menuTitle}
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold shrink-0"
            style={{ color: "var(--brand)" }}
          >
            {t.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Category pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATS.map((c) => (
            <Link
              key={c.slug}
              href={`/menu?category=${c.slug}`}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--fg-sub)", background: "var(--bg-card)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = c.color;
                (e.currentTarget as HTMLElement).style.color       = c.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color       = "var(--fg-sub)";
              }}
            >
              {catLabels[c.slug]}
            </Link>
          ))}
        </div>

        {/* ── Dish cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DISHES.map((d) => (
            <DishCard
              key={d.id}
              dish={d}
              dishName={dishNames[d.nameKey]}
              catLabel={catLabels[d.slug]}
              tagLabel={d.tagKey ? tagLabels[d.tagKey] : null}
              toCartLabel={t.toCart}
              onAddToCart={() => addToCart({ id: String(d.id), name: dishNames[d.nameKey], price: d.price, accent: d.accent })}
            />
          ))}
        </div>

        {/* Mobile: see all */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            {t.seeAll} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Single dish card ── */
function DishCard({
  dish, dishName, catLabel, tagLabel, toCartLabel, onAddToCart,
}: {
  dish: (typeof DISHES)[number];
  dishName: string;
  catLabel: string;
  tagLabel: string | null;
  toCartLabel: string;
  onAddToCart: () => void;
}) {
  const [added, setAdded]           = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  function handleAdd() {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = dish.accent;
        (e.currentTarget as HTMLElement).style.boxShadow  = `0 4px 20px ${dish.accent}22`;
        setImgHovered(true);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow  = "var(--card-shadow)";
        setImgHovered(false);
      }}
    >
      {/* Image area — 176px tall, consistent across all cards */}
      <div
        className="relative overflow-hidden"
        style={{ height: 176, background: "#f5f3ef", flexShrink: 0 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: imgHovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.35s ease",
          }}
        >
          <DishPhoto id={dish.id} name={dishName} />
        </div>

        {tagLabel && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
            style={{ background: dish.accent, zIndex: 1 }}
          >
            {tagLabel}
          </span>
        )}
        <span
          className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            background: "var(--bg-card)",
            color: "var(--fg-muted)",
            border: "1px solid var(--border)",
            zIndex: 1,
          }}
        >
          {catLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-sm" style={{ color: "var(--fg)" }}>{dishName}</h3>
        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{dish.weight}</p>

        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>{dish.rating}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-black text-lg" style={{ color: "var(--fg)" }}>{dish.price} сом</span>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-white text-xs font-bold transition-all"
            style={{
              background: added ? "#22c55e" : "var(--brand)",
              minWidth: "96px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
            onMouseLeave={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
            aria-label={`Добавить ${dishName} в корзину`}
          >
            {added ? "✓" : <Plus className="w-3.5 h-3.5" />}
            <span className="ml-1">{added ? "Добавлено" : toCartLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
