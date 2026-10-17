"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ShoppingCart,
  Plus, Minus, Star, Loader2, AlertTriangle,
  Package, Weight, Clock, Tag,
} from "lucide-react";
import Header from "../../components/landing/Header";
import Footer from "../../components/landing/Footer";
import { useCart } from "../../providers/CartProvider";
import { useAuth } from "../../providers/AuthProvider";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  discountPrice: number | null;
  weight: number | null;
  piecesCount: number | null;
  cookingTimeMin: number | null;
  isAvailable: boolean;
  mainImage: string | null;
  images: { id: string; url: string; isMain: boolean; altText: string | null }[];
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; color: string | null }[];
  reviews: ReviewItem[];
  avgRating: number | null;
  reviewCount: number;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback image
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK =
  "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=90&auto=format&fit=crop";

// ─────────────────────────────────────────────────────────────────────────────
// Star row
// ─────────────────────────────────────────────────────────────────────────────
function StarRow({
  value,
  interactive = false,
  onChange,
  size = 16,
}: {
  value: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || value) : value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            cursor: interactive ? "pointer" : "default",
            padding: 0,
            background: "none",
            border: "none",
          }}
        >
          <Star
            style={{ width: size, height: size }}
            fill={i <= display ? "#f97316" : "none"}
            stroke={i <= display ? "#f97316" : "var(--border)"}
          />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Review form
