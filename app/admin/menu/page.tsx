"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Search, X, Check,
  UtensilsCrossed, ImagePlus, Loader2, RefreshCw, AlertTriangle,
} from "lucide-react";

// ── Реальная структура БД (String/UUID IDs) ─────────────────
interface Category {
  id:   string;
  name: string;
  slug: string;
}

interface Product {
  id:          string;
  name:        string;
  description: string | null;
  price:       number;          // Decimal приходит как number через JSON
  weight:      string | null;   // String в реальной схеме
  imageUrl:    string | null;   // прямо на продукте
  isAvailable: boolean;
  category:    Category;
}

// Цвета категорий
const CAT_COLOR: Record<string, string> = {
  rolls: "#ef4444", sushi: "#f97316", sets: "#f59e0b",
  hot: "#22c55e", drinks: "#38bdf8", noodles: "#a78bfa", snacks: "#a78bfa",
};

// ── API ────────────────────────────────────────────────────────────────────
async function apiGetCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  const d   = await res.json();
  return d.categories ?? [];
}

async function apiGetProducts(q = ""): Promise<Product[]> {
  const url = q ? `/api/products?q=${encodeURIComponent(q)}` : "/api/products";
  const res = await fetch(url, { cache: "no-store" });
  const d   = await res.json();
  return d.products ?? [];
}

async function apiCreate(body: object): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error ?? "Ошибка создания");
  return d.product;
}

async function apiUpdate(id: string, body: object): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error ?? "Ошибка обновления");
  return d.product;
}

async function apiDelete(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Ошибка удаления"); }
}

// ── Загрузчик файла ────────────────────────────────────────────────────────
function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = () => rej(new Error("Ошибка чтения"));
    r.readAsDataURL(file);
  });
}

// ── ImageField ─────────────────────────────────────────────────────────────
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(value.startsWith("http") ? value : "");
  const [tab, setTab] = useState<"file" | "url">("file");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Максимум 5 МБ"); return; }
    setBusy(true);
    try { onChange(await readFile(f)); } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-full rounded-xl overflow-hidden group" style={{ height: 160, background: "#f5f3ef", border: "1.5px solid var(--border)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Превью" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
            <button type="button" onClick={() => { onChange(""); setUrl(""); }} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold text-white" style={{ background: "#ef4444" }}>
              <X className="w-3.5 h-3.5" /> Удалить
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer"
          style={{ height: 100, background: "var(--bg-section)", border: "2px dashed var(--border)" }}
          onClick={() => { setTab("file"); ref.current?.click(); }}>
          <ImagePlus className="w-6 h-6" style={{ color: "var(--brand)" }} />
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Нажмите чтобы загрузить</p>
        </div>
      )}

      <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
        {(["file", "url"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="flex-1 h-8 text-xs font-bold"
            style={{ background: tab === t ? "var(--brand)" : "transparent", color: tab === t ? "#fff" : "var(--fg-muted)" }}>
            {t === "file" ? "Файл" : "Ссылка"}
          </button>
        ))}
      </div>

      {tab === "url" ? (
        <div className="flex gap-2">
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
            className="flex-1 h-9 px-3 rounded-xl text-xs outline-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (url.startsWith("http")) onChange(url); } }} />
          <button type="button" onClick={() => { if (url.startsWith("http")) onChange(url); else alert("Введите корректный URL"); }}
            className="h-9 px-3 rounded-xl text-xs font-bold text-white" style={{ background: "var(--brand)" }}>Ок</button>
        </div>
      ) : (
        <>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button type="button" onClick={() => ref.current?.click()} disabled={busy}
            className="w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}>
            {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Загрузка...</> : <><ImagePlus className="w-3.5 h-3.5" />Выбрать файл</>}
          </button>
        </>
      )}
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl" style={{ background: "var(--bg-section)" }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{sub}</p>}
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full transition-all shrink-0 relative" style={{ background: value ? "#22c55e" : "var(--border)" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: value ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

