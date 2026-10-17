import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, MapPin, Phone, ArrowRight, CheckCircle } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";

export const metadata: Metadata = {
  title: "Доставка",
  description: "Условия доставки еды из ресторана «Суши Жейм» по Бишкеку. Зоны, цены, время.",
};

const ZONES = [
  { name: "Центр",  desc: "Октябрьский, Свердловский р-н",      price: "Бесплатно",  time: "30–40 мин", color: "#22c55e" },
  { name: "Север",  desc: "Асанбай, Ала-Арча, Тоголок Молдо",   price: "100 сом",    time: "40–55 мин", color: "#38bdf8" },
  { name: "Юг",     desc: "Кара-Жыгач, Аламедин-1, Восток-5",   price: "150 сом",    time: "45–60 мин", color: "#f59e0b" },
  { name: "Запад",  desc: "Сокулук, Кок-Жар, Нижний Джал",      price: "200 сом",    time: "50–70 мин", color: "#a78bfa" },
];

export default function DeliveryPage() {
  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" style={{ background: "var(--bg)" }}>

        {/* Шапка */}
        <div
          className="py-12 sm:py-16"
          style={{ background: "var(--bg-section)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="max-w-5xl mx-auto px-5 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "var(--brand-light)" }}>
              <Truck className="w-7 h-7" style={{ color: "var(--brand)" }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand)" }}>
              Доставка
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: "var(--fg)" }}>
              Условия доставки
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--fg-sub)" }}>
              Доставляем по всему Бишкеку быстро и аккуратно. Бесплатная доставка при заказе от 1 200 сом.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 py-12 flex flex-col gap-10">

          {/* Ключевые условия */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { Icon: Clock,    label: "Время доставки",   value: "40–60 минут",  color: "#f97316" },
              { Icon: Truck,    label: "Стоимость",        value: "от 0 сом",     color: "#22c55e" },
              { Icon: MapPin,   label: "Минимальный заказ", value: "600 сом",     color: "#38bdf8" },
            ].map(({ Icon, label, value, color }) => (
              <div
                key={label}
                className="flex flex-col gap-3 p-5 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--fg-muted)" }}>{label}</p>
                  <p className="font-black text-lg" style={{ color: "var(--fg)" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Зоны доставки */}
          <div>
            <h2 className="text-xl font-black mb-5" style={{ color: "var(--fg)" }}>Зоны доставки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ZONES.map((z) => (
                <div
                  key={z.name}
                  className="flex items-start gap-4 p-5 rounded-2xl"
                  style={{
                    background: "var(--bg-card)",
                    border: `1.5px solid var(--border)`,
                  }}
                >
                  <span className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ background: z.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-black text-sm" style={{ color: "var(--fg)" }}>{z.name}</p>
                      <span className="font-black text-sm" style={{ color: z.color }}>{z.price}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{z.desc}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3" style={{ color: "var(--fg-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--fg-muted)" }}>{z.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Что включено */}
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <h2 className="text-lg font-black mb-4" style={{ color: "var(--fg)" }}>
              Что важно знать
            </h2>
            <div className="flex flex-col gap-3">
              {[
                "Бесплатная доставка при заказе от 1 200 сом в зону «Центр»",
                "Горячие блюда доставляем в термосумках — еда остаётся горячей",
                "Суши и роллы упакованы так, чтобы не рассыпаться при доставке",
                "Курьер позвонит за 5 минут до приезда",
                "Оплата наличными или картой при получении",
                "Самовывоз доступен по адресу: г. Бишкек, ул. Чуй 150",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                  <p className="text-sm" style={{ color: "var(--fg-sub)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Контакт + CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              className="flex-1 flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--brand-light)" }}>
                <Phone className="w-5 h-5" style={{ color: "var(--brand)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>Звоните нам</p>
                <a href="tel:+996505255444" className="font-black text-base" style={{ color: "var(--fg)" }}>
                  +996 505 255 444
                </a>
              </div>
            </div>

            <Link
              href="/menu"
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl text-white font-black text-sm transition-all"
              style={{ background: "var(--brand)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; }}
            >
              Заказать сейчас
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
