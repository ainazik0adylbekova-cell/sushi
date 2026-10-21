"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Star, Search } from "lucide-react";
import Link from "next/link";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { useCart } from "../providers/CartProvider";
import { FullPageLoader } from "../components/SushiLoader";

// ─────────────────────────────────────────────────────────────────────────────
// Image map — clean white/light-background food photography.
// All URLs are stable Unsplash CDN links with explicit crop parameters.
// ─────────────────────────────────────────────────────────────────────────────
const DISH_IMAGES: Record<number, string> = {
  // Rolls
  1:  "https://i.pinimg.com/736x/cc/8d/f3/cc8df3edb1ce4206a28789893c5b63b7.jpg", // Philadelphia
  2:  "https://i.pinimg.com/736x/cc/8d/f3/cc8df3edb1ce4206a28789893c5b63b7.jpg", // California
  7:  "https://images.unsplash.com/photo-1617196034302-a5f1ccbbd1f2?w=600&h=450&q=90&auto=format&fit=crop", // Dragon
  8:  "https://images.unsplash.com/photo-1617196035018-30a7c4ec3efe?w=600&h=450&q=90&auto=format&fit=crop", // Tempura
  18: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&h=450&q=90&auto=format&fit=crop",    // Rainbow
  // Sushi / Nigiri
  4:  "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&h=450&q=90&auto=format&fit=crop", // Salmon nigiri
  9:  "https://images.unsplash.com/photo-1640671894829-e3fd79ccb0f9?w=600&h=450&q=90&auto=format&fit=crop", // Tuna nigiri
  10: "https://images.unsplash.com/photo-1617196035230-7de38fc4dc23?w=600&h=450&q=90&auto=format&fit=crop", // Eel nigiri
  // Sets
  3:  "https://images.unsplash.com/photo-1617196035902-e1ec63093e8f?w=600&h=450&q=90&auto=format&fit=crop", // Big set
  11: "https://i.pinimg.com/736x/cc/8d/f3/cc8df3edb1ce4206a28789893c5b63b7.jpg", // Classic set
  // Hot dishes
  5:  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=450&q=90&auto=format&fit=crop",    // Tom Yam
  12: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=450&q=90&auto=format&fit=crop", // Ramen
  // Noodles / Wok
  6:  "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=450&q=90&auto=format&fit=crop", // Wok chicken
  13: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=450&q=90&auto=format&fit=crop", // Wok beef
  // Snacks
  14: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=450&q=90&auto=format&fit=crop",    // Gyoza
  15: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&q=90&auto=format&fit=crop", // Edamame / veg
  // Drinks
  16: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3d18?w=600&h=450&q=90&auto=format&fit=crop", // Matcha
  17: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=450&q=90&auto=format&fit=crop",    // Lemonade
};

// Reliable fallback — classic Philadelphia roll, always works
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&h=450&q=90&auto=format&fit=crop";

// ─────────────────────────────────────────────────────────────────────────────
// Static menu data (replace with API when ready)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "all",     label: "Все блюда",   color: "#f97316" },
  { slug: "rolls",   label: "Роллы",       color: "#ef4444" },
  { slug: "sushi",   label: "Суши",        color: "#f97316" },
  { slug: "sets",    label: "Сеты",        color: "#f59e0b" },
  { slug: "hot",     label: "Горячее",     color: "#f97316" },
  { slug: "noodles", label: "Лапша / Вок", color: "#22c55e" },
  { slug: "snacks",  label: "Закуски",     color: "#a78bfa" },
  { slug: "drinks",  label: "Напитки",     color: "#38bdf8" },
];

interface Dish {
  id: number;
  slug: string;
  name: string;
  desc: string;
  price: number;
  weight: string;
  rating: number;
  reviews: number;
  tag: string | null;
  accent: string;
}

