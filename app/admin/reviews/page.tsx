"use client";

import { useState, useMemo } from "react";
import { Star, Search, Check, X, Eye } from "lucide-react";

interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  text: string;
  dish?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

const MOCK_REVIEWS: Review[] = [
  { id: 1,  user: "Айдана А.",    avatar: "АА", rating: 5, text: "Отличные роллы! Очень свежий лосось, доставили быстро. Буду заказывать снова!", dish: "Ролл Филадельфия",  date: "21.09.2026", status: "approved" },
  { id: 2,  user: "Нурбек У.",    avatar: "НУ", rating: 4, text: "Вкусно, но упаковка немного помялась. В целом доволен заказом.", dish: "Сет «Жейм»",          date: "20.09.2026", status: "approved" },
  { id: 3,  user: "Бекзат К.",    avatar: "БК", rating: 5, text: "Лучшие суши в городе! Всегда заказываю у вас. Спасибо за качество!", dish: "Ролл Дракон",          date: "20.09.2026", status: "pending"  },
  { id: 4,  user: "Айпери Ж.",    avatar: "АЖ", rating: 3, text: "Доставили с опозданием на 30 минут. Суши вкусные, но хотелось бы точнее соблюдать время.", dish: "Суши с лососем",    date: "19.09.2026", status: "pending"  },
  { id: 5,  user: "Азамат С.",    avatar: "АС", rating: 5, text: "Просто wow! Том Ям горячий, ароматный. Вок тоже супер.", dish: "Том Ям",              date: "19.09.2026", status: "approved" },
  { id: 6,  user: "Гульмира Т.",  avatar: "ГТ", rating: 2, text: "Не понравилось. Рис жёсткий, рыба не свежая на вкус. Больше не закажу.", dish: "Ролл Калифорния",   date: "18.09.2026", status: "rejected" },
  { id: 7,  user: "Эрлан Б.",     avatar: "ЭБ", rating: 4, text: "Хороший сервис, вежливый курьер. Еда вкусная.", dish: "Wok с курицей",      date: "18.09.2026", status: "approved" },
  { id: 8,  user: "Зарина О.",    avatar: "ЗО", rating: 5, text: "Матча латте — моя любовь! Каждый раз беру к роллам.", dish: "Матча Латте",         date: "17.09.2026", status: "pending"  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className="w-3.5 h-3.5" fill={s <= rating ? "#f97316" : "none"} style={{ color: s <= rating ? "#f97316" : "var(--border)" }} />
      ))}
    </div>
  );
}

const STATUS_META = {
  pending:  { label: "На проверке", color: "#f59e0b", bg: "#fef9e7" },
  approved: { label: "Одобрен",     color: "#22c55e", bg: "#e8fdf0" },
  rejected: { label: "Отклонён",    color: "#ef4444", bg: "#fff0f0" },
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | Review["status"]>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => reviews.filter(r => {
    const matchSearch = !search || r.user.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  }), [reviews, search, filter]);

  function setStatus(id: number, status: Review["status"]) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const counts = { all: reviews.length, pending: reviews.filter(r => r.status === "pending").length, approved: reviews.filter(r => r.status === "approved").length, rejected: reviews.filter(r => r.status === "rejected").length };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Отзывы</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>{reviews.length} отзывов · средняя оценка {avgRating} ⭐</p>
        </div>
        {/* Avg rating badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: "var(--brand-light)" }}>
          <Star className="w-5 h-5" fill="#f97316" style={{ color: "#f97316" }} />
          <span className="font-black text-xl" style={{ color: "var(--brand)" }}>{avgRating}</span>
          <span className="text-xs font-semibold" style={{ color: "var(--brand)" }}>/ 5.0</span>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <p className="text-[11px] font-black uppercase tracking-wide mb-1" style={{ color: "var(--fg-muted)" }}>Распределение оценок</p>
        {[5,4,3,2,1].map(star => {
          const cnt = reviews.filter(r => r.rating === star).length;
          const pct = reviews.length ? Math.round((cnt / reviews.length) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-8 shrink-0">
                <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>{star}</span>
                <Star className="w-3 h-3" fill="#f97316" style={{ color: "#f97316" }} />
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-section)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: star >= 4 ? "#f97316" : star === 3 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <span className="text-[11px] font-semibold w-8 text-right shrink-0" style={{ color: "var(--fg-muted)" }}>{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Filter tabs + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "all",      label: "Все"          },
            { value: "pending",  label: "На проверке"  },
            { value: "approved", label: "Одобрены"     },
            { value: "rejected", label: "Отклонены"    },
          ] as { value: "all" | Review["status"]; label: string }[]).map(tab => {
            const active = filter === tab.value;
            const meta = tab.value !== "all" ? STATUS_META[tab.value] : null;
            return (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all"
                style={{ background: active ? (meta?.color ?? "var(--brand)") : "var(--bg-card)", color: active ? "#fff" : "var(--fg-muted)", border: `1.5px solid ${active ? (meta?.color ?? "var(--brand)") : "var(--border)"}` }}>
                {tab.label}
                <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : "var(--bg-section)", color: active ? "#fff" : "var(--fg-muted)" }}>
                  {counts[tab.value as keyof typeof counts]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
            className="h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", color: "var(--fg)", width: 200 }} />
        </div>
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-3">
        {filtered.map(review => {
          const meta = STATUS_META[review.status];
          const isExpanded = expanded === review.id;
          return (
            <div key={review.id} className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: "#a78bfa" }}>
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: "var(--fg)" }}>{review.user}</span>
                    <StarRow rating={review.rating} />
                    {review.dish && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                        style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
                        🍣 {review.dish}
                      </span>
                    )}
                    <span className="text-[11px] ml-auto" style={{ color: "var(--fg-muted)" }}>{review.date}</span>
                  </div>
                  <p className={`text-sm mt-1.5 ${!isExpanded ? "line-clamp-2" : ""}`} style={{ color: "var(--fg-sub)" }}>
                    {review.text}
                  </p>
                  {review.text.length > 100 && (
                    <button onClick={() => setExpanded(isExpanded ? null : review.id)}
                      className="text-xs font-bold mt-1"
                      style={{ color: "var(--brand)" }}>
                      {isExpanded ? "Свернуть" : "Читать полностью"}
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
                {review.status !== "approved" && review.status !== "rejected" ? (
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(review.id, "rejected")}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "#fff0f0", color: "#ef4444" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#ef4444"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}>
                      <X className="w-3 h-3" /> Отклонить
                    </button>
                    <button onClick={() => setStatus(review.id, "approved")}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "#e8fdf0", color: "#22c55e" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#22c55e"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#e8fdf0"; (e.currentTarget as HTMLElement).style.color = "#22c55e"; }}>
                      <Check className="w-3 h-3" /> Одобрить
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setStatus(review.id, "pending")}
                    className="h-8 px-3 rounded-xl text-xs font-bold transition-all"
                    style={{ color: "var(--fg-muted)", border: "1.5px solid var(--border)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    На проверку
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "var(--fg-muted)" }} />
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Отзывы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
