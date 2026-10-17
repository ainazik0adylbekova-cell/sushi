"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ChevronLeft, CheckCircle, User } from "lucide-react";
import { useCart } from "../../providers/CartProvider";
import { useLang } from "../../providers/LanguageProvider";
import { useAuth } from "../../providers/AuthProvider";
import FinikPayButton from "../FinikPayButton";

// ─────────────────────────────────────────
// Order form state
// ─────────────────────────────────────────
interface FormValues {
  name: string;
  phone: string;
  address: string;
  comment: string;
}
interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

const EMPTY_FORM: FormValues = { name: "", phone: "", address: "", comment: "" };

// Very basic phone check: digits, spaces, +, -, (, ) — at least 7 digits
function isValidPhone(v: string) {
  return /^[\d\s\+\-\(\)]{7,}$/.test(v.trim());
}

// ─────────────────────────────────────────
// CartDrawer
// ─────────────────────────────────────────
export default function CartDrawer() {
  const { lines, totalQty, totalPrice, drawerOpen, closeDrawer, increment, decrement, removeFromCart, clearCart } = useCart();
  const { t } = useLang();
  const { user } = useAuth();

  const [view, setView]             = useState<"cart" | "auth" | "form" | "payment" | "success">("cart");
  const [form, setForm]             = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId]       = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Reset to cart view when drawer closes
  useEffect(() => {
    if (!drawerOpen) {
      const timer = setTimeout(() => {
        setView("cart");
        setForm(EMPTY_FORM);
        setErrors({});
        setOrderId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Focus first element when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => firstFocusRef.current?.focus(), 100);
    }
  }, [drawerOpen]);

  // ── Form helpers ──
  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())    e.name    = t.cartErrName;
    if (!form.phone.trim())   e.phone   = t.cartErrPhoneRequired;
    else if (!isValidPhone(form.phone)) e.phone = t.cartErrPhoneFormat;
    if (!form.address.trim()) e.address = t.cartErrAddress;
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    
    try {
      // Создаём заказ (здесь можно вызвать ваш API для создания заказа в БД)
      // Временно генерируем ID заказа
      const newOrderId = crypto.randomUUID();
      setOrderId(newOrderId);
      
      // Переходим к экрану оплаты
      setSubmitting(false);
      setView("payment");
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      setSubmitting(false);
      // Здесь можно показать ошибку пользователю
    }
  }

  function scrollToMenu() {
    closeDrawer();
    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  // ── Render ──
  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[60] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          backdropFilter: "blur(2px)",
        }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cartTitle}
        className="fixed top-0 right-0 bottom-0 z-[61] flex flex-col w-full sm:w-[420px] transition-transform duration-300"
        style={{
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* ── Cart view ── */}
        {view === "cart" && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" style={{ color: "var(--brand)" }} />
                <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>
                  {t.cartTitle}
                </h2>
                {totalQty > 0 && (
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: "var(--brand)" }}
                  >
                    {totalQty}
                  </span>
                )}
              </div>
              <button
                ref={firstFocusRef}
                onClick={closeDrawer}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-label={t.cartClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-16">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-section)" }}
                  >
                    <ShoppingBag className="w-9 h-9" style={{ color: "var(--fg-muted)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-base mb-1.5" style={{ color: "var(--fg)" }}>
                      {t.cartEmpty}
                    </p>
                    <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                      {t.cartEmptyHint}
                    </p>
                  </div>
                  <button
                    onClick={scrollToMenu}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-bold transition-colors"
                    style={{ background: "var(--brand)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                  >
                    {t.cartGoToMenu}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Line items */
                <ul className="flex flex-col gap-3">
                  {lines.map(({ item, qty }) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
                    >
                      {/* Color swatch / image placeholder */}
                      <div
                        className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: item.accent ? `${item.accent}18` : "var(--border)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ background: item.accent ?? "var(--brand)" }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>
                          {item.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                          {item.price} сом × {qty}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--fg-sub)" }}
                          aria-label={`${t.cartDec} ${item.name}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="w-7 text-center text-sm font-black"
                          style={{ color: "var(--fg)" }}
                        >
                          {qty}
                        </span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: "var(--brand)", color: "#fff" }}
                          aria-label={`${t.cartInc} ${item.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                        style={{ color: "var(--fg-muted)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "#ef444415"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        aria-label={`${t.cartRemove} ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div
                className="px-5 py-4 shrink-0 flex flex-col gap-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--fg-sub)" }}>
                    {t.cartTotal}
                  </span>
                  <span className="font-black text-lg" style={{ color: "var(--fg)" }}>
                    {totalPrice} сом
                  </span>
                </div>
                <button
                  onClick={() => user ? setView("form") : setView("auth")}
                  className="flex items-center justify-center gap-2 h-12 rounded-xl text-white font-black text-sm transition-colors"
                  style={{ background: "var(--brand)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                >
                  {t.cartCheckout}
                  <ArrowRight className="w-4 h-4" />
                </button>              </div>
            )}
          </>
        )}

        {/* ── Auth required view ── */}
        {view === "auth" && (
          <>
            <div
              className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setView("cart")}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Назад"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>Оформление заказа</h2>
              <button onClick={closeDrawer} className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg" style={{ color: "var(--fg-muted)" }} aria-label="Закрыть">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--brand-light)" }}>
                <User className="w-9 h-9" style={{ color: "var(--brand)" }} />
              </div>
              <div>
                <p className="font-black text-lg mb-2" style={{ color: "var(--fg)" }}>Войдите в аккаунт</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  Чтобы оформить заказ, необходимо войти или зарегистрироваться
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full">
                <Link
                  href="/login"
                  onClick={closeDrawer}
                  className="flex items-center justify-center h-11 rounded-xl text-white font-black text-sm transition-colors"
                  style={{ background: "var(--brand)" }}
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  onClick={closeDrawer}
                  className="flex items-center justify-center h-11 rounded-xl font-bold text-sm transition-colors"
                  style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
                >
                  Зарегистрироваться
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── Order form view ── */}
        {view === "form" && (
          <>
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                ref={firstFocusRef}
                onClick={() => setView("cart")}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-label={t.cartBack}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>
                {t.cartOrderTitle}
              </h2>
              <button
                onClick={closeDrawer}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-label={t.cartClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form + order summary */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Order summary */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>
                  {t.cartOrderSummary}
                </p>
                <ul className="flex flex-col gap-2">
                  {lines.map(({ item, qty }) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span style={{ color: "var(--fg-sub)" }}>{item.name} × {qty}</span>
                      <span className="font-bold" style={{ color: "var(--fg)" }}>{item.price * qty} сом</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="flex justify-between mt-3 pt-3 text-sm font-black"
                  style={{ borderTop: "1px solid var(--border)", color: "var(--fg)" }}
                >
                  <span>{t.cartTotal}</span>
                  <span>{totalPrice} сом</span>
                </div>
              </div>

              {/* Form */}
              <form id="order-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                    {t.cartFieldName} <span style={{ color: "var(--brand)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder={t.cartFieldNamePlaceholder}
                    className="h-10 px-3.5 rounded-xl text-sm outline-none transition-colors w-full"
                    style={{
                      background: "var(--bg-section)",
                      border: `1.5px solid ${errors.name ? "#ef4444" : "var(--border)"}`,
                      color: "var(--fg)",
                    }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "var(--brand)"; }}
                    onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  {errors.name && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                    {t.cartFieldPhone} <span style={{ color: "var(--brand)" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setErrors((er) => ({ ...er, phone: undefined })); }}
                    placeholder={t.cartFieldPhonePlaceholder}
                    className="h-10 px-3.5 rounded-xl text-sm outline-none transition-colors w-full"
                    style={{
                      background: "var(--bg-section)",
                      border: `1.5px solid ${errors.phone ? "#ef4444" : "var(--border)"}`,
                      color: "var(--fg)",
                    }}
                    onFocus={(e) => { if (!errors.phone) e.currentTarget.style.borderColor = "var(--brand)"; }}
                    onBlur={(e) => { if (!errors.phone) e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  {errors.phone && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                    {t.cartFieldAddress} <span style={{ color: "var(--brand)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => { setForm((f) => ({ ...f, address: e.target.value })); setErrors((er) => ({ ...er, address: undefined })); }}
                    placeholder={t.cartFieldAddressPlaceholder}
                    className="h-10 px-3.5 rounded-xl text-sm outline-none transition-colors w-full"
                    style={{
                      background: "var(--bg-section)",
                      border: `1.5px solid ${errors.address ? "#ef4444" : "var(--border)"}`,
                      color: "var(--fg)",
                    }}
                    onFocus={(e) => { if (!errors.address) e.currentTarget.style.borderColor = "var(--brand)"; }}
                    onBlur={(e) => { if (!errors.address) e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  {errors.address && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>{errors.address}</p>
                  )}
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold" style={{ color: "var(--fg-sub)" }}>
                    {t.cartFieldComment}
                  </label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder={t.cartFieldCommentPlaceholder}
                    rows={3}
                    className="px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none w-full"
                    style={{
                      background: "var(--bg-section)",
                      border: "1.5px solid var(--border)",
                      color: "var(--fg)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                </div>
              </form>
            </div>

            {/* Submit button — always visible at bottom */}
            <div
              className="px-5 py-4 shrink-0"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                type="submit"
                form="order-form"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-white font-black text-sm transition-colors disabled:opacity-60"
                style={{ background: "var(--brand)" }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
              >
                {submitting ? t.cartSubmitting : t.cartSubmit}
              </button>
            </div>
          </>
        )}

        {/* ── Success view ── */}
        {view === "success" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#22c55e18" }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: "#22c55e" }} />
            </div>
            <div>
              <p className="font-black text-xl mb-2" style={{ color: "var(--fg)" }}>
                {t.cartSuccessTitle}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {t.cartSuccessDesc}
              </p>
            </div>
          </div>
        )}

        {/* ── Payment view ── */}
        {view === "payment" && orderId && (
          <>
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setView("form")}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Назад"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-black text-base" style={{ color: "var(--fg)" }}>Оплата заказа</h2>
              <button
                onClick={closeDrawer}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {/* Order summary */}
              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>
                  Ваш заказ
                </p>
                <ul className="flex flex-col gap-2">
                  {lines.map(({ item, qty }) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span style={{ color: "var(--fg-sub)" }}>{item.name} × {qty}</span>
                      <span className="font-bold" style={{ color: "var(--fg)" }}>{item.price * qty} сом</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="flex justify-between mt-3 pt-3 text-sm font-black"
                  style={{ borderTop: "1px solid var(--border)", color: "var(--fg)" }}
                >
                  <span>Итого</span>
                  <span>{totalPrice} сом</span>
                </div>
              </div>

              {/* Delivery info */}
              <div
                className="rounded-xl p-4 mb-6"
                style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>
                  Данные доставки
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <div>
                    <span style={{ color: "var(--fg-muted)" }}>Имя: </span>
                    <span className="font-semibold" style={{ color: "var(--fg)" }}>{form.name}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--fg-muted)" }}>Телефон: </span>
                    <span className="font-semibold" style={{ color: "var(--fg)" }}>{form.phone}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--fg-muted)" }}>Адрес: </span>
                    <span className="font-semibold" style={{ color: "var(--fg)" }}>{form.address}</span>
                  </div>
                  {form.comment && (
                    <div>
                      <span style={{ color: "var(--fg-muted)" }}>Комментарий: </span>
                      <span className="font-semibold" style={{ color: "var(--fg)" }}>{form.comment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment info */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: "var(--brand-light)", border: "1px solid var(--brand)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--brand)" }}>
                  💳 Фиксированная цена
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                  Оплата через Finik Pay составляет всего <strong>5 сом</strong> независимо от суммы заказа
                </p>
              </div>

              {/* Payment button */}
              <FinikPayButton
                orderId={orderId}
                orderDescription={`Заказ суши (${totalQty} поз.)`}
                fullWidth
                onSuccess={() => {
                  clearCart();
                  setView("success");
                  setTimeout(() => closeDrawer(), 3000);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