const DISHES: Dish[] = [
  { id: 1,  slug: "rolls",   name: "Ролл Филадельфия",   desc: "Лосось, сливочный сыр, огурец, авокадо, нори, рис",           price: 490,  weight: "8 шт · 260 г",  rating: 4.9, reviews: 312, tag: "Хит",     accent: "#f97316" },
  { id: 2,  slug: "rolls",   name: "Ролл Калифорния",    desc: "Краб, авокадо, огурец, тобико, нори снаружи",                 price: 440,  weight: "8 шт · 240 г",  rating: 4.8, reviews: 248, tag: "Топ",     accent: "#ef4444" },
  { id: 3,  slug: "sets",    name: "Сет «Жейм»",         desc: "32 штуки: Филадельфия, Калифорния, Дракон, Темпура",          price: 1290, weight: "32 шт · 960 г", rating: 4.9, reviews: 189, tag: "Выгодно", accent: "#f59e0b" },
  { id: 4,  slug: "sushi",   name: "Суши с лососем",     desc: "Свежий лосось, рис, васаби, имбирь",                          price: 165,  weight: "2 шт · 70 г",   rating: 4.7, reviews: 156, tag: null,      accent: "#f97316" },
  { id: 5,  slug: "hot",     name: "Том Ям",             desc: "Острый суп с морепродуктами, грибами шиитаке и лемонграссом",  price: 520,  weight: "400 мл",         rating: 4.8, reviews: 134, tag: "Новинка", accent: "#22c55e" },
  { id: 6,  slug: "noodles", name: "Wok с курицей",      desc: "Рисовая лапша, куриное филе, овощи, соус терияки",            price: 410,  weight: "350 г",          rating: 4.6, reviews: 98,  tag: null,      accent: "#84cc16" },
  { id: 7,  slug: "rolls",   name: "Ролл Дракон",        desc: "Угорь, авокадо, огурец, тобико, соус унаги",                  price: 540,  weight: "8 шт · 280 г",  rating: 4.8, reviews: 211, tag: "Топ",     accent: "#a78bfa" },
  { id: 8,  slug: "rolls",   name: "Ролл Темпура",       desc: "Креветка темпура, огурец, сливочный сыр, икра",               price: 460,  weight: "8 шт · 250 г",  rating: 4.7, reviews: 175, tag: null,      accent: "#38bdf8" },
  { id: 9,  slug: "sushi",   name: "Суши с тунцом",      desc: "Свежий тунец, рис, соевый соус",                              price: 175,  weight: "2 шт · 70 г",   rating: 4.6, reviews: 89,  tag: null,      accent: "#ef4444" },
  { id: 10, slug: "sushi",   name: "Суши с угрём",       desc: "Копчёный угорь, рис, соус унаги",                             price: 190,  weight: "2 шт · 75 г",   rating: 4.8, reviews: 102, tag: "Хит",     accent: "#f59e0b" },
  { id: 11, slug: "sets",    name: "Сет «Классика»",     desc: "24 штуки: лучшие роллы для компании",                         price: 990,  weight: "24 шт · 720 г", rating: 4.7, reviews: 143, tag: null,      accent: "#f97316" },
  { id: 12, slug: "hot",     name: "Рамен с курицей",    desc: "Насыщенный бульон, рисовая лапша, яйцо, водоросли нори",      price: 480,  weight: "450 мл",         rating: 4.7, reviews: 76,  tag: null,      accent: "#f59e0b" },
  { id: 13, slug: "noodles", name: "Wok с говядиной",    desc: "Говяжья вырезка, лапша удон, перец, грибы, соус XO",          price: 490,  weight: "360 г",          rating: 4.5, reviews: 67,  tag: null,      accent: "#22c55e" },
  { id: 14, slug: "snacks",  name: "Гёдза",              desc: "Жареные пельмени с курицей и овощами, 6 штук",                price: 290,  weight: "6 шт · 180 г",  rating: 4.6, reviews: 88,  tag: "Новинка", accent: "#a78bfa" },
  { id: 15, slug: "snacks",  name: "Эдамаме",            desc: "Молодые соевые бобы, морская соль",                           price: 190,  weight: "200 г",          rating: 4.4, reviews: 54,  tag: null,      accent: "#22c55e" },
  { id: 16, slug: "drinks",  name: "Зелёный чай Matcha", desc: "Японский матча, молоко на выбор",                             price: 220,  weight: "300 мл",         rating: 4.7, reviews: 91,  tag: null,      accent: "#22c55e" },
  { id: 17, slug: "drinks",  name: "Лимонад Юзу",        desc: "Японский цитрус юзу, газированная вода, мёд",                 price: 180,  weight: "400 мл",         rating: 4.5, reviews: 63,  tag: null,      accent: "#f59e0b" },
  { id: 18, slug: "rolls",   name: "Ролл Радуга",        desc: "Смесь лосося, тунца, авокадо и огурца поверх калифорнии",    price: 580,  weight: "8 шт · 300 г",  rating: 4.9, reviews: 167, tag: "Хит",     accent: "#f97316" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dish image with fallback
// ─────────────────────────────────────────────────────────────────────────────
function DishImage({ id, name, accent }: { id: number; name: string; accent: string }) {
  const [errored, setErrored] = useState(false);
  const src = errored ? FALLBACK_IMAGE : (DISH_IMAGES[id] ?? FALLBACK_IMAGE);

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transition: "transform 0.35s ease",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dish card — clicking opens the detail page
// ─────────────────────────────────────────────────────────────────────────────
function DishCard({ dish }: { dish: Dish }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  // Generate a URL-friendly slug from the dish name (same logic as the API)
  function toSlug(name: string): string {
    const CYRILLIC: Record<string, string> = {
      а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",
      й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",
      у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",
      ь:"",э:"e",ю:"yu",я:"ya",
    };
    return name
      .toLowerCase()
      .replace(/[а-яёА-ЯЁ]/g, (c) => CYRILLIC[c] ?? c)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); // don't navigate when clicking the cart button
    addToCart({ id: String(dish.id), name: dish.name, price: dish.price, accent: dish.accent });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/menu/${toSlug(dish.name)}`}
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--bg-card)",
        border: "1.5px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = dish.accent;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${dish.accent}28`;
        setImgHovered(true);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
        setImgHovered(false);
      }}
    >
      {/* ── Image area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: 180, background: "#f5f3ef", flexShrink: 0 }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: imgHovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.35s ease",
          }}
        >
          <DishImage id={dish.id} name={dish.name} accent={dish.accent} />
        </div>
        {dish.tag && (
          <span
            className="absolute top-2.5 left-2.5 text-[10px] font-black text-white px-2.5 py-0.5 rounded-full"
            style={{ background: dish.accent, zIndex: 1 }}
          >
            {dish.tag}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 gap-2 p-4">
        <h2 className="font-bold text-sm leading-snug" style={{ color: "var(--fg)" }}>
          {dish.name}
        </h2>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
          {dish.desc}
        </p>
        <p className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>
          {dish.weight}
        </p>

        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>{dish.rating}</span>
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>({dish.reviews})</span>
        </div>

        <div
          className="flex items-center justify-between mt-auto pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>
            {dish.price} сом
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-white text-xs font-bold transition-all"
            style={{
              background: added ? "#22c55e" : "var(--brand)",
              minWidth: "90px",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)";
            }}
            onMouseLeave={(e) => {
              if (!added) (e.currentTarget as HTMLElement).style.background = added ? "#22c55e" : "var(--brand)";
            }}
            aria-label={`Добавить ${dish.name} в корзину`}
          >
            {added ? "✓ Добавлено" : <><Plus className="w-3.5 h-3.5" /><span className="ml-1">В корзину</span></>}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────────────────────────────────────
export default function MenuPage() {
  return (
    <Suspense fallback={<FullPageLoader label="Загружаем меню..." />}>
      <MenuContent />
    </Suspense>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActive(cat);
  }, [searchParams]);

  const filtered = DISHES.filter((d) => {
    const matchCat    = active === "all" || d.slug === active;
    const q           = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>

        {/* ── Hero strip ── */}
        <div
          className="py-10 sm:py-14"
          style={{ background: "var(--bg-section)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--brand)" }}>
              Суши Жейм
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--fg)" }}>
              Наше меню
            </h1>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--fg-muted)" }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск блюд..."
                className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "var(--bg-card)",
                  border: "1.5px solid var(--border)",
                  color: "var(--fg)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Category tabs ── */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActive(cat.slug)}
                className="h-9 px-4 rounded-full text-sm font-semibold border transition-all"
                style={{
                  borderColor: active === cat.slug ? cat.color : "var(--border)",
                  color:       active === cat.slug ? cat.color : "var(--fg-sub)",
                  background:  active === cat.slug ? `${cat.color}15` : "var(--bg-card)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Result count ── */}
          <p className="text-xs font-semibold mb-5" style={{ color: "var(--fg-muted)" }}>
            {filtered.length}{" "}
            {filtered.length === 1 ? "блюдо" : filtered.length < 5 ? "блюда" : "блюд"}
          </p>

          {/* ── Grid ── */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map((d) => (
                <DishCard key={d.id} dish={d} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="text-lg font-bold" style={{ color: "var(--fg-muted)" }}>
                Блюда не найдены
              </p>
              <button
                onClick={() => { setActive("all"); setSearch(""); }}
                className="h-9 px-5 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--brand)" }}
              >
                Показать все
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
