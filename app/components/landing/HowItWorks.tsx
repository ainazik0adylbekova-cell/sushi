"use client";

import { UtensilsCrossed, MapPin, CreditCard, PackageCheck } from "lucide-react";
import { useLang } from "../../providers/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { icon: UtensilsCrossed, title: t.step1Title, desc: t.step1Desc },
    { icon: MapPin,          title: t.step2Title, desc: t.step2Desc },
    { icon: CreditCard,      title: t.step3Title, desc: t.step3Desc },
    { icon: PackageCheck,    title: t.step4Title, desc: t.step4Desc },
  ];

  return (
    <section id="how" className="py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
            {t.howSubtitle}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: "var(--fg)" }}>
            {t.howTitle}
          </h2>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>{t.howDesc}</p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {/* Connector */}
          <div
            className="hidden lg:block absolute top-10 left-[calc(12.5%+2.5rem)] right-[calc(12.5%+2.5rem)] h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--brand) 20%, var(--brand) 80%, transparent)",
              opacity: 0.25,
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center text-center gap-5">
                {/* Circle */}
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--bg-card)",
                      border: "2px solid var(--border)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: "var(--brand)" }} />
                  </div>
                  {/* Number badge */}
                  <div
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                    style={{ background: "var(--brand)" }}
                  >
                    {i + 1}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base mb-1.5" style={{ color: "var(--fg)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
