"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";

// Фотографии из папки public/ — имена файлов как их положила пользователь
const CATEGORY_PHOTOS: Record<string, { img: string; color: string }> = {
  rolls:   { img: "/rolls.png",   color: "#ef4444" },
  sushi:   { img: "/sushi.jpg",   color: "#f97316" },
  sets:    { img: "/sets.png",    color: "#f59e0b" },
  hot:     { img: "/hot.png",     color: "#f97316" },
  noodles: { img: "/wok.png",     color: "#22c55e" },
  snacks:  { img: "/snacks.png",  color: "#a78bfa" },
  drinks:  { img: "/drinks.png",  color: "#38bdf8" },
  all:     { img: "/menu.png",    color: "#f97316" },
};

export default function Categories() {
  const { t } = useLang();

  const categories = [
    { slug: "rolls",   name: t.catRolls,   count: 38  },
    { slug: "sushi",   name: t.catSushi,   count: 24  },
    { slug: "sets",    name: t.catSets,    count: 12  },
    { slug: "hot",     name: t.catHot,     count: 16  },
    { slug: "noodles", name: t.catNoodles, count: 10  },
    { slug: "snacks",  name: t.catSnacks,  count: 8   },
    { slug: "drinks",  name: t.catDrinks,  count: 14  },
    { slug: "all",     name: t.catAll,     count: 122 },
  ];

  return (
    <section id="categories" className="py-16 sm:py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Заголовок */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
              {t.catSubtitle}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--fg)" }}>
              {t.catTitle}
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold transition-colors shrink-0"
            style={{ color: "var(--brand)" }}
          >
            {t.seeAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Сетка категорий */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 stagger">
          {categories.map((cat) => {
            const meta = CATEGORY_PHOTOS[cat.slug];
            if (!meta) return null;

            return (
              <Link
                key={cat.slug}
                href={cat.slug === "all" ? "/menu" : `/menu?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl animate-slide-up"
                style={{
                  boxShadow: "var(--card-shadow)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
                }}
              >
                {/* Фотография */}
                <div className="relative h-32 sm:h-36 overflow-hidden">
                  <Image
                    src={meta.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                  {/* Тёмный градиент снизу */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
                  />
                </div>

                {/* Название и количество */}
                <div className="px-3.5 py-3" style={{ background: "var(--bg-card)" }}>
                  <p className="font-bold text-sm" style={{ color: "var(--fg)" }}>
                    {cat.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    {cat.count} {t.catPositions}
                  </p>
                </div>

                {/* Цветная полоска при наведении */}
                <div
                  className="h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: meta.color }}
                />
              </Link>
            );
          })}
        </div>

        {/* Кнопка «Все» на мобильном */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            {t.seeAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
