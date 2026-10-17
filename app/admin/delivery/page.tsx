"use client";

import { useState } from "react";
import { Truck, MapPin, Clock, Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Zone {
  id: number;
  name: string;
  description: string;
  price: number;
  minOrder: number;
  time: string;
  active: boolean;
  color: string;
}

interface Schedule {
  day: string;
  open: string;
  close: string;
  working: boolean;
}

const INITIAL_ZONES: Zone[] = [
  { id: 1, name: "Центр",        description: "Бишкек: Октябрьский, Свердловский р-н", price: 0,   minOrder: 800,  time: "30–45 мин", active: true,  color: "#22c55e" },
  { id: 2, name: "Север",        description: "Асанбай, Ала-Арча, Тоголок Молдо",      price: 100, minOrder: 600,  time: "40–55 мин", active: true,  color: "#38bdf8" },
  { id: 3, name: "Юг",           description: "Кара-Жыгач, Аламедин-1, Восток-5",      price: 150, minOrder: 700,  time: "45–60 мин", active: true,  color: "#f59e0b" },
  { id: 4, name: "Запад",        description: "Сокулук, Кок-Жар, Нижний Джал",         price: 200, minOrder: 1000, time: "50–70 мин", active: false, color: "#a78bfa" },
  { id: 5, name: "Аэропорт",     description: "Манас, Пригород",                        price: 300, minOrder: 1200, time: "60–80 мин", active: false, color: "#ef4444" },
];

const INITIAL_SCHEDULE: Schedule[] = [
  { day: "Понедельник", open: "10:00", close: "23:00", working: true  },
  { day: "Вторник",     open: "10:00", close: "23:00", working: true  },
  { day: "Среда",       open: "10:00", close: "23:00", working: true  },
  { day: "Четверг",     open: "10:00", close: "23:00", working: true  },
  { day: "Пятница",     open: "10:00", close: "24:00", working: true  },
  { day: "Суббота",     open: "10:00", close: "24:00", working: true  },
  { day: "Воскресенье", open: "11:00", close: "23:00", working: true  },
];

function ZoneModal({ zone, onClose, onSave }: {
  zone: Partial<Zone> | null;
  onClose: () => void;
  onSave: (data: Omit<Zone, "id">) => void;
}) {
  const isNew = !zone?.id;
  const [form, setForm] = useState({
    name:        zone?.name        ?? "",
    description: zone?.description ?? "",
    price:       zone?.price       ?? 0,
    minOrder:    zone?.minOrder    ?? 500,
    time:        zone?.time        ?? "30–45 мин",
    active:      zone?.active      ?? true,
    color:       zone?.color       ?? "#22c55e",
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), minOrder: Number(form.minOrder) });
  }
  const COLORS = ["#22c55e","#38bdf8","#f59e0b","#a78bfa","#ef4444","#f97316"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>
            {isNew ? "Новая зона доставки" : "Редактировать зону"}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Название зоны*" required className="w-full h-10 px-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Описание района..." rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wide block mb-1.5" style={{ color: "var(--fg-muted)" }}>Стоимость доставки (сом)</label>
              <input type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                placeholder="0" min={0} className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wide block mb-1.5" style={{ color: "var(--fg-muted)" }}>Мин. сумма (сом)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
                placeholder="500" min={0} className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
            </div>
          </div>
          <input type="text" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            placeholder="Время доставки (напр. 30–45 мин)" className="w-full h-10 px-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          {/* Color picker */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wide block mb-2" style={{ color: "var(--fg-muted)" }}>Цвет зоны</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-xl transition-transform"
                  style={{ background: c, transform: form.color === c ? "scale(1.2)" : "scale(1)", boxShadow: form.color === c ? `0 0 0 3px ${c}40` : "none" }}>
                  {form.color === c && <Check className="w-4 h-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
            className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: form.active ? "#e8fdf0" : "var(--bg-section)", color: form.active ? "#22c55e" : "var(--fg-muted)", border: `1.5px solid ${form.active ? "#22c55e40" : "var(--border)"}` }}>
            <span className="w-4 h-4 rounded flex items-center justify-center text-xs"
              style={{ background: form.active ? "#22c55e" : "var(--border)", color: "#fff" }}>
              {form.active ? "✓" : ""}
            </span>
            {form.active ? "Зона активна" : "Зона отключена"}
          </button>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-bold"
              style={{ background: "var(--bg-section)", color: "var(--fg-sub)", border: "1.5px solid var(--border)" }}>Отмена</button>
            <button type="submit" className="flex-1 h-10 rounded-xl text-sm font-bold text-white" style={{ background: "var(--brand)" }}
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

