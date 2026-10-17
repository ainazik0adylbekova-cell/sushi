"use client";

import { useState, useMemo } from "react";
import {
  Search, Filter, ChevronDown, Clock, CheckCircle,
  XCircle, AlertCircle, Package, Truck, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type OrderStatus = "new" | "preparing" | "delivering" | "delivered" | "cancelled";
type DeliveryMethod = "Доставка" | "Самовывоз";

interface Order {
  id: string;
  user: string;
  phone: string;
  address: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  method: DeliveryMethod;
  status: OrderStatus;
  date: string;
  time: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  { id: "#1042", user: "Айдана А.",    phone: "+996 700 111 222", address: "ул. Манаса 45, кв. 12", total: 1490, method: "Доставка",  status: "new",        date: "21.09.2026", time: "15:32",
    items: [{ name: "Ролл Филадельфия", qty: 2, price: 490 }, { name: "Том Ям", qty: 1, price: 520 }] },
  { id: "#1041", user: "Нурбек У.",    phone: "+996 555 234 567", address: "пр. Чуй 102",           total: 880,  method: "Самовывоз", status: "preparing",  date: "21.09.2026", time: "15:18",
    items: [{ name: "Ролл Калифорния", qty: 2, price: 440 }] },
  { id: "#1040", user: "Бекзат К.",    phone: "+996 700 345 678", address: "ул. Боконбаева 11",      total: 2290, method: "Доставка",  status: "delivering", date: "21.09.2026", time: "14:55",
    items: [{ name: "Сет «Жейм»", qty: 1, price: 1290 }, { name: "Ролл Дракон", qty: 1, price: 540 }, { name: "Матча латте", qty: 2, price: 220 }] },
  { id: "#1039", user: "Айпери Ж.",    phone: "+996 312 456 789", address: "мкр Аламедин-1, д.4",   total: 490,  method: "Доставка",  status: "delivered",  date: "21.09.2026", time: "14:10",
    items: [{ name: "Ролл Филадельфия", qty: 1, price: 490 }] },
  { id: "#1038", user: "Азамат С.",    phone: "+996 700 567 890", address: "ул. Фрунзе 77",         total: 1740, method: "Самовывоз", status: "delivered",  date: "21.09.2026", time: "13:47",
    items: [{ name: "Ролл Дракон", qty: 2, price: 540 }, { name: "Wok с курицей", qty: 1, price: 410 }, { name: "Матча латте", qty: 1, price: 220 }] },
  { id: "#1037", user: "Нурсултан М.", phone: "+996 555 678 901", address: "ул. Токомбаева 3",      total: 990,  method: "Доставка",  status: "cancelled",  date: "21.09.2026", time: "13:20",
    items: [{ name: "Том Ям", qty: 1, price: 520 }, { name: "Ролл Калифорния", qty: 1, price: 440 }] },
  { id: "#1036", user: "Гульмира Т.",  phone: "+996 700 789 012", address: "пр. Мира 55, кв. 8",   total: 1280, method: "Доставка",  status: "delivered",  date: "20.09.2026", time: "19:05",
    items: [{ name: "Сет «Жейм»", qty: 1, price: 1290 }] },
  { id: "#1035", user: "Эрлан Б.",     phone: "+996 312 890 123", address: "ул. Горького 14",       total: 960,  method: "Самовывоз", status: "delivered",  date: "20.09.2026", time: "18:30",
    items: [{ name: "Ролл Филадельфия", qty: 1, price: 490 }, { name: "Ролл Калифорния", qty: 1, price: 440 }] },
  { id: "#1034", user: "Зарина О.",    phone: "+996 700 901 234", address: "мкр 10-й, д. 22",       total: 520,  method: "Доставка",  status: "delivered",  date: "20.09.2026", time: "17:15",
    items: [{ name: "Том Ям", qty: 1, price: 520 }] },
  { id: "#1033", user: "Данияр К.",    phone: "+996 555 012 345", address: "ул. Байтик Баатыра 9",  total: 1630, method: "Доставка",  status: "new",        date: "20.09.2026", time: "16:40",
    items: [{ name: "Сет «Жейм»", qty: 1, price: 1290 }, { name: "Матча латте", qty: 1, price: 220 }] },
];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new:        { label: "Новый",     color: "#38bdf8", bg: "#e0f5ff", icon: AlertCircle  },
  preparing:  { label: "Готовится", color: "#f59e0b", bg: "#fef9e7", icon: Clock        },
  delivering: { label: "В пути",    color: "#a78bfa", bg: "#f3f0ff", icon: Truck        },
  delivered:  { label: "Доставлен", color: "#22c55e", bg: "#e8fdf0", icon: CheckCircle  },
  cancelled:  { label: "Отменён",   color: "#ef4444", bg: "#fff0f0", icon: XCircle      },
};

