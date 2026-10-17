"use client";

import Link from "next/link";
import { Send, Phone } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";
import { PHONE_DISPLAY, PHONE_HREF, TELEGRAM_HANDLE, TELEGRAM_HREF } from "../../providers/LanguageProvider";

export default function Footer() {
  const { t } = useLang();

  const columns = [
    {
      title: t.footerMenu,
      links: [
        { label: t.catSushi,   href: "/menu?category=sushi"   },
        { label: t.catRolls,   href: "/menu?category=rolls"   },
        { label: t.catSets,    href: "/menu?category=sets"    },
        { label: t.catHot,     href: "/menu?category=hot"     },
        { label: t.catDrinks,  href: "/menu?category=drinks"  },
      ],
    },
    {
      title: t.footerInfo,
      links: [
        { label: t.navAbout,       href: "/about"     },
        { label: "Наши филиалы",   href: "/branches"  },
        { label: t.navContacts,    href: "/contacts"  },
        { label: t.footerDelivery, href: "/delivery"  },
        { label: t.footerPrivacy,  href: "/privacy"   },
        { label: t.footerTerms,    href: "/terms"     },
      ],
    },
  ];

  return (
    <footer style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(79,172,254,0.3) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <circle cx="17" cy="17" r="15" stroke="#f97316" strokeWidth="2.5"/>
                <line x1="8" y1="27" x2="24" y2="7" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="24" cy="7" r="2" fill="currentColor"/>
                <line x1="11" y1="29" x2="27" y2="9" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="27" cy="9" r="2" fill="currentColor"/>
                <circle cx="17" cy="18" r="7" fill="#f0ede6"/>
                <circle cx="17" cy="18" r="4.5" fill="#f97316"/>
                <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c"/>
              </svg>
              <span className="font-black text-lg" style={{ color: "var(--fg)" }}>
                Суши<span style={{ color: "#f97316" }}>Жейм</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {t.footerDesc}
            </p>

            {/* Contact links */}
            <div className="flex flex-col gap-2">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {PHONE_DISPLAY}
              </a>
              <a
                href={TELEGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#38bdf8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                {TELEGRAM_HANDLE}
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold text-sm mb-5" style={{ color: "var(--fg)" }}>{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors"
                      style={{ color: "var(--fg-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f97316")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar with glassmorphism */}
      <div 
        className="relative backdrop-blur-md"
        style={{ 
          borderTop: "1px solid var(--border)",
          background: "rgba(255, 255, 255, 0.03)"
        }}
      >
        <div
          className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: "var(--fg-muted)" }}
        >
          <span>© {new Date().getFullYear()} СушиЖейм — {t.footerRights}</span>
          <span>{t.footerTagline}</span>
        </div>
      </div>
    </footer>
  );
}
