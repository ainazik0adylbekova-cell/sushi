"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  ShoppingCart, Menu, X, Sun, Moon,
  User, LogOut, Settings, ClipboardList, ChevronDown,
} from "lucide-react";
import { useLang, type Lang } from "../../providers/LanguageProvider";
import { useCart } from "../../providers/CartProvider";
import { useAuth } from "../../providers/AuthProvider";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kg", label: "KG" },
];

export default function Header() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [langOpen,    setLangOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [mounted,     setMounted]     = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang, t }        = useLang();
  const { totalQty, openDrawer }    = useCart();
  const { user, logout }            = useAuth();
  const pathname                    = usePathname();

  const langRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langRef.current    && !langRef.current.contains(e.target as Node))    setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navLinks = [
    { label: t.navHome,     href: "/" },
    { label: t.navMenu,     href: "/menu" },
    { label: t.navAbout,    href: "/about" },
    { label: "Отзывы",      href: "/#reviews" },
    { label: t.navContacts, href: "/contacts" },
  ];

  const initials = user
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";
  const avatarSrc = (user as ({ avatar?: string } & typeof user) | null)?.avatar ?? null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "var(--header-bg)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 select-none">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <circle cx="17" cy="17" r="15" stroke="var(--brand)" strokeWidth="2.5"/>
            <line x1="8" y1="27" x2="24" y2="7" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="7" r="2" fill="#2a2a2a"/>
            <line x1="11" y1="29" x2="27" y2="9" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="27" cy="9" r="2" fill="#2a2a2a"/>
            <circle cx="17" cy="18" r="7" fill="#f0ede6"/>
            <circle cx="17" cy="18" r="4.5" fill="var(--brand)"/>
            <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c"/>
          </svg>
          <span className="font-black text-base tracking-tight hidden sm:block" style={{ color: "var(--fg)" }}>
            Суши<span style={{ color: "var(--brand)" }}>Жейм</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" aria-label="Навигация">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap"
              style={{
                color:      isActive(link.href) ? "var(--brand)" : "var(--fg-sub)",
                background: isActive(link.href) ? "var(--brand-light)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  (e.currentTarget as HTMLElement).style.color = "var(--brand)";
                  (e.currentTarget as HTMLElement).style.background = "var(--brand-light)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  (e.currentTarget as HTMLElement).style.color = "var(--fg-sub)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Language switcher */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
              className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-bold transition-colors"
              style={{ color: "var(--fg-muted)" }}
              aria-label="Язык"
              aria-expanded={langOpen}
            >
              <span>{lang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: langOpen ? "rotate(180deg)" : "none" }} />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] rounded-xl overflow-hidden border z-50 animate-slide-down"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  minWidth: "80px",
                }}
              >
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className="w-full h-9 px-3 text-xs font-bold flex items-center justify-center transition-colors"
                    style={{
                      color:      lang === l.code ? "var(--brand)"       : "var(--fg-sub)",
                      background: lang === l.code ? "var(--brand-light)" : "transparent",
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--brand)"; (e.currentTarget as HTMLElement).style.background = "var(--brand-light)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            aria-label="Тема"
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart button — NO separate Order button */}
          <button
            onClick={openDrawer}
            className="relative flex items-center gap-1.5 h-9 px-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: totalQty > 0 ? "var(--brand)" : "var(--bg-section)",
              color:      totalQty > 0 ? "#fff" : "var(--fg-sub)",
              border:     totalQty > 0 ? "none" : "1.5px solid var(--border)",
            }}
            aria-label={`Корзина${totalQty > 0 ? `, ${totalQty} товаров` : ""}`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:block text-[13px]">
              {totalQty > 0 ? `${totalQty}` : "Корзина"}
            </span>
            {totalQty > 0 && (
              <span
                className="sm:hidden absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-black text-white px-1"
                style={{ background: "var(--brand)" }}
              >
                {totalQty > 99 ? "99+" : totalQty}
              </span>
            )}
          </button>

          {/* Profile / Auth */}
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
                className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-xl transition-colors"
                style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
                aria-label="Профиль"
                aria-expanded={profileOpen}
              >
                {/* Avatar */}
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
                    style={{ background: "var(--brand)" }}
                  >
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-bold max-w-[80px] truncate" style={{ color: "var(--fg)" }}>
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3" style={{ color: "var(--fg-muted)", transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+6px)] rounded-xl overflow-hidden border z-50 w-48 animate-slide-down"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                >
                  {/* User info */}
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <p className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--fg-muted)" }}>{user.email}</p>
                  </div>

                  {[
                    { icon: User,          label: "Мой профиль",   href: "/profile" },
                    { icon: ClipboardList, label: "Мои заказы",    href: "/profile?tab=orders" },
                    { icon: Settings,      label: "Настройки",     href: "/profile?tab=settings" },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 h-10 px-4 text-sm font-medium transition-colors"
                      style={{ color: "var(--fg-sub)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-section)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--fg-sub)"; }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-3 w-full h-10 px-4 text-sm font-medium transition-colors"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ef444410"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t.navLogout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-bold transition-colors"
              style={{ border: "1.5px solid var(--border)", color: "var(--fg-sub)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)"; (e.currentTarget as HTMLElement).style.color = "var(--brand)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--fg-sub)"; }}
            >
              <User className="w-3.5 h-3.5" />
              {t.navLogin}
            </Link>
          )}

          {/* Burger */}
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg ml-0.5 transition-colors"
            style={{ color: "var(--fg-sub)" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Закрыть" : "Меню"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="lg:hidden border-t animate-slide-down"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-3 text-sm font-semibold rounded-lg transition-colors"
                style={{ color: isActive(link.href) ? "var(--brand)" : "var(--fg)", background: isActive(link.href) ? "var(--brand-light)" : "transparent" }}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: "1px solid var(--border)", marginTop: "4px", paddingTop: "8px" }}>
              {user ? (
                <div className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: "var(--brand)" }}>
                        {initials}
                      </div>
                    )}
                    <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{user.name}</span>
                  </div>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="text-sm font-bold flex items-center gap-1" style={{ color: "#ef4444" }}>
                    <LogOut className="w-4 h-4" /> Выйти
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg"
                  style={{ color: "var(--fg)" }}
                >
                  <User className="w-4 h-4" /> {t.navLogin}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
