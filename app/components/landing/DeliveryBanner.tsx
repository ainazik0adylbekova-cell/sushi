"use client";

import Link from "next/link";
import { Truck, ArrowRight } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";

export default function DeliveryBanner() {
  const { t } = useLang();

  return (
    <section id="delivery" className="py-16" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12"
          style={{ background: "#0a0a0a" }}
        >
          {/* BG glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 70% 50%, rgba(249,115,22,0.25) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />

          {/* Decorative concentric rings */}
          <div
            className="absolute -right-16 -top-16 w-80 h-80 rounded-full pointer-events-none opacity-10"
            style={{ border: "40px solid #f97316" }}
            aria-hidden="true"
          />
          <div
            className="absolute -right-4 top-4 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{ border: "20px solid #f97316" }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
            {/* Text */}
            <div className="flex flex-col gap-4 max-w-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: "#fb923c" }} />
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: "#fb923c" }}>
                  {t.deliveryLabel}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {t.deliveryTitle}
                <br />
                <span style={{ color: "#f97316" }}>{t.deliveryAccent}</span>
              </h2>
              <div className="flex flex-wrap gap-5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {[t.delivMin, t.delivCost, t.delivTime].map((info) => (
                  <span key={info} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full" style={{ background: "#f97316" }} />
                    {info}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/menu"
              className="shrink-0 inline-flex items-center gap-2 px-7 rounded-xl text-white font-black text-sm transition-colors"
              style={{ background: "var(--brand)", height: "52px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
            >
              {t.makeOrder}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
