"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";

interface Category {
  id: number;
  name: string;
  emoji: string;
  slug: string;
  count: number;
  visible: boolean;
  order: number;
}

const INITIAL: Category[] = [
  { id: 1, name: "Роллы",   emoji: "🍣", slug: "rolls",    count: 18, visible: true,  order: 1 },
  { id: 2, name: "Суши",    emoji: "🐟", slug: "sushi",    count: 8,  visible: true,  order: 2 },
  { id: 3, name: "Сеты",    emoji: "🎁", slug: "sets",     count: 6,  visible: true,  order: 3 },
  { id: 4, name: "Горячее", emoji: "🍲", slug: "hot",      count: 5,  visible: true,  order: 4 },
  { id: 5, name: "Лапша",   emoji: "🍜", slug: "noodles",  count: 4,  visible: true,  order: 5 },
  { id: 6, name: "Напитки", emoji: "🍵", slug: "drinks",   count: 7,  visible: true,  order: 6 },
  { id: 7, name: "Супы",    emoji: "🥣", slug: "soups",    count: 3,  visible: false, order: 7 },
  { id: 8, name: "Десерты", emoji: "🍡", slug: "desserts", count: 0,  visible: false, order: 8 },
];

function CategoryModal({
  item, onClose, onSave,
}: {
  item: Partial<Category> | null;
  onClose: () => void;
  onSave: (data: Omit<Category, "id" | "count" | "order">) => void;
}) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    name:    item?.name    ?? "",
    emoji:   item?.emoji   ?? "🍱",
    slug:    item?.slug    ?? "",
    visible: item?.visible ?? true,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>
            {isNew ? "Добавить категорию" : "Редактировать"}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <input type="text" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              className="w-14 h-10 rounded-xl text-center text-xl outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }} maxLength={2} />
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Название*" required
              className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          </div>
          <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="slug (для URL, напр. rolls)"
            className="w-full h-10 px-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          <button type="button" onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
            className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: form.visible ? "#e8fdf0" : "var(--bg-section)",
              color: form.visible ? "#22c55e" : "var(--fg-muted)",
              border: `1.5px solid ${form.visible ? "#22c55e40" : "var(--border)"}`,
            }}>
            <span className="w-4 h-4 rounded flex items-center justify-center text-xs"
              style={{ background: form.visible ? "#22c55e" : "var(--border)", color: "#fff" }}>
              {form.visible ? "✓" : ""}
            </span>
            {form.visible ? "Отображается в меню" : "Скрыта"}
          </button>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-bold"
              style={{ background: "var(--bg-section)", color: "var(--fg-sub)", border: "1.5px solid var(--border)" }}>Отмена</button>
            <button type="submit" className="flex-1 h-10 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--brand)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
              {isNew ? "Добавить" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [cats, setCats]   = useState<Category[]>(INITIAL);
  const [modal, setModal] = useState<Partial<Category> | null | false>(false);

  function handleSave(data: Omit<Category, "id" | "count" | "order">) {
    if (modal && "id" in modal && modal.id) {
      setCats(prev => prev.map(c => c.id === modal.id ? { ...c, ...data } : c));
    } else {
      setCats(prev => [...prev, { ...data, id: Date.now(), count: 0, order: prev.length + 1 }]);
    }
    setModal(false);
  }

  function handleDelete(id: number) {
    setCats(prev => prev.filter(c => c.id !== id));
  }

  function toggleVisible(id: number) {
    setCats(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Категории</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>{cats.length} категорий · {cats.filter(c => c.visible).length} видимых</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "var(--brand)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}>
          <Plus className="w-4 h-4" /> Добавить категорию
        </button>
      </div>

      {/* Grid of category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cats.map(cat => (
          <div key={cat.id}
            className="rounded-2xl p-4 flex flex-col gap-3 group"
            style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: cat.visible ? "var(--brand-light)" : "var(--bg-section)" }}>
                {cat.emoji}
              </div>
              {/* Drag handle placeholder */}
              <GripVertical className="w-4 h-4 opacity-30 mt-1" style={{ color: "var(--fg-muted)" }} />
            </div>

            <div>
              <p className="font-black text-sm" style={{ color: "var(--fg)" }}>{cat.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>/{cat.slug}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: "var(--bg-section)", color: "var(--fg-muted)" }}>
                {cat.count} блюд
              </span>
              <button onClick={() => toggleVisible(cat.id)}
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all"
                style={{
                  background: cat.visible ? "#e8fdf0" : "#fff0f0",
                  color:      cat.visible ? "#22c55e" : "#ef4444",
                }}>
                {cat.visible ? "Видима" : "Скрыта"}
              </button>
            </div>

            <div className="flex gap-1.5 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setModal(cat)}
                className="flex-1 h-8 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                <Pencil className="w-3 h-3" /> Изменить
              </button>
              <button onClick={() => handleDelete(cat.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal !== false && (
        <CategoryModal item={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