// ─────────────────────────────────────────────────────────────────────────────
function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  if (!user) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--fg-sub)" }}>
          Чтобы оставить отзыв, войдите в аккаунт
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-bold text-white"
          style={{ background: "var(--brand)" }}
        >
          Войти
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ошибка"); return; }
      setSuccess(true);
      setComment("");
      onSubmitted();
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "#e8fdf0", border: "1.5px solid #22c55e40" }}
      >
        <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
          Спасибо за отзыв!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold mb-2" style={{ color: "var(--fg-muted)" }}>
          ВАША ОЦЕНКА
        </p>
        <StarRow value={rating} interactive onChange={setRating} size={24} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Напишите ваш отзыв (необязательно)..."
        rows={3}
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
        style={{
          background: "var(--bg-section)",
          border: "1.5px solid var(--border)",
          color: "var(--fg)",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
      />
      {error && (
        <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: "var(--brand)" }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
        {loading ? "Отправка..." : "Отправить отзыв"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function DishPage() {
  const { slug } = useParams<{ slug: string }>();
  const router   = useRouter();
  const { addToCart, openDrawer } = useCart();

  const [product, setProduct]   = useState<ProductDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");
  const [qty,     setQty]       = useState(1);
  const [added,   setAdded]     = useState(false);
  const [imgSrc,  setImgSrc]    = useState<string>(FALLBACK);
  const [activeImg, setActiveImg] = useState(0);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/products/slug/${slug}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ошибка загрузки"); return; }
      setProduct(data.product);
      setImgSrc(data.product.mainImage ?? FALLBACK);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function handleAddToCart() {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id:       product.id,
        name:     product.name,
        price:    product.price,
        imageUrl: product.mainImage ?? undefined,
        accent:   "#f97316",
      });
    }
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 2000);
  }

  // ── Loading ──
  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--brand)" }} />
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Загружаем блюдо...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Error / 404 ──
  if (error || !product) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
          <div className="text-center flex flex-col items-center gap-4">
            <AlertTriangle className="w-12 h-12" style={{ color: "var(--fg-muted)" }} />
            <p className="text-lg font-bold" style={{ color: "var(--fg)" }}>
              {error || "Блюдо не найдено"}
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="h-10 px-6 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--brand)" }}
            >
              Назад к меню
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const allImages = product.images.length > 0
    ? product.images
    : [{ id: "fb", url: FALLBACK, isMain: true, altText: product.name }];

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>

        {/* ── Breadcrumbs ── */}
        <div
          className="border-b"
          style={{ background: "var(--bg-section)", borderColor: "var(--border)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-1.5 text-xs flex-wrap" aria-label="Хлебные крошки">
              {[
                { label: "Главная",                href: "/"                             },
                { label: "Меню",                   href: "/menu"                         },
                { label: product.category.name,    href: `/menu?category=${product.category.slug}` },
                { label: product.name,             href: null                            },
              ].map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: "var(--fg-muted)" }} />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors"
                      style={{ color: "var(--fg-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold" style={{ color: "var(--fg)" }}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* ── Back link ── */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к меню
          </button>

          {/* ── Product grid ── */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">

            {/* ── LEFT: images ── */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  aspectRatio: "1 / 1",
                  background: "#f5f3ef",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={allImages[activeImg]?.url ?? imgSrc}
                  alt={product.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", display: "block",
                    transition: "opacity 0.3s ease",
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                />
                {/* Unavailable overlay */}
                {!product.isAvailable && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
                  >
                    <span
                      className="px-4 py-2 rounded-xl text-white font-bold text-sm"
                      style={{ background: "#ef4444" }}
                    >
                      Нет в наличии
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className="shrink-0 rounded-2xl overflow-hidden transition-all"
                      style={{
                        width: 72, height: 72,
                        border: `2px solid ${i === activeImg ? "var(--brand)" : "var(--border)"}`,
                        opacity: i === activeImg ? 1 : 0.6,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.altText ?? product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: info ── */}
            <div className="flex flex-col gap-6">

              {/* Category + tags */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "var(--brand-light)", color: "var(--brand)" }}
                >
                  {product.category.name}
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${tag.color ?? "#f97316"}18`,
                      color:      tag.color ?? "var(--brand)",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <div>
                <h1
                  className="font-black leading-tight mb-2"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "var(--fg)" }}
                >
                  {product.name}
                </h1>

                {/* Rating */}
                {product.avgRating !== null && (
                  <div className="flex items-center gap-2">
                    <StarRow value={Math.round(product.avgRating)} size={16} />
                    <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>
                      {product.avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                      ({product.reviewCount} {product.reviewCount === 1 ? "отзыв" : product.reviewCount < 5 ? "отзыва" : "отзывов"})
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className="font-black"
                  style={{ fontSize: "2rem", color: "var(--fg)", lineHeight: 1 }}
                >
                  {product.price.toLocaleString()} сом
                </span>
                {product.discountPrice && (
                  <span
                    className="text-base line-through"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {product.discountPrice.toLocaleString()} сом
                  </span>
                )}
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-3">
                {product.weight && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "var(--bg-section)", color: "var(--fg-sub)" }}
                  >
                    <Weight className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
                    {product.weight} г
                  </div>
                )}
                {product.piecesCount && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "var(--bg-section)", color: "var(--fg-sub)" }}
                  >
                    <Package className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
                    {product.piecesCount} шт
                  </div>
                )}
                {product.cookingTimeMin && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "var(--bg-section)", color: "var(--fg-sub)" }}
                  >
                    <Clock className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
                    {product.cookingTimeMin} мин
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: product.isAvailable ? "#e8fdf0" : "#fff0f0",
                    color:      product.isAvailable ? "#22c55e" : "#ef4444",
                  }}
                >
                  {product.isAvailable ? "В наличии" : "Нет в наличии"}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                  {product.description}
                </p>
              )}

              {/* Ingredients */}
              {product.ingredients && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
                      Состав
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Quantity + Add to cart */}
              {product.isAvailable && (
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Qty stepper */}
                  <div
                    className="flex items-center gap-1 rounded-2xl p-1"
                    style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ color: qty <= 1 ? "var(--fg-muted)" : "var(--fg)" }}
                      onMouseEnter={(e) => { if (qty > 1) (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="w-8 text-center font-black text-sm"
                      style={{ color: "var(--fg)" }}
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => q + 1)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ color: "var(--fg)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: added ? "#22c55e" : "var(--brand)",
                      boxShadow:  added ? "0 4px 16px #22c55e44" : "0 4px 16px rgba(249,115,22,0.35)",
                      minWidth: 180,
                    }}
                    onMouseEnter={(e) => { if (!added) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = added ? "#22c55e" : "var(--brand)"; }}
                  >
                    {added ? (
                      <>✓ Добавлено в корзину</>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        В корзину · {(product.price * qty).toLocaleString()} сом
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Reviews ── */}
          <section className="mt-14">
            <div
              className="pt-10"
              style={{ borderTop: "1.5px solid var(--border)" }}
            >
              <h2 className="text-xl font-black mb-2" style={{ color: "var(--fg)" }}>
                Отзывы
              </h2>
              {product.avgRating !== null && (
                <div className="flex items-center gap-3 mb-8">
                  <span
                    className="text-4xl font-black"
                    style={{ color: "var(--fg)" }}
                  >
                    {product.avgRating.toFixed(1)}
                  </span>
                  <div className="flex flex-col gap-1">
                    <StarRow value={Math.round(product.avgRating)} size={20} />
                    <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                      {product.reviewCount} {product.reviewCount === 1 ? "отзыв" : product.reviewCount < 5 ? "отзыва" : "отзывов"}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <h3 className="text-base font-bold mb-4" style={{ color: "var(--fg)" }}>
                    Оставить отзыв
                  </h3>
                  <ReviewForm productId={product.id} onSubmitted={load} />
                </div>

                {/* List */}
                <div className="flex flex-col gap-4">
                  {product.reviews.length === 0 ? (
                    <div
                      className="rounded-2xl p-6 text-center"
                      style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
                    >
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: "var(--fg-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                        Пока нет отзывов. Будьте первым!
                      </p>
                    </div>
                  ) : (
                    product.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl p-4"
                        style={{
                          background: "var(--bg-card)",
                          border: "1.5px solid var(--border)",
                          boxShadow: "var(--card-shadow)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                              style={{ background: "var(--brand)" }}
                            >
                              {r.user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>
                                {r.user.name}
                              </p>
                              <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
                                {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                                  day: "numeric", month: "long", year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <StarRow value={r.rating} size={14} />
                        </div>
                        {r.comment && (
                          <p className="text-sm leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