const STATUS_ORDER: OrderStatus[] = ["new", "preparing", "delivering", "delivered", "cancelled"];

const PAGE_SIZE = 8;

// ── StatusBadge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_META[status];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

// ── StatusSelect dropdown ──────────────────────────────────────────────────
function StatusSelect({
  status,
  onChange,
}: {
  status: OrderStatus;
  onChange: (s: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const s = STATUS_META[status];
  const Icon = s.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
        style={{ background: s.bg, color: s.color }}
      >
        <Icon className="w-3 h-3" />
        {s.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-xl overflow-hidden py-1 min-w-[140px]"
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {STATUS_ORDER.map(opt => {
              const m = STATUS_META[opt];
              const MI = m.icon;
              return (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold transition-colors text-left"
                  style={{ color: opt === status ? m.color : "var(--fg-sub)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = m.bg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <MI className="w-3.5 h-3.5 shrink-0" style={{ color: m.color }} />
                  {m.label}
                  {opt === status && <span className="ml-auto text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Order detail modal ─────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, s: OrderStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <span className="font-black text-base" style={{ color: "var(--fg)" }}>{order.id}</span>
            <span className="ml-2 text-xs" style={{ color: "var(--fg-muted)" }}>{order.date} · {order.time}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Customer */}
          <div className="rounded-xl p-3" style={{ background: "var(--bg-section)" }}>
            <p className="text-[10px] font-black uppercase tracking-wide mb-2" style={{ color: "var(--fg-muted)" }}>Клиент</p>
            <p className="font-bold text-sm" style={{ color: "var(--fg)" }}>{order.user}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{order.phone}</p>
            {order.method === "Доставка" && (
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>📍 {order.address}</p>
            )}
            <p className="text-xs mt-1 font-semibold" style={{ color: "var(--fg-sub)" }}>
              {order.method === "Доставка" ? "🛵 Доставка" : "🏪 Самовывоз"}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide mb-2" style={{ color: "var(--fg-muted)" }}>Состав заказа</p>
            <div className="flex flex-col gap-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--fg-sub)" }}>
                    🍱 {item.name}
                    <span className="ml-1 text-xs" style={{ color: "var(--fg-muted)" }}>×{item.qty}</span>
                  </span>
                  <span className="font-bold" style={{ color: "var(--fg)" }}>{(item.price * item.qty).toLocaleString()} сом</span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between mt-3 pt-3 font-black"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span style={{ color: "var(--fg)" }}>Итого</span>
              <span style={{ color: "var(--brand)" }}>{order.total.toLocaleString()} сом</span>
            </div>
          </div>

          {/* Status change */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide mb-2" style={{ color: "var(--fg-muted)" }}>Изменить статус</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map(opt => {
                const m = STATUS_META[opt];
                const MI = m.icon;
                const active = order.status === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onStatusChange(order.id, opt)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      background: active ? m.color : m.bg,
                      color:      active ? "#fff" : m.color,
                      opacity:    active ? 1 : 0.8,
                    }}
                  >
                    <MI className="w-3 h-3" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders]       = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<DeliveryMethod | "all">("all");
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<Order | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  }

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !search ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.user.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchMethod = methodFilter === "all" || o.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [orders, search, statusFilter, methodFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Counts for tab badges
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_ORDER.forEach(s => { c[s] = orders.filter(o => o.status === s).length; });
    return c;
  }, [orders]);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Заказы</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>{filtered.length} из {orders.length} заказов</p>
        </div>
        {/* Live indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#e8fdf0", color: "#22c55e" }}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Обновляется в реальном времени
        </div>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-1.5 flex-wrap">
        {([
          { value: "all",        label: "Все"       },
          { value: "new",        label: "Новые"     },
          { value: "preparing",  label: "Готовятся" },
          { value: "delivering", label: "В пути"    },
          { value: "delivered",  label: "Доставлены"},
          { value: "cancelled",  label: "Отменены"  },
        ] as { value: OrderStatus | "all"; label: string }[]).map(tab => {
          const active = statusFilter === tab.value;
          const meta   = tab.value !== "all" ? STATUS_META[tab.value] : null;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all"
              style={{
                background: active ? (meta?.color ?? "var(--brand)") : "var(--bg-card)",
                color:      active ? "#fff" : "var(--fg-muted)",
                border:     `1.5px solid ${active ? (meta?.color ?? "var(--brand)") : "var(--border)"}`,
              }}
            >
              {tab.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{
                  background: active ? "rgba(255,255,255,0.25)" : "var(--bg-section)",
                  color:      active ? "#fff" : "var(--fg-muted)",
                }}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search & filters ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
      >
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
            <input
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Поиск по номеру, имени, телефону..."
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
            />
          </div>

          {/* Method filter */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: methodFilter !== "all" ? "var(--brand-light)" : "var(--bg-section)",
                color:      methodFilter !== "all" ? "var(--brand)"       : "var(--fg-sub)",
                border: "1.5px solid var(--border)",
              }}
            >
              <Filter className="w-4 h-4" />
              {methodFilter === "all" ? "Способ" : methodFilter}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-xl py-1 min-w-[140px]"
                  style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                >
                  {(["all", "Доставка", "Самовывоз"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setMethodFilter(opt); setFilterOpen(false); setPage(1); }}
                      className="w-full text-left px-3 py-2 text-sm font-semibold transition-colors"
                      style={{ color: methodFilter === opt ? "var(--brand)" : "var(--fg-sub)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {opt === "all" ? "Все способы" : opt === "Доставка" ? "🛵 Доставка" : "🏪 Самовывоз"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Заказ", "Клиент", "Телефон", "Способ", "Сумма", "Дата", "Статус", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: "var(--fg-muted)" }}>
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    Заказы не найдены
                  </td>
                </tr>
              ) : paginated.map((order, i) => (
                <tr
                  key={order.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-black" style={{ color: "var(--fg)" }}>{order.id}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: "var(--fg-sub)" }}>
                    {order.user}
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {order.phone}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap"
                      style={{ background: "var(--bg-section)", color: "var(--fg-muted)" }}
                    >
                      {order.method === "Доставка" ? "🛵" : "🏪"} {order.method}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-black whitespace-nowrap" style={{ color: "var(--fg)" }}>
                    {order.total.toLocaleString()} сом
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {order.date}<br />
                    <span className="font-semibold">{order.time}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusSelect
                      status={order.status}
                      onChange={s => handleStatusChange(order.id, s)}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelected(order)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ color: "var(--fg-muted)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Страница {page} из {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  color: page === 1 ? "var(--fg-muted)" : "var(--fg)",
                  opacity: page === 1 ? 0.4 : 1,
                  border: "1.5px solid var(--border)",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: n === page ? "var(--brand)" : "transparent",
                    color:      n === page ? "#fff" : "var(--fg-muted)",
                    border: `1.5px solid ${n === page ? "var(--brand)" : "var(--border)"}`,
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  color: page === totalPages ? "var(--fg-muted)" : "var(--fg)",
                  opacity: page === totalPages ? 0.4 : 1,
                  border: "1.5px solid var(--border)",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Order detail modal ── */}
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(id, s) => { handleStatusChange(id, s); }}
        />
      )}
    </div>
  );
}
