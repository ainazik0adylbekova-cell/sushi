"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Megaphone } from "lucide-react";

interface Promo {
  id: number;
  title: string;
  description: string;
  discount: string;
  code?: string;
  type: "percent" | "fixed" | "gift" | "free_delivery";
  active: boolean;
  from: string;
  to: string;
  emoji: string;
}

const INITIAL_PROMOS: Promo[] = [
  { id: 1, title: "Скидка 15% на первый заказ", description: "Для новых пользователей при первом заказе", discount: "15%",      code: "FIRST15",  type: "percent",      active: true,  from: "01.09.2026", to: "30.09.2026", emoji: "🎉" },
  { id: 2, title: "Бесплатная доставка",         description: "При заказе от 1000 сом",                  discount: "0 сом",     code: "FREEDEL",  type: "free_delivery", active: true,  from: "01.09.2026", to: "30.09.2026", emoji: "🛵" },
  { id: 3, title: "Сет в подарок",               description: "При заказе от 3000 сом — сет Старт в подарок", discount: "Сет",   code: undefined,  type: "gift",          active: false, from: "15.08.2026", to: "15.09.2026", emoji: "🎁" },
  { id: 4, title: "Happy Hour",                  description: "Скидка 20% каждый будний день с 14:00 до 17:00", discount: "20%", code: "HAPPY",    type: "percent",       active: true,  from: "01.09.2026", to: "31.12.2026", emoji: "⏰" },
  { id: 5, title: "День рождения",               description: "Скидка 500 сом в день рождения",          discount: "500 сом",   code: "BDAY500",  type: "fixed",         active: false, from: "01.01.2026", to: "31.12.2026", emoji: "🎂" },
];

const TYPE_META: Record<Promo["type"], { label: string; color: string; bg: string }> = {
  percent:      { label: "Процент",  color: "#f97316", bg: "#fff4ec" },
  fixed:        { label: "Фиксир.", color: "#a78bfa", bg: "#f3f0ff" },
  gift:         { label: "Подарок",  color: "#22c55e", bg: "#e8fdf0" },
  free_delivery:{ label: "Доставка", color: "#38bdf8", bg: "#e0f5ff" },
};

function PromoModal({ item, onClose, onSave }: {
  item: Partial<Promo> | null;
  onClose: () => void;
  onSave: (data: Omit<Promo, "id">) => void;
}) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    title: item?.title ?? "", description: item?.description ?? "",
    discount: item?.discount ?? "", code: item?.code ?? "",
    type: item?.type ?? "percent" as Promo["type"],
    active: item?.active ?? true,
    from: item?.from ?? "", to: item?.to ?? "",
    emoji: item?.emoji ?? "🎉",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, code: form.code || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>{isNew ? "Новая акция" : "Редактировать акцию"}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-3">
          <div className="flex gap-3">
            <input type="text" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              className="w-14 h-10 rounded-xl text-center text-xl outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }} maxLength={2} />
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Название акции*" required className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          </div>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Описание условий..." rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          <div className="flex gap-3">
            <input type="text" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
              placeholder="Размер скидки" className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
            <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="Промокод (опц.)" className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          </div>
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(TYPE_META) as [Promo["type"], typeof TYPE_META[Promo["type"]]][]).map(([t, meta]) => (
              <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className="h-9 rounded-xl text-xs font-bold transition-all"
                style={{ background: form.type === t ? meta.color : meta.bg, color: form.type === t ? "#fff" : meta.color, border: `1.5px solid ${meta.color}40` }}>
                {meta.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-wide block mb-1" style={{ color: "var(--fg-muted)" }}>С</label>
              <input type="text" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                placeholder="01.09.2026" className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-wide block mb-1" style={{ color: "var(--fg-muted)" }}>По</label>
              <input type="text" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                placeholder="30.09.2026" className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
            </div>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: form.active ? "#e8fdf0" : "var(--bg-section)", color: form.active ? "#22c55e" : "var(--fg-muted)", border: `1.5px solid ${form.active ? "#22c55e40" : "var(--border)"}` }}>
            <span className="w-4 h-4 rounded flex items-center justify-center text-xs"
              style={{ background: form.active ? "#22c55e" : "var(--border)", color: "#fff" }}>
              {form.active ? "✓" : ""}
            </span>
            {form.active ? "Активна" : "Неактивна"}
          </button>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-bold"
              style={{ background: "var(--bg-section)", color: "var(--fg-sub)", border: "1.5px solid var(--border)" }}>Отмена</button>
            <button type="submit" className="flex-1 h-10 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--brand)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
              {isNew ? "Создать" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [modal, setModal]   = useState<Partial<Promo> | null | false>(false);

  function handleSave(data: Omit<Promo, "id">) {
    if (modal && "id" in modal && modal.id) {
      setPromos(prev => prev.map(p => p.id === modal.id ? { ...p, ...data } : p));
    } else {
      setPromos(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setModal(false);
  }

  function toggleActive(id: number) {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  const active = promos.filter(p => p.active).length;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Акции</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>{promos.length} акций · {active} активных</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "var(--brand)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
          <Plus className="w-4 h-4" /> Создать акцию
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map(promo => {
          const typeMeta = TYPE_META[promo.type];
          return (
            <div key={promo.id} className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "var(--bg-card)", border: `1.5px solid ${promo.active ? "var(--brand)" : "var(--border)"}`, opacity: promo.active ? 1 : 0.7 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: promo.active ? "var(--brand-light)" : "var(--bg-section)" }}>
                    {promo.emoji}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: "var(--fg)" }}>{promo.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{promo.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModal(promo)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setPromos(prev => prev.filter(p => p.id !== promo.id))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Discount badge */}
                <span className="text-sm font-black px-3 py-1 rounded-xl"
                  style={{ background: "var(--brand)", color: "#fff" }}>
                  {promo.discount}
                </span>
                {/* Type */}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: typeMeta.bg, color: typeMeta.color }}>
                  {typeMeta.label}
                </span>
                {/* Code */}
                {promo.code && (
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg font-mono tracking-wider"
                    style={{ background: "var(--bg-section)", color: "var(--fg-sub)", border: "1px dashed var(--border)" }}>
                    {promo.code}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
                  📅 {promo.from} — {promo.to}
                </span>
                <button onClick={() => toggleActive(promo.id)}
                  className="text-[11px] font-bold px-3 py-1 rounded-full transition-all"
                  style={{ background: promo.active ? "#e8fdf0" : "#fff0f0", color: promo.active ? "#22c55e" : "#ef4444" }}>
                  {promo.active ? "✓ Активна" : "✗ Выключена"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty add card */}
        <button onClick={() => setModal({})}
          className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all min-h-[160px]"
          style={{ border: "2px dashed var(--border)", color: "var(--fg-muted)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
          <Megaphone className="w-8 h-8" />
          <span className="text-sm font-bold">Создать акцию</span>
        </button>
      </div>

      {modal !== false && (
        <PromoModal item={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
