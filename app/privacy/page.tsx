"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, Users, Globe, Mail, CheckCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold transition-all"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 sm:py-20" style={{ background: "var(--bg-section)" }}>
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)" }}
          />
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(79,172,254,0.3) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ 
              background: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(79,172,254,0.2) 100%)",
              border: "2px solid rgba(249,115,22,0.3)"
            }}
          >
            <Shield className="w-10 h-10" style={{ color: "var(--brand)" }} />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5" style={{ color: "var(--fg)" }}>
            Политика конфиденциальности
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6" style={{ color: "var(--fg-sub)" }}>
            Мы серьезно относимся к защите ваших персональных данных
          </p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-5 py-16">

        <div className="grid gap-6">
          <GlassSection 
            icon={FileText}
            title="1. Общие положения"
            gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
          >
            <p>
              Настоящая Политика конфиденциальности описывает, как мы собираем, используем и защищаем вашу персональную информацию при использовании нашего сервиса доставки суши и роллов.
            </p>
            <p>
              Используя наш сайт и сервисы, вы соглашаетесь с условиями данной Политики конфиденциальности.
            </p>
          </GlassSection>

          <GlassSection 
            icon={Eye}
            title="2. Какую информацию мы собираем"
            gradient="linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)"
          >
            <p>Мы можем собирать следующую информацию:</p>
            <ul>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Имя и контактные данные (телефон, email)</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Адрес доставки</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Информацию о заказах и предпочтениях</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Данные об оплате (обрабатываются через безопасные платежные системы)</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />IP-адрес и данные об использовании сайта</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={Lock}
            title="3. Как мы используем информацию"
            gradient="linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)"
          >
            <p>Мы используем собранную информацию для:</p>
            <ul>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Обработки и доставки ваших заказов</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Связи с вами по вопросам заказа</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Улучшения качества обслуживания</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Отправки информации о специальных предложениях (с вашего согласия)</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Соблюдения законодательных требований</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={Shield}
            title="4. Защита данных"
            gradient="linear-gradient(135deg, #FA709A 0%, #FEE140 100%)"
          >
            <p>
              Мы применяем современные технологии для защиты ваших персональных данных от несанкционированного доступа, изменения или уничтожения.
            </p>
            <p>
              Данные банковских карт не сохраняются на наших серверах и обрабатываются только через сертифицированные платежные системы.
            </p>
          </GlassSection>

          <GlassSection 
            icon={Users}
            title="5. Передача данных третьим лицам"
            gradient="linear-gradient(135deg, #F093FB 0%, #F5576C 100%)"
          >
            <p>
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев:
            </p>
            <ul>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Необходимости для выполнения заказа (курьерская служба)</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Требования законодательства</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Защиты наших прав и безопасности</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={Globe}
            title="6. Cookies"
            gradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
          >
            <p>
              Наш сайт использует cookies для улучшения работы сервиса и анализа посещаемости. Вы можете отключить cookies в настройках браузера, однако это может ограничить функциональность сайта.
            </p>
          </GlassSection>

          <GlassSection 
            icon={FileText}
            title="7. Ваши права"
            gradient="linear-gradient(135deg, #FF6B6B 0%, #4FACFE 100%)"
          >
            <p>Вы имеете право:</p>
            <ul>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Получить информацию о хранящихся у нас данных</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Запросить исправление неточных данных</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Запросить удаление ваших данных</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Отозвать согласие на обработку данных</li>
              <li><CheckCircle className="w-4 h-4 inline mr-2" style={{ color: "var(--brand)" }} />Отказаться от получения рекламных рассылок</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={FileText}
            title="8. Изменения в политике"
            gradient="linear-gradient(135deg, #43E97B 0%, #FA709A 100%)"
          >
            <p>
              Мы оставляем за собой право вносить изменения в данную Политику конфиденциальности. Все изменения будут опубликованы на этой странице с указанием даты последнего обновления.
            </p>
          </GlassSection>

          <GlassSection 
            icon={Mail}
            title="9. Контактная информация"
            gradient="linear-gradient(135deg, #F093FB 0%, #667EEA 100%)"
          >
            <p>
              Если у вас есть вопросы по Политике конфиденциальности или вы хотите воспользоваться своими правами, свяжитесь с нами:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <ContactCard label="Telegram" value="@syshi_kg" />
              <ContactCard label="Телефон" value="+996 (700) 123-456" />
              <ContactCard label="Email" value="info@syshi.kg" />
              <ContactCard label="Город" value="Бишкек, Кыргызстан" />
            </div>
          </GlassSection>
        </div>
      </main>
    </div>
  );
}

function GlassSection({ 
  icon: Icon, 
  title, 
  gradient, 
  children 
}: { 
  icon: any; 
  title: string; 
  gradient: string; 
  children: React.ReactNode;
}) {
  return (
    <div 
      className="glass-section"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "32px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient border */}
      <div 
        style={{
          position: "absolute",
          inset: "-2px",
          borderRadius: "24px",
          padding: "2px",
          background: gradient,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Glass overlay */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)",
          borderRadius: "24px 24px 0 0",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-4 mb-5">
          <div 
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.9,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--fg)" }}>
            {title}
          </h2>
        </div>

        <div 
          className="space-y-4 text-base leading-relaxed" 
          style={{ color: "var(--fg-sub)" }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        .glass-section {
          transition: all 0.3s ease;
        }
        .glass-section:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function ContactCard({ label, value }: { label: string; value: string }) {
  return (
    <div 
      className="p-4 rounded-xl"
      style={{
        background: "rgba(249, 115, 22, 0.1)",
        border: "1px solid rgba(249, 115, 22, 0.2)",
      }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: "var(--fg-muted)" }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>
        {value}
      </p>
    </div>
  );
}

<style jsx global>{`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  li {
    display: flex;
    align-items: center;
    line-height: 1.6;
  }

  p {
    margin-bottom: 0.75rem;
  }

  p:last-child {
    margin-bottom: 0;
  }
`}</style>
