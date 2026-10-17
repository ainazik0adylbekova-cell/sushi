"use client";

import { useState, useMemo } from "react";
import { Search, Users, ShoppingBag, TrendingUp, Eye, X } from "lucide-react";

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  orders: number;
  spent: number;
  joined: string;
  lastOrder: string;
  status: "active" | "blocked";
}

const MOCK_USERS: AppUser[] = [
  { id: "u1", name: "Айдана Асанова",    email: "aidana@mail.kg",   phone: "+996 700 111 222", role: "user",  orders: 14, spent: 18400, joined: "12.01.2026", lastOrder: "21.09.2026", status: "active"  },
  { id: "u2", name: "Нурбек Усупов",     email: "nurbek@gmail.com", phone: "+996 555 234 567", role: "user",  orders: 8,  spent: 9200,  joined: "03.03.2026", lastOrder: "21.09.2026", status: "active"  },
  { id: "u3", name: "Бекзат Кадыров",    email: "bekzat@mail.ru",   phone: "+996 700 345 678", role: "user",  orders: 22, spent: 31800, joined: "28.11.2025", lastOrder: "21.09.2026", status: "active"  },
  { id: "u4", name: "Айпери Жакыпова",   email: "aiperi@inbox.ru",  phone: "+996 312 456 789", role: "user",  orders: 5,  spent: 4100,  joined: "07.05.2026", lastOrder: "20.09.2026", status: "active"  },
  { id: "u5", name: "Азамат Сатылганов", email: "azamat@gmail.com", phone: "+996 700 567 890", role: "user",  orders: 31, spent: 52700, joined: "15.08.2025", lastOrder: "20.09.2026", status: "active"  },
  { id: "u6", name: "Нурсултан Мамытов", email: "nur@mail.kg",      phone: "+996 555 678 901", role: "user",  orders: 2,  spent: 1480,  joined: "01.09.2026", lastOrder: "21.09.2026", status: "blocked" },
  { id: "u7", name: "Гульмира Токтосун", email: "gulmira@mail.kg",  phone: "+996 700 789 012", role: "user",  orders: 17, spent: 23100, joined: "20.02.2026", lastOrder: "20.09.2026", status: "active"  },
  { id: "u8", name: "Эрлан Байтемиров",  email: "erlan@gmail.com",  phone: "+996 312 890 123", role: "user",  orders: 9,  spent: 11200, joined: "14.04.2026", lastOrder: "20.09.2026", status: "active"  },
  { id: "a1", name: "Администратор",     email: "admin@syshi.kg",   phone: "+996 700 000 001", role: "admin", orders: 0,  spent: 0,     joined: "01.01.2025", lastOrder: "—",          status: "active"  },
];

function UserModal({ user, onClose, onToggleBlock }: {
  user: AppUser;
  onClose: () => void;
  onToggleBlock: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl animate-scale-in"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-black text-base" style={{ color: "var(--fg)" }}>Профиль пользователя</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0"
              style={{ background: user.role === "admin" ? "var(--brand)" : "#a78bfa" }}>
              {user.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-black text-base" style={{ color: "var(--fg)" }}>{user.name}</p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: user.role === "admin" ? "var(--brand-light)" : "#f3f0ff", color: user.role === "admin" ? "var(--brand)" : "#a78bfa" }}>
                {user.role === "admin" ? "Администратор" : "Пользователь"}
              </span>
            </div>
          </div>
          {/* Info */}
          <div className="rounded-xl p-3 flex flex-col gap-1.5" style={{ background: "var(--bg-section)" }}>
            {[
              ["📧", user.email],
              ["📱", user.phone],
              ["📅", `Зарегистрирован: ${user.joined}`],
              ["🛵", `Последний заказ: ${user.lastOrder}`],
            ].map(([icon, text]) => (
              <p key={text} className="text-xs" style={{ color: "var(--fg-sub)" }}><span>{icon}</span> {text}</p>
            ))}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Заказов",  value: user.orders, icon: "📦", color: "#f97316" },
              { label: "Потрачено", value: `${user.spent.toLocaleString()} сом`, icon: "💰", color: "#22c55e" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "var(--bg-section)" }}>
                <p className="text-lg">{icon}</p>
                <p className="font-black text-sm mt-1" style={{ color }}>{value}</p>
                <p className="text-[10px]" style={{ color: "var(--fg-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Block/Unblock */}
          {user.role !== "admin" && (
            <button onClick={onToggleBlock}
              className="h-10 rounded-xl text-sm font-bold transition-all"
              style={{ background: user.status === "blocked" ? "#e8fdf0" : "#fff0f0", color: user.status === "blocked" ? "#22c55e" : "#ef4444" }}>
              {user.status === "blocked" ? "✓ Разблокировать" : "✗ Заблокировать"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers]   = useState<AppUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [selected, setSelected]     = useState<AppUser | null>(null);

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  function toggleBlock(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u));
    setSelected(prev => prev?.id === id ? { ...prev, status: prev.status === "blocked" ? "active" : "blocked" } : prev);
  }

  const totalSpent  = users.reduce((s, u) => s + u.spent, 0);
  const totalOrders = users.reduce((s, u) => s + u.orders, 0);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Пользователи</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>{users.length} зарегистрированных</p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Всего",       value: users.length,              icon: <Users className="w-5 h-5" />,       color: "#a78bfa", bg: "#f3f0ff" },
          { label: "Заказов",     value: totalOrders,               icon: <ShoppingBag className="w-5 h-5" />, color: "#f97316", bg: "#fff4ec" },
          { label: "Выручка",     value: `${(totalSpent / 1000).toFixed(0)}k сом`, icon: <TrendingUp className="w-5 h-5" />, color: "#22c55e", bg: "#e8fdf0" },
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

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        {/* Toolbar */}
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, телефону..."
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }} />
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
            {(["all", "user", "admin"] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 h-9 text-xs font-bold transition-all"
                style={{ background: roleFilter === r ? "var(--brand)" : "transparent", color: roleFilter === r ? "#fff" : "var(--fg-muted)" }}>
                {r === "all" ? "Все" : r === "user" ? "Клиенты" : "Админы"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Пользователь", "Контакт", "Роль", "Заказов", "Сумма", "Последний заказ", "Статус", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: user.role === "admin" ? "var(--brand)" : "#a78bfa" }}>
                        {user.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold text-sm whitespace-nowrap" style={{ color: "var(--fg)" }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs" style={{ color: "var(--fg-sub)" }}>{user.email}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--fg-muted)" }}>{user.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: user.role === "admin" ? "var(--brand-light)" : "#f3f0ff", color: user.role === "admin" ? "var(--brand)" : "#a78bfa" }}>
                      {user.role === "admin" ? "Админ" : "Клиент"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-center" style={{ color: "var(--fg)" }}>{user.orders}</td>
                  <td className="px-4 py-3.5 font-black whitespace-nowrap" style={{ color: "var(--fg)" }}>{user.spent.toLocaleString()} сом</td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--fg-muted)" }}>{user.lastOrder}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: user.status === "active" ? "#e8fdf0" : "#fff0f0", color: user.status === "active" ? "#22c55e" : "#ef4444" }}>
                      {user.status === "active" ? "Активен" : "Блок"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setSelected(user)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ color: "var(--fg-muted)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <UserModal user={selected} onClose={() => setSelected(null)} onToggleBlock={() => toggleBlock(selected.id)} />
      )}
    </div>
  );
}
