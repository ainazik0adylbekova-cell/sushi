"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Star,
  DollarSign, Clock, Truck, CheckCircle, XCircle,
  AlertCircle, Package, ChevronRight, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Period = "today" | "week" | "month";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const DATA: Record<Period, {
  revenue: number;       revenueDelta: number;
  orders: number;        ordersDelta: number;
  customers: number;     customersDelta: number;
  avgCheck: number;      avgCheckDelta: number;
  chart: { label: string; value: number; orders: number }[];
  topDishes: { name: string; emoji: string; sold: number; revenue: number; rating: number }[];
  recentOrders: {
    id: string; user: string; total: number; status: "new" | "preparing" | "delivering" | "delivered" | "cancelled"; time: string; items: number;
  }[];
  statusBreakdown: { status: "new" | "preparing" | "delivering" | "delivered" | "cancelled"; count: number }[];
  ratingDist: number[]; // index 0 = 1 star … index 4 = 5 stars
  avgRating: number;
  totalReviews: number;
}> = {
  today: {
    revenue: 48_750, revenueDelta: 12.4,
    orders: 34,      ordersDelta: 8.1,
    customers: 28,   customersDelta: 5.3,
    avgCheck: 1434,  avgCheckDelta: 3.9,
    chart: [
      { label: "09:00", value: 1200,  orders: 1 },
      { label: "10:00", value: 2400,  orders: 2 },
      { label: "11:00", value: 3800,  orders: 3 },
      { label: "12:00", value: 8900,  orders: 7 },
      { label: "13:00", value: 11200, orders: 9 },
      { label: "14:00", value: 9700,  orders: 6 },
      { label: "15:00", value: 5400,  orders: 4 },
      { label: "16:00", value: 4200,  orders: 2 },
    ],
    topDishes: [
      { name: "Ролл Филадельфия", emoji: "🍣", sold: 18, revenue: 8820,  rating: 4.9 },
      { name: "Сет «Жейм»",       emoji: "🍱", sold: 9,  revenue: 11610, rating: 4.8 },
      { name: "Ролл Дракон",      emoji: "🐉", sold: 14, revenue: 7560,  rating: 4.7 },
      { name: "Том Ям",           emoji: "🍜", sold: 11, revenue: 5720,  rating: 4.6 },
      { name: "Ролл Калифорния",  emoji: "🌊", sold: 12, revenue: 5280,  rating: 4.5 },
    ],
    recentOrders: [
      { id: "#1042", user: "Айдана А.",    total: 1490, status: "new",        time: "15:32", items: 2 },
      { id: "#1041", user: "Нурбек У.",    total: 880,  status: "preparing",  time: "15:18", items: 1 },
      { id: "#1040", user: "Бекзат К.",    total: 2290, status: "delivering", time: "14:55", items: 3 },
      { id: "#1039", user: "Айпери Ж.",    total: 490,  status: "delivered",  time: "14:10", items: 1 },
      { id: "#1038", user: "Азамат С.",    total: 1740, status: "delivered",  time: "13:47", items: 3 },
    ],
    statusBreakdown: [
      { status: "new",        count: 3  },
      { status: "preparing",  count: 5  },
      { status: "delivering", count: 4  },
      { status: "delivered",  count: 20 },
      { status: "cancelled",  count: 2  },
    ],
    ratingDist: [1, 1, 3, 8, 17], avgRating: 4.7, totalReviews: 30,
  },

  week: {
    revenue: 312_400, revenueDelta: 18.7,
    orders: 218,      ordersDelta: 14.2,
    customers: 163,   customersDelta: 11.8,
    avgCheck: 1432,   avgCheckDelta: 3.9,
    chart: [
      { label: "Пн", value: 38000, orders: 26 },
      { label: "Вт", value: 42000, orders: 29 },
      { label: "Ср", value: 49000, orders: 35 },
      { label: "Чт", value: 55000, orders: 38 },
      { label: "Пт", value: 67000, orders: 47 },
      { label: "Сб", value: 72000, orders: 51 },
      { label: "Вс", value: 48000, orders: 34 },
    ],
    topDishes: [
      { name: "Ролл Филадельфия", emoji: "🍣", sold: 124, revenue: 60760, rating: 4.9 },
      { name: "Ролл Дракон",      emoji: "🐉", sold: 98,  revenue: 52920, rating: 4.7 },
      { name: "Сет «Жейм»",       emoji: "🍱", sold: 67,  revenue: 86430, rating: 4.8 },
      { name: "Том Ям",           emoji: "🍜", sold: 82,  revenue: 42640, rating: 4.6 },
      { name: "Ролл Калифорния",  emoji: "🌊", sold: 91,  revenue: 40040, rating: 4.5 },
    ],
    recentOrders: [
      { id: "#1042", user: "Айдана А.",    total: 1490, status: "new",        time: "15:32", items: 2 },
      { id: "#1041", user: "Нурбек У.",    total: 880,  status: "preparing",  time: "15:18", items: 1 },
      { id: "#1040", user: "Бекзат К.",    total: 2290, status: "delivering", time: "14:55", items: 3 },
      { id: "#1039", user: "Айпери Ж.",    total: 490,  status: "delivered",  time: "14:10", items: 1 },
      { id: "#1038", user: "Азамат С.",    total: 1740, status: "delivered",  time: "13:47", items: 3 },
    ],
    statusBreakdown: [
      { status: "new",        count: 8  },
      { status: "preparing",  count: 12 },
      { status: "delivering", count: 15 },
      { status: "delivered",  count: 168 },
      { status: "cancelled",  count: 15 },
    ],
    ratingDist: [3, 5, 18, 62, 128], avgRating: 4.7, totalReviews: 216,
  },

  month: {
    revenue: 1_284_000, revenueDelta: 22.3,
    orders: 894,        ordersDelta: 19.6,
    customers: 641,     customersDelta: 24.1,
    avgCheck: 1436,     avgCheckDelta: 2.2,
    chart: [
      { label: "1–5",   value: 180000, orders: 124 },
      { label: "6–10",  value: 210000, orders: 147 },
      { label: "11–15", value: 198000, orders: 138 },
      { label: "16–20", value: 245000, orders: 172 },
      { label: "21–25", value: 270000, orders: 189 },
      { label: "26–30", value: 181000, orders: 124 },
    ],
    topDishes: [
      { name: "Ролл Филадельфия", emoji: "🍣", sold: 498, revenue: 244020, rating: 4.9 },
      { name: "Ролл Дракон",      emoji: "🐉", sold: 412, revenue: 222480, rating: 4.7 },
      { name: "Сет «Жейм»",       emoji: "🍱", sold: 287, revenue: 370230, rating: 4.8 },
      { name: "Том Ям",           emoji: "🍜", sold: 341, revenue: 177320, rating: 4.6 },
      { name: "Ролл Калифорния",  emoji: "🌊", sold: 376, revenue: 165440, rating: 4.5 },
    ],
    recentOrders: [
      { id: "#1042", user: "Айдана А.",    total: 1490, status: "new",        time: "15:32", items: 2 },
      { id: "#1041", user: "Нурбек У.",    total: 880,  status: "preparing",  time: "15:18", items: 1 },
      { id: "#1040", user: "Бекзат К.",    total: 2290, status: "delivering", time: "14:55", items: 3 },
      { id: "#1039", user: "Айпери Ж.",    total: 490,  status: "delivered",  time: "14:10", items: 1 },
      { id: "#1038", user: "Азамат С.",    total: 1740, status: "delivered",  time: "13:47", items: 3 },
    ],
    statusBreakdown: [
      { status: "new",        count: 12  },
      { status: "preparing",  count: 18  },
      { status: "delivering", count: 24  },
      { status: "delivered",  count: 789 },
      { status: "cancelled",  count: 51  },
    ],
    ratingDist: [11, 22, 74, 248, 519], avgRating: 4.8, totalReviews: 874,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Status meta
// ─────────────────────────────────────────────────────────────────────────────
type OrderStatus = "new" | "preparing" | "delivering" | "delivered" | "cancelled";

const STATUS_META: Record<OrderStatus, {
  label: string; color: string; bg: string; icon: React.ElementType;
}> = {
  new:        { label: "Новый",     color: "#38bdf8", bg: "#e0f5ff", icon: AlertCircle  },
  preparing:  { label: "Готовится", color: "#f59e0b", bg: "#fef9e7", icon: Clock        },
  delivering: { label: "В пути",    color: "#a78bfa", bg: "#f3f0ff", icon: Truck        },
  delivered:  { label: "Доставлен", color: "#22c55e", bg: "#e8fdf0", icon: CheckCircle  },
  cancelled:  { label: "Отменён",   color: "#ef4444", bg: "#fff0f0", icon: XCircle      },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, delta, color, bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: number;
  color: string;
  bg: string;
}) {
  const up = delta >= 0;
  return (
    <div className="admin-stat-card rounded-2xl p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 admin-icon-glow"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span
          className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
          style={{
            background: up ? "#e8fdf0" : "#fff0f0",
            color: up ? "#22c55e" : "#ef4444",
          }}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? "+" : ""}{delta}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "var(--fg)" }}>{value}</p>
        <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--fg-muted)" }}>{label}</p>
      </div>
    </div>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number; orders: number }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end gap-1 h-36 w-full">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        const isH = hovered === i;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 flex-1 group cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <div
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-center pointer-events-none transition-opacity"
              style={{
                background: "var(--fg)",
                color: "var(--bg)",
                opacity: isH ? 1 : 0,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {d.value.toLocaleString()} сом<br />
              {d.orders} зак.
            </div>
            {/* Bar */}
            <div
              className="w-full rounded-t-lg transition-all duration-200"
              style={{
                height: `${Math.max(pct, 4)}%`,
                background: isH ? "var(--brand)" : "var(--brand-light)",
                border: isH ? "1.5px solid var(--brand)" : "1.5px solid transparent",
              }}
            />
            {/* Label */}
            <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-3 h-3" viewBox="0 0 12 12" fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
          <path d="M6 1l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.96l-2.78 1.59.53-3.09L1.5 4.27l3.11-.45L6 1z" />
        </svg>
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: "var(--fg-muted)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("today");
  const d = DATA[period];

  const PERIODS: { value: Period; label: string }[] = [
    { value: "today", label: "Сегодня" },
    { value: "week",  label: "Неделя"  },
    { value: "month", label: "Месяц"   },
  ];

  // Rating distribution max for bar scaling
  const ratingMax = Math.max(...d.ratingDist);

  // Status breakdown total
  const statusTotal = d.statusBreakdown.reduce((s, x) => s + x.count, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-black text-2xl" style={{ color: "var(--fg)" }}>Дашборд</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>
            Последнее обновление: сегодня в 15:32
          </p>
        </div>

        {/* Period selector */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
        >
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="h-8 px-4 rounded-lg text-xs font-bold transition-all"
              style={{
                background: period === p.value ? "var(--brand)" : "transparent",
                color: period === p.value ? "#fff" : "var(--fg-muted)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Выручка"
          value={`${(d.revenue / 1000).toFixed(1)}к сом`}
          delta={d.revenueDelta}
          color="#f97316"
          bg="#fff4ec"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Заказы"
          value={String(d.orders)}
          delta={d.ordersDelta}
          color="#3b82f6"
          bg="#eff6ff"
        />
        <KpiCard
          icon={Users}
          label="Клиенты"
          value={String(d.customers)}
          delta={d.customersDelta}
          color="#a78bfa"
          bg="#f5f3ff"
        />
        <KpiCard
          icon={Package}
          label="Средний чек"
          value={`${d.avgCheck.toLocaleString()} сом`}
          delta={d.avgCheckDelta}
          color="#22c55e"
          bg="#f0fdf4"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart – 2/3 width */}
        <div className="admin-card lg:col-span-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>
                График выручки
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                {period === "today" ? "По часам" : period === "week" ? "По дням" : "По неделям"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--brand)" }}
              />
              <span className="text-xs" style={{ color: "var(--fg-muted)" }}>Выручка</span>
            </div>
          </div>
          <BarChart data={d.chart} />
          {/* Summary row */}
          <div
            className="flex gap-6 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div>
              <p className="text-lg font-black" style={{ color: "var(--fg)" }}>
                {d.revenue.toLocaleString()} сом
              </p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Итого за период</p>
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: "var(--fg)" }}>
                {Math.round(d.revenue / d.chart.length).toLocaleString()} сом
              </p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                {period === "today" ? "В час" : period === "week" ? "В день" : "В неделю"}
              </p>
            </div>
          </div>
        </div>

        {/* Order status breakdown – 1/3 width */}
        <div className="admin-card rounded-2xl p-5">
          <h3 className="font-black text-sm mb-5" style={{ color: "var(--fg)" }}>
            Статусы заказов
          </h3>
          <div className="flex flex-col gap-3">
            {d.statusBreakdown.map(({ status, count }) => {
              const meta = STATUS_META[status];
              const pct  = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: "var(--fg-sub)" }}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-black" style={{ color: "var(--fg)" }}>
                      {count} <span style={{ color: "var(--fg-muted)" }}>({pct}%)</span>
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-section)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div
            className="mt-4 pt-4 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
              Всего заказов
            </span>
            <span className="font-black text-base" style={{ color: "var(--fg)" }}>
              {statusTotal}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top dishes */}
        <div className="admin-card lg:col-span-2 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>
              Топ блюд
            </h3>
            <Link
              href="/admin/menu"
              className="flex items-center gap-1 text-xs font-bold transition-colors"
              style={{ color: "var(--brand)" }}
            >
              Всё меню <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-0">
            {d.topDishes.map((dish, i) => {
              const maxSold = d.topDishes[0].sold;
              const barPct  = Math.round((dish.sold / maxSold) * 100);
              return (
                <div
                  key={dish.name}
                  className="flex items-center gap-3 py-3 transition-colors rounded-xl px-2"
                  style={{ borderBottom: i < d.topDishes.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {/* Rank */}
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                    style={{
                      background: i === 0 ? "#fef9e7" : i === 1 ? "#f5f5f5" : i === 2 ? "#fff4ec" : "var(--bg-section)",
                      color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#f97316" : "var(--fg-muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                  {/* Emoji */}
                  <span className="text-xl shrink-0">{dish.emoji}</span>
                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>{dish.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${barPct}%`, maxWidth: "100%", background: "var(--brand)", opacity: 0.7 }}
                      />
                      <span className="text-[10px]" style={{ color: "var(--fg-muted)" }}>{dish.sold} шт.</span>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="hidden sm:block shrink-0">
                    <Stars rating={dish.rating} />
                  </div>
                  {/* Revenue */}
                  <p className="text-sm font-black shrink-0" style={{ color: "var(--fg)" }}>
                    {dish.revenue.toLocaleString()} сом
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating block */}
        <div className="admin-card rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>
            Рейтинг ресторана
          </h3>

          {/* Big rating */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#fef9e7" }}
            >
              <span className="text-2xl font-black" style={{ color: "#f59e0b" }}>
                {d.avgRating.toFixed(1)}
              </span>
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5" viewBox="0 0 12 12"
                    fill={i <= Math.round(d.avgRating) ? "#f59e0b" : "#e5e7eb"}
                  >
                    <path d="M6 1l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.96l-2.78 1.59.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                {d.totalReviews} отзывов
              </p>
            </div>
          </div>

          {/* Distribution bars */}
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = d.ratingDist[star - 1];
              const pct   = ratingMax > 0 ? Math.round((count / ratingMax) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold w-4 shrink-0 text-right" style={{ color: "var(--fg-muted)" }}>
                    {star}
                  </span>
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="#f59e0b">
                    <path d="M6 1l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.96l-2.78 1.59.53-3.09L1.5 4.27l3.11-.45L6 1z" />
                  </svg>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-section)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "#f59e0b" }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold w-5 shrink-0" style={{ color: "var(--fg-muted)" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href="/admin/reviews"
            className="flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all mt-auto"
            style={{
              background: "var(--brand-light)",
              color: "var(--brand)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
          >
            Все отзывы <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>
            Последние заказы
          </h3>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-bold transition-colors"
            style={{ color: "var(--brand)" }}
          >
            Все заказы <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Заказ", "Клиент", "Позиций", "Сумма", "Время", "Статус"].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.recentOrders.map((order, i) => (
                <tr
                  key={order.id}
                  className="transition-colors"
                  style={{ borderBottom: i < d.recentOrders.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-black text-sm" style={{ color: "var(--fg)" }}>{order.id}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold whitespace-nowrap" style={{ color: "var(--fg-sub)" }}>
                    {order.user}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: "var(--bg-section)", color: "var(--fg-muted)" }}
                    >
                      {order.items} поз.
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-black whitespace-nowrap" style={{ color: "var(--fg)" }}>
                    {order.total.toLocaleString()} сом
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>
                    {order.time}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/orders",   emoji: "📦", label: "Новые заказы",  sub: "3 ожидают",    color: "#38bdf8", bg: "#e0f5ff" },
          { href: "/admin/reviews",  emoji: "⭐", label: "Отзывы",        sub: "2 на проверку", color: "#f59e0b", bg: "#fef9e7" },
          { href: "/admin/menu",     emoji: "🍣", label: "Меню",          sub: "42 блюда",      color: "#f97316", bg: "#fff4ec" },
          { href: "/admin/promos",   emoji: "🎁", label: "Промокоды",     sub: "5 активных",    color: "#a78bfa", bg: "#f5f3ff" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="admin-card rounded-2xl p-4 flex items-center gap-3 transition-all group"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = item.color + "40"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(249, 115, 22, 0.15)"; }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 admin-icon-glow"
              style={{ background: item.bg }}
            >
              {item.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>{item.label}</p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{item.sub}</p>
            </div>
            <ChevronRight
              className="w-4 h-4 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: item.color }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
