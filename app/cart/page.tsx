"use client";

import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { useCart } from "../providers/CartProvider";

// Note: metadata export won't work in "use client" components.
// SEO for /cart is handled via generateMetadata pattern or a server wrapper.
// We keep this simple as a client page.

export default function CartPage() {
  const { lines, totalQty, totalPrice, increment, decrement, removeFromCart, clearCart, openDrawer } = useCart();

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="flex items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-black" style={{ color: "var(--fg)" }}>
              Корзина
              {totalQty > 0 && (
                <span
                  className="ml-3 text-base font-black px-2.5 py-0.5 rounded-full text-white align-middle"
                  style={{ background: "var(--brand)" }}
                >
                  {totalQty}
                </span>
              )}
            </h1>
            {lines.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm font-semibold transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
              >
                Очистить
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "var(--bg-section)" }}
              >
                <ShoppingBag className="w-10 h-10" style={{ color: "var(--fg-muted)" }} />
              </div>
              <div>
                <p className="font-bold text-xl mb-2" style={{ color: "var(--fg)" }}>Корзина пуста</p>
                <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                  Добавьте блюда из меню, чтобы оформить заказ
                </p>
              </div>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-white text-sm font-bold transition-colors"
                style={{ background: "var(--brand)" }}
              >
                Перейти в меню
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Items */}
              <ul className="flex flex-col gap-3">
                {lines.map(({ item, qty }) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
                  >
                    {/* Swatch */}
                    <div
                      className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
                      style={{ background: item.accent ? `${item.accent}18` : "var(--border)" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full"
                        style={{ background: item.accent ?? "var(--brand)" }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "var(--fg)" }}>{item.name}</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>
                        {item.price} сом × {qty} = <strong style={{ color: "var(--fg)" }}>{item.price * qty} сом</strong>
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => decrement(item.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--fg-sub)" }}
                        aria-label="Уменьшить"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-black text-sm" style={{ color: "var(--fg)" }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => increment(item.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "var(--brand)", color: "#fff" }}
                        aria-label="Увеличить"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0"
                      style={{ color: "var(--fg-muted)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "#ef444415"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Summary */}
              <div
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--fg-sub)" }}>
                    Итого ({totalQty} поз.)
                  </span>
                  <span className="font-black text-xl" style={{ color: "var(--fg)" }}>
                    {totalPrice} сом
                  </span>
                </div>
                <button
                  onClick={openDrawer}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl text-white font-black text-sm transition-colors"
                  style={{ background: "var(--brand)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                >
                  Оформить заказ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