export default function DeliveryPage() {
  const [zones, setZones]       = useState<Zone[]>(INITIAL_ZONES);
  const [schedule, setSchedule] = useState<Schedule[]>(INITIAL_SCHEDULE);
  const [modal, setModal]       = useState<Partial<Zone> | null | false>(false);
  const [minFreeDelivery, setMinFreeDelivery] = useState("800");
  const [saved, setSaved]       = useState(false);

  function handleSave(data: Omit<Zone, "id">) {
    if (modal && "id" in modal && modal.id) {
      setZones(prev => prev.map(z => z.id === modal.id ? { ...z, ...data } : z));
    } else {
      setZones(prev => [...prev, { ...data, id: Date.now() }]);
    }
    setModal(false);
  }

  function updateSchedule(day: string, field: keyof Schedule, value: string | boolean) {
    setSchedule(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));
  }

  function handleGlobalSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Доставка</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>Зоны, тарифы и расписание</p>
        </div>
        <button onClick={handleGlobalSave}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: saved ? "#22c55e" : "var(--brand)" }}>
          {saved ? <><Check className="w-4 h-4" /> Сохранено</> : "Сохранить настройки"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Активных зон",  value: zones.filter(z => z.active).length,  icon: <MapPin className="w-5 h-5" />,  color: "#22c55e", bg: "#e8fdf0" },
          { label: "Мин. бесплатно", value: `${minFreeDelivery} сом`,            icon: <Truck className="w-5 h-5" />,  color: "#f97316", bg: "#fff4ec" },
          { label: "Макс. время",   value: "80 мин",                              icon: <Clock className="w-5 h-5" />,  color: "#38bdf8", bg: "#e0f5ff" },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>
              {icon}
            </div>
            <div>
              <p className="font-black text-lg leading-none" style={{ color: "var(--fg)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Free delivery threshold */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <h3 className="font-black text-sm mb-3" style={{ color: "var(--fg)" }}>🎁 Бесплатная доставка от</h3>
        <div className="flex items-center gap-3">
          <input type="number" value={minFreeDelivery} onChange={e => setMinFreeDelivery(e.target.value)}
            className="w-40 h-10 px-3 rounded-xl text-sm font-bold outline-none"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--fg-sub)" }}>сом</span>
          <span className="text-xs" style={{ color: "var(--fg-muted)" }}>— при заказе на эту сумму доставка бесплатна в Центре</span>
        </div>
      </div>

      {/* Delivery zones */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>📍 Зоны доставки</h3>
          <button onClick={() => setModal({})}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold text-white"
            style={{ background: "var(--brand)" }}>
            <Plus className="w-3.5 h-3.5" /> Добавить зону
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Зона", "Районы", "Доставка", "Мин. заказ", "Время", "Статус", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((zone, i) => (
                <tr key={zone.id} className="transition-colors"
                  style={{ borderBottom: i < zones.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: zone.color }} />
                      <span className="font-black text-sm" style={{ color: "var(--fg)" }}>{zone.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs max-w-[180px]" style={{ color: "var(--fg-muted)" }}>{zone.description}</td>
                  <td className="px-4 py-3.5 font-black" style={{ color: zone.price === 0 ? "#22c55e" : "var(--fg)" }}>
                    {zone.price === 0 ? "Бесплатно" : `${zone.price} сом`}
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "var(--fg-sub)" }}>{zone.minOrder} сом</td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--fg-sub)" }}>{zone.time}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, active: !z.active } : z))}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
                      style={{ background: zone.active ? "#e8fdf0" : "#fff0f0", color: zone.active ? "#22c55e" : "#ef4444" }}>
                      {zone.active ? "Активна" : "Выкл."}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => setModal(zone)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "var(--fg-muted)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setZones(prev => prev.filter(z => z.id !== zone.id))}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "var(--fg-muted)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>🕐 Расписание работы</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {schedule.map(s => (
            <div key={s.day} className="px-5 py-3 flex items-center gap-4 flex-wrap">
              <button onClick={() => updateSchedule(s.day, "working", !s.working)}
                className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 transition-all"
                style={{ background: s.working ? "var(--brand)" : "var(--border)", color: "#fff" }}>
                {s.working ? "✓" : ""}
              </button>
              <span className="w-32 font-semibold text-sm" style={{ color: s.working ? "var(--fg)" : "var(--fg-muted)" }}>
                {s.day}
              </span>
              {s.working ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={s.open} onChange={e => updateSchedule(s.day, "open", e.target.value)}
                    className="h-8 px-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
                  <span className="text-xs" style={{ color: "var(--fg-muted)" }}>—</span>
                  <input type="time" value={s.close} onChange={e => updateSchedule(s.day, "close", e.target.value)}
                    className="h-8 px-2 rounded-lg text-sm outline-none"
                    style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
                </div>
              ) : (
                <span className="text-sm" style={{ color: "var(--fg-muted)" }}>Выходной</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {modal !== false && (
        <ZoneModal zone={modal} onClose={() => setModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
