"use client";

import Link from "next/link";
import { Phone, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";
import { PHONE_DISPLAY, PHONE_HREF, TELEGRAM_HANDLE, TELEGRAM_HREF } from "../../providers/LanguageProvider";

export default function Contacts() {
  const { t } = useLang();

  return (
    <section id="contacts" className="py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* ── Left: info ── */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
                {t.contactsSubtitle}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: "var(--fg)" }}>
                {t.contactsTitle}
              </h2>
              <p className="text-base" style={{ color: "var(--fg-sub)" }}>{t.contactsDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  Icon: Phone,
                  label: t.contactPhone,
                  value: PHONE_DISPLAY,
                  href: PHONE_HREF,
                  color: "#f97316",
                },
                {
                  Icon: Send,
                  label: "Telegram",
                  value: TELEGRAM_HANDLE,
                  href: TELEGRAM_HREF,
                  color: "#38bdf8",
                },
                {
                  Icon: MapPin,
                  label: t.contactCity,
                  value: t.contactCityValue,
                  href: null,
                  color: "#ef4444",
                },
                {
                  Icon: Clock,
                  label: t.contactHours,
                  value: "10:00 — 23:00",
                  href: null,
                  color: "#22c55e",
                },
              ].map(({ Icon, label, value, href, color }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: "var(--bg-section)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--fg-muted)" }}>
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm font-bold transition-colors"
                        style={{ color: "var(--fg)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: order CTA card ── */}
          <div
            className="relative rounded-3xl overflow-hidden p-8 flex flex-col gap-6"
            style={{ background: "#0d0d0d" }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.3) 0%, transparent 60%)",
                inset: 0,
                borderRadius: "24px",
              }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-6">
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: "rgba(249,115,22,0.9)" }}>
                  {t.deliveryLabel}
                </p>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {t.deliveryTitle}
                  <br />
                  <span style={{ color: "var(--brand)" }}>{t.deliveryAccent}</span>
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                {[t.delivMin, t.delivCost, t.delivTime].map((info) => (
                  <div key={info} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--brand)" }} />
                    {info}
                  </div>
                ))}
              </div>

              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 h-12 rounded-xl text-white font-black text-sm transition-colors"
                style={{ background: "var(--brand)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
              >
                {t.makeOrder} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