// ── DishModal ──────────────────────────────────────────────────────────────
function DishModal({ item, categories, onClose, onSaved }: {
  item: Partial<Product> | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    name:        item?.name        ?? "",
    categoryId:  item?.category?.id ?? (categories[0]?.id ?? ""),
    price:       item?.price       ?? "",
    description: item?.description ?? "",
    weight:      item?.weight      ?? "",
    imageUrl:    item?.imageUrl    ?? "",
    isAvailable: item?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Устанавливаем первую категорию если список загрузился после открытия
  useEffect(() => {
    if (!form.categoryId && categories.length > 0) {
      setForm(f => ({ ...f, categoryId: categories[0].id }));
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())              { setError("Введите название");  return; }
    if (!form.categoryId)               { setError("Выберите категорию"); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Укажите цену"); return; }

    setSaving(true); setError("");
    try {
      const payload = {
        name:        form.name.trim(),
        categoryId:  form.categoryId,
        price:       Number(form.price),
        description: form.description.trim() || null,
        weight:      form.weight.trim() || null,
        imageUrl:    form.imageUrl || null,
        isAvailable: form.isAvailable,
      };
      const saved = isNew
        ? await apiCreate(payload)
        : await apiUpdate(item!.id!, payload);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function inp(label: string, key: keyof typeof form, type = "text", placeholder = "", required = false) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
          {label}{required && <span style={{ color: "var(--brand)" }}> *</span>}
        </label>
        <input type={type} value={String(form[key])}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="h-10 px-3 rounded-xl text-sm outline-none"
          style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--brand)"; }}
          onBlur={e  => { e.currentTarget.style.borderColor = "var(--border)"; }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full animate-scale-in flex flex-col" style={{
        maxWidth: 700, maxHeight: "90dvh",
        background: "var(--bg-card)", border: "1.5px solid var(--border)",
        borderRadius: 24, boxShadow: "0 32px 80px rgba(0,0,0,0.35)", overflow: "hidden",
      }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-section)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)" }}>
              {isNew ? <Plus className="w-5 h-5 text-white" /> : <Pencil className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="font-black text-base" style={{ color: "var(--fg)" }}>
                {isNew ? "Добавить блюдо" : "Редактировать"}
              </p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                {isNew ? "Заполните поля и нажмите «Добавить»" : item?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

            {/* LEFT */}
            <div className="flex flex-col gap-4">
              {/* Photo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>Фото</label>
                <ImageField value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
                  Категория <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                {categories.length === 0 ? (
                  <p className="text-xs py-2" style={{ color: "var(--fg-muted)" }}>
                    Загрузка категорий...
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {categories.map(c => {
                      const active = form.categoryId === c.id;
                      const color  = CAT_COLOR[c.slug] ?? "#f97316";
                      return (
                        <button key={c.id} type="button"
                          onClick={() => setForm(f => ({ ...f, categoryId: c.id }))}
                          className="flex items-center gap-3 h-10 px-4 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: active ? color : "var(--bg-section)",
                            color:      active ? "#fff" : "var(--fg-sub)",
                            border:     `1.5px solid ${active ? color : "var(--border)"}`,
                            boxShadow:  active ? `0 3px 10px ${color}40` : "none",
                          }}>
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: active ? "rgba(255,255,255,0.6)" : color }} />
                          {c.name}
                          {active && <Check className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
              {inp("Название блюда", "name", "text", "Ролл Филадельфия", true)}

              <div className="grid grid-cols-2 gap-3">
                {inp("Цена (сом)", "price", "number", "490", true)}
                {inp("Вес / объём", "weight", "text", "260 г")}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>Описание</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Нежный ролл с лососем..." rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "var(--border)"; }} />
              </div>

              <Toggle label="В наличии" sub="Доступен для заказа"
                value={form.isAvailable} onChange={v => setForm(f => ({ ...f, isAvailable: v }))} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 shrink-0" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-section)" }}>
          <button type="button" onClick={onClose}
            className="h-11 px-5 rounded-xl text-sm font-bold"
            style={{ background: "var(--bg-card)", color: "var(--fg-sub)", border: "1.5px solid var(--border)" }}>
            Отмена
          </button>
          <button type="button" disabled={saving} onClick={submit}
            className="flex-1 h-11 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--brand)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Сохранение...</> : <><Check className="w-4 h-4" />{isNew ? "Добавить блюдо" : "Сохранить"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DeleteConfirm ──────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel, busy }: {
  name: string; onConfirm: () => void; onCancel: () => void; busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#fff0f0" }}>
          <Trash2 className="w-6 h-6" style={{ color: "#ef4444" }} />
        </div>
        <h3 className="font-black text-base mb-1" style={{ color: "var(--fg)" }}>Удалить блюдо?</h3>
        <p className="text-sm mb-5" style={{ color: "var(--fg-muted)" }}>«{name}» будет удалено без возможности восстановления.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 h-10 rounded-xl text-sm font-bold"
            style={{ background: "var(--bg-section)", color: "var(--fg-sub)", border: "1.5px solid var(--border)" }}>
            Отмена
          </button>
          <button onClick={onConfirm} disabled={busy}
            className="flex-1 h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#ef4444" }}>
            {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />...</> : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProductRow ─────────────────────────────────────────────────────────────
function ProductRow({ p, onEdit, onDelete, onToggle }: {
  p: Product; onEdit: () => void; onDelete: () => void; onToggle: () => void;
}) {
  return (
    <tr className="transition-colors"
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: "#f5f3ef", border: "1px solid var(--border)" }}>
            {p.imageUrl
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              : <div className="w-full h-full flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 opacity-30" style={{ color: "var(--fg-muted)" }} /></div>}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--fg)" }}>{p.name}</p>
            {p.description && <p className="text-[11px] truncate max-w-[160px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{p.description}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
          {p.category.name}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "var(--fg-muted)" }}>
        {p.weight ?? "—"}
      </td>
      <td className="px-4 py-3">
        <span className="font-black text-sm" style={{ color: "var(--fg)" }}>
          {parseFloat(String(p.price)).toLocaleString()} сом
        </span>
      </td>
      <td className="px-4 py-3">
        <button onClick={onToggle}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: p.isAvailable ? "#e8fdf0" : "#fff0f0", color: p.isAvailable ? "#22c55e" : "#ef4444" }}>
          {p.isAvailable ? "В наличии" : "Нет"}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button onClick={onEdit} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState<string | "all">("all");
  const [modal,      setModal]      = useState<Partial<Product> | null | false>(false);
  const [delTarget,  setDelTarget]  = useState<Product | null>(null);
  const [delBusy,    setDelBusy]    = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [cats, prods] = await Promise.all([apiGetCategories(), apiGetProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => products.filter(p => {
    const matchCat = catFilter === "all" || p.category.id === catFilter;
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    return matchCat && matchQ;
  }), [products, catFilter, search]);

  async function handleSaved(saved: Product) {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
    setModal(false);
    showToast(modal && (modal as Product).id ? "Изменения сохранены" : "Блюдо добавлено");
  }

  async function handleDelete() {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await apiDelete(delTarget.id);
      setProducts(prev => prev.filter(p => p.id !== delTarget.id));
      showToast("Блюдо удалено");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Ошибка", false);
    } finally {
      setDelBusy(false);
      setDelTarget(null);
    }
  }

  async function toggleAvail(p: Product) {
    try {
      const updated = await apiUpdate(p.id, { isAvailable: !p.isAvailable });
      setProducts(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch { showToast("Не удалось изменить наличие", false); }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Меню</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>
            {loading ? "Загрузка..." : `${products.length} позиций`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: "var(--fg-muted)", border: "1.5px solid var(--border)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setModal({})}
            className="flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black text-white transition-all"
            style={{ background: "var(--brand)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
            <Plus className="w-5 h-5" /> Добавить блюдо
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "#ef4444" }} />
          <p className="text-sm flex-1" style={{ color: "#ef4444" }}>{error}</p>
          <button onClick={load} className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold text-white" style={{ background: "#ef4444" }}>
            <RefreshCw className="w-3 h-3" /> Повторить
          </button>
        </div>
      )}

      {/* Category filter */}
      {!loading && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter("all")}
            className="h-8 px-3 rounded-xl text-xs font-bold transition-all"
            style={{ background: catFilter === "all" ? "var(--brand)" : "var(--bg-card)", color: catFilter === "all" ? "#fff" : "var(--fg-muted)", border: `1.5px solid ${catFilter === "all" ? "var(--brand)" : "var(--border)"}` }}>
            Все ({products.length})
          </button>
          {categories.map(c => {
            const active = catFilter === c.id;
            const color  = CAT_COLOR[c.slug] ?? "#f97316";
            const cnt    = products.filter(p => p.category.id === c.id).length;
            return (
              <button key={c.id} onClick={() => setCatFilter(c.id)}
                className="h-8 px-3 rounded-xl text-xs font-bold transition-all"
                style={{ background: active ? color : "var(--bg-card)", color: active ? "#fff" : "var(--fg-muted)", border: `1.5px solid ${active ? color : "var(--border)"}` }}>
                {c.name} ({cnt})
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск блюда..."
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Блюдо", "Категория", "Вес", "Цена", "Наличие", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "var(--brand)" }} />
                  <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Загрузка...</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center">
                  <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--fg-muted)" }} />
                  <p className="text-sm mb-3" style={{ color: "var(--fg-muted)" }}>
                    {search ? "Ничего не найдено" : "Меню пустое — добавьте первое блюдо"}
                  </p>
                  {!search && (
                    <button onClick={() => setModal({})} className="h-9 px-5 rounded-xl text-xs font-bold text-white" style={{ background: "var(--brand)" }}>
                      Добавить блюдо
                    </button>
                  )}
                </td></tr>
              ) : filtered.map(p => (
                <ProductRow key={p.id} p={p}
                  onEdit={() => setModal(p)}
                  onDelete={() => setDelTarget(p)}
                  onToggle={() => toggleAvail(p)} />
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Показано {filtered.length} из {products.length}</p>
          </div>
        )}
      </div>

      {modal !== false && (
        <DishModal item={modal} categories={categories} onClose={() => setModal(false)} onSaved={handleSaved} />
      )}
      {delTarget && (
        <DeleteConfirm name={delTarget.name} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} busy={delBusy} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold animate-slide-up"
          style={{ background: toast.ok ? "#22c55e" : "#ef4444", color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", maxWidth: 320 }}>
          {toast.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
