"use client";

import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { BRANCHES } from "@/lib/branches";

export default function Branches() {
  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--bg-section)" }}>
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Заголовок */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
            Суши Жейм
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--fg)" }}>
            Наши филиалы
          </h2>
          <p className="text-base" style={{ color: "var(--fg-sub)" }}>
            {BRANCHES.length} ресторанов по всему Бишкеку
          </p>
        </div>

        {/* Сетка филиалов */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BRANCHES.map((branch) => (
            <div
              key={branch.id}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                border: "1.5px solid var(--border)",
                boxShadow: "var(--card-shadow)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(249,115,22,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--card-shadow)";
              }}
            >
              {/* Заголовок */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-black mb-1" style={{ color: "var(--fg)" }}>
                    {branch.name}
                  </h3>
                  {branch.isMain && (
                    <span
                      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#f9731618", color: "var(--brand)" }}
                    >
                      Главный
                    </span>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#f9731618", color: "var(--brand)" }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
              </div>

              {/* Адрес */}
              <div className="mb-4">
                {branch.hasRealAddress && branch.address ? (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg-sub)" }}>
                    {branch.address}
                  </p>
                ) : (
                  <div
                    className="px-3 py-2 rounded-lg text-xs font-medium"
                    style={{ background: "#ef444418", color: "#ef4444" }}
                  >
                    Адрес скоро появится
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="space-y-2 mb-4">
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-muted)" }} />
                    <a
                      href={`tel:${branch.phone.replace(/\s/g, "")}`}
                      className="text-xs font-medium transition-colors"
                      style={{ color: "var(--fg-sub)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-sub)")}
                    >
                      {branch.phone}
                    </a>
                  </div>
                )}
                {branch.workingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--fg-muted)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--fg-sub)" }}>
                      {branch.workingHours}
                    </span>
                  </div>
                )}
              </div>

              {/* Кнопка Google Maps */}
              {branch.hasRealAddress && branch.lat && branch.lng ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-bold transition-all"
                  style={{ background: "var(--brand)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть на Google Maps
                </a>
              ) : (
                <div
                  className="w-full h-10 rounded-xl flex items-center justify-center text-xs font-semibold"
                  style={{ background: "var(--bg-section)", color: "var(--fg-muted)", border: "1px solid var(--border)" }}
                >
                  Карта будет доступна позже
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
