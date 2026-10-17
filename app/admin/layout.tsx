"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, FolderOpen,
  Users, Star, Tag, Send, Settings, LogOut,
  Menu, X, ChevronRight, Bell, Moon, Sun,
} from "lucide-react";

// ── Переводы RU / KG ──────────────────────────────────────────────────────
const LABELS = {
  ru: {
    dashboard: "Дашборд", orders: "Заказы", menu: "Меню",
    categories: "Категории", users: "Пользователи", reviews: "Отзывы",
    promos: "Промокоды", telegram: "Telegram", settings: "Настройки",
    logout: "Выйти", admin: "Админ",
  },
  kg: {
    dashboard: "Башкы бет", orders: "Буйрутмалар", menu: "Меню",
    categories: "Категориялар", users: "Колдонуучулар", reviews: "Пикирлер",
    promos: "Промокодлор", telegram: "Telegram", settings: "Жөндөөлөр",
    logout: "Чыгуу", admin: "Админ",
  },
} as const;

type Lang = "ru" | "kg";

function useLang() {
  const [lang, setL] = useState<Lang>("ru");
  useEffect(() => {
    const s = localStorage.getItem("admin_lang") as Lang | null;
    if (s === "ru" || s === "kg") setL(s);
  }, []);
  const setLang = (l: Lang) => { setL(l); localStorage.setItem("admin_lang", l); };
  return { lang, setLang, t: LABELS[lang] };
}

// ── Theme Hook ────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setT] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    const saved = localStorage.getItem("admin_theme") as "light" | "dark" | null;
    const initialTheme = saved || "light";
    setT(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setT(newTheme);
    localStorage.setItem("admin_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };
  
  return { theme, toggleTheme };
}

// ── NAV ───────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/admin/dashboard",  icon: LayoutDashboard, key: "dashboard"  as const, badge: null },
  { href: "/admin/orders",     icon: ShoppingBag,     key: "orders"     as const, badge: "3"  },
  { href: "/admin/menu",       icon: UtensilsCrossed, key: "menu"       as const, badge: null },
  { href: "/admin/categories", icon: FolderOpen,      key: "categories" as const, badge: null },
  { href: "/admin/users",      icon: Users,           key: "users"      as const, badge: null },
  { href: "/admin/reviews",    icon: Star,            key: "reviews"    as const, badge: "2"  },
  { href: "/admin/promos",     icon: Tag,             key: "promos"     as const, badge: null },
  { href: "/admin/telegram",   icon: Send,            key: "telegram"   as const, badge: null },
  { href: "/admin/settings",   icon: Settings,        key: "settings"   as const, badge: null },
];

// ── NavLink ────────────────────────────────────────────────────────────────
function NavLink({
  item,
  label,
  collapsed,
  onClick,
}: {
  item: typeof NAV[0];
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group"
      style={{ background: active ? "var(--brand)" : "transparent", color: active ? "#fff" : "var(--fg-sub)" }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; (e.currentTarget as HTMLElement).style.color = "var(--fg)"; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-sub)"; } }}
    >
      <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span className="flex-1 whitespace-nowrap">{label}</span>
          {item.badge && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
              style={{ background: active ? "rgba(255,255,255,0.25)" : "var(--brand)", color: "#fff" }}>
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
          style={{ background: "var(--fg)", color: "var(--bg)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          {label}
        </div>
      )}
    </Link>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, onClose, mobile = false, labels }: {
  collapsed: boolean; onToggle: () => void; onClose?: () => void;
  mobile?: boolean; labels: Record<keyof typeof LABELS["ru"], string>;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="admin-sidebar flex flex-col h-full" style={{ width: mobile ? 260 : collapsed ? 64 : 240, transition: "width 0.25s ease", flexShrink: 0 }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4" style={{ borderBottom: "1.5px solid rgba(249, 115, 22, 0.15)", minHeight: 64 }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--brand-light)" }}>
          <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="15" stroke="var(--brand)" strokeWidth="2.5"/>
            <line x1="8" y1="27" x2="24" y2="7" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="7" r="2" fill="#2a2a2a"/>
            <line x1="11" y1="29" x2="27" y2="9" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="27" cy="9" r="2" fill="#2a2a2a"/>
            <circle cx="17" cy="18" r="7" fill="#f0ede6"/>
            <circle cx="17" cy="18" r="4.5" fill="var(--brand)"/>
            <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c"/>
          </svg>
        </div>
        {(!collapsed || mobile) && (
          <div className="overflow-hidden">
            <p className="font-black text-sm leading-tight" style={{ color: "var(--fg)" }}>Суши <span style={{ color: "var(--brand)" }}>Жейм</span></p>
            <p className="text-[10px] font-semibold" style={{ color: "var(--fg-muted)" }}>Admin Panel</p>
          </div>
        )}
        {mobile && <button onClick={onClose} className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: "var(--fg-muted)" }}><X className="w-4 h-4" /></button>}
        {!mobile && (
          <button onClick={onToggle} className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: "var(--fg-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <ChevronRight className="w-4 h-4 transition-transform duration-300" style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {NAV.map(item => (
          <NavLink key={item.href} item={item} label={labels[item.key]} collapsed={!mobile && collapsed} onClick={mobile ? onClose : undefined} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2" style={{ borderTop: "1.5px solid rgba(249, 115, 22, 0.15)" }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: "var(--fg-muted)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff0f0"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}>
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          {(!collapsed || mobile) && <span>{labels.logout}</span>}
        </button>
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    function onResize() { if (window.innerWidth >= 1024) setMobileOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (pathname === "/admin") return <>{children}</>;

  const currentNav = NAV.find(n => pathname === n.href || pathname.startsWith(n.href + "/"));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} labels={t} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300" style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <Sidebar collapsed={false} onToggle={() => {}} onClose={() => setMobileOpen(false)} mobile labels={t} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="admin-header flex items-center gap-3 px-4 sm:px-6 h-16 shrink-0">

          <button onClick={() => setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "var(--fg-muted)" }}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--fg-muted)" }}>{t.admin}</span>
            {currentNav && (
              <>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--fg-muted)" }} />
                <span className="font-bold" style={{ color: "var(--fg)" }}>{t[currentNav.key]}</span>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: "var(--fg-muted)", border: "1.5px solid var(--border)" }}
            title={theme === "light" ? "Переключить на тёмную тему" : "Переключить на светлую тему"}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Lang switcher RU / KG */}
          <div className="flex rounded-xl overflow-hidden mr-2" style={{ border: "1.5px solid var(--border)" }}>
            {(["ru", "kg"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="w-10 h-8 text-xs font-black transition-all"
                style={{ background: lang === l ? "var(--brand)" : "transparent", color: lang === l ? "#fff" : "var(--fg-muted)" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "var(--fg-muted)" }}>
            <Bell style={{ width: 18, height: 18 }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--brand)" }} />
          </button>

          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "var(--brand)" }}>A</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
