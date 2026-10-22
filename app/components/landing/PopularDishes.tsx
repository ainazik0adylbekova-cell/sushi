"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Star, ChevronRight } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";
import { useCart } from "../../providers/CartProvider";

// Фотографии блюд из папки public (загруженные вами)
const DISH_IMAGES: Record<number, string> = {
  101: "/filadel.jpg",        // Ролл Филадельфия
  102: "/colif.jpg",          // Ролл Калифорния
  103: "/set.classik.jpg",    // Сет Классика
  104: "/sushi.jpg",          // Суши с лососем
  105: "/hot.png",            // Том Ям (временно hot.png)
  106: "/wok.png",            // Wok с курицей
};
const FALLBACK = "/rolls.png"; // Fallback из public

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

export default function PopularDishes() {
  const { t } = useLang();
  const { addToCart } = useCart();

  const dishes = [
    { id: 101, name: "Ролл Филадельфия", category: t.catRolls,   price: 490,  weight: `8 ${t.pieces} / 260 ${t.gram}`, rating: 4.9, reviews: 312, tag: t.tagHit,   tagColor: "#f97316", accent: "#f97316" },
    { id: 102, name: "Ролл Калифорния",  category: t.catRolls,   price: 440,  weight: `8 ${t.pieces} / 240 ${t.gram}`, rating: 4.8, reviews: 248, tag: t.tagTop,   tagColor: "#ef4444", accent: "#ef4444" },
    { id: 103, name: "Сет «Классика»",   category: t.catSets,    price: 1290, weight: `32 ${t.pieces}`,                rating: 4.9, reviews: 189, tag: t.tagValue, tagColor: "#f59e0b", accent: "#f59e0b" },
    { id: 104, name: "Суши с лососем",   category: t.catSushi,   price: 165,  weight: `2 ${t.pieces} / 70 ${t.gram}`,  rating: 4.7, reviews: 156, tag: null,       tagColor: "",        accent: "#f97316" },
    { id: 105, name: "Том Ям",           category: t.catHot,     price: 520,  weight: `400 ${t.ml}`,                  rating: 4.8, reviews: 134, tag: t.tagNew,   tagColor: "#22c55e", accent: "#22c55e" },
    { id: 106, name: "Wok с курицей",    category: t.catNoodles, price: 410,  weight: `350 ${t.gram}`,                rating: 4.6, reviews: 98,  tag: null,       tagColor: "",        accent: "#84cc16" },
  ];

  return (
    <section className="py-20" style={{ background: "var(--bg-section)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
              {t.menuSubtitle}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--fg)" }}>
              {t.menuTitle}
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold shrink-0 transition-colors"
            style={{ color: "var(--brand)" }}
          >
            {t.seeAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {dishes.map((dish) => (
            <PopularDishCard
              key={dish.id}
              dish={dish}
              toCartLabel={t.toCart}
              onAddToCart={() => addToCart({ id: String(dish.id), name: dish.name, price: dish.price, accent: dish.accent })}
            />
          ))}
        </div>

        {/* Mobile: see all */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--fg)" }}
          >
            {t.seeAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Card subcomponent ── */
function PopularDishCard({
  dish,
  toCartLabel,
  onAddToCart,
}: {
  dish: {
    id: number;
    name: string;
    category: string;
    price: number;
    weight: string;
    rating: number;
    reviews: number;
    tag: string | null;
    tagColor: string;
    accent: string;
  };
  toCartLabel: string;
  onAddToCart: () => void;
}) {
  const [added, setAdded]         = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  function handleAdd() {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article
      className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = dish.accent;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${dish.accent}30`;
        setImgHovered(true);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
        setImgHovered(false);
      }}
    >
      {/* Image area — 176px, consistent aspect ratio */}
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
          <DishPhoto id={dish.id} name={dish.name} />
        </div>

        {dish.tag && (
          <span
            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: dish.tagColor, zIndex: 1 }}
          >
            {dish.tag}
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
          {dish.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        <h3 className="font-bold text-sm leading-snug" style={{ color: "var(--fg)" }}>
          {dish.name}
        </h3>
        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{dish.weight}</p>

        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>{dish.rating}</span>
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>({dish.reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>
            {dish.price} сом
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-white text-xs font-bold transition-all"
            style={{
              background: added ? "#22c55e" : "var(--brand)",
              minWidth: "88px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
            onMouseLeave={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
            aria-label={`Добавить ${dish.name} в корзину`}
          >
            {added ? "✓" : <Plus className="w-3.5 h-3.5" />}
            <span className="ml-1">{added ? "Добавлено" : toCartLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
