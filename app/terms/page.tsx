"use client";

import Link from "next/link";
import { ArrowLeft, FileText, UserCheck, ShoppingCart, CreditCard, Truck, Award, AlertTriangle, Scale, Mail } from "lucide-react";

export default function TermsOfUsePage() {
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
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(67,233,123,0.3) 0%, transparent 70%)" }}
          />
          <div 
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(250,112,154,0.3) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ 
              background: "linear-gradient(135deg, rgba(67,233,123,0.2) 0%, rgba(250,112,154,0.2) 100%)",
              border: "2px solid rgba(67,233,123,0.3)"
            }}
          >
            <FileText className="w-10 h-10" style={{ color: "var(--brand)" }} />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5" style={{ color: "var(--fg)" }}>
            Условия использования
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6" style={{ color: "var(--fg-sub)" }}>
            Правила и условия работы нашего сервиса
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
            icon={UserCheck}
            title="1. Принятие условий"
            gradient="linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
          >
            <p>
              Используя наш сервис доставки суши и роллов, вы соглашаетесь с настоящими Условиями использования. Если вы не согласны с какими-либо условиями, пожалуйста, не используйте наш сервис.
            </p>
            <p className="mt-3">
              Мы оставляем за собой право изменять данные условия в любое время. Продолжение использования сервиса после внесения изменений означает ваше согласие с новыми условиями.
            </p>
          </GlassSection>

          <GlassSection 
            icon={FileText}
            title="2. Описание услуг"
            gradient="linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)"
          >
            <p>
              Мы предоставляем услуги по онлайн-заказу и доставке суши, роллов и других блюд японской кухни в городе Бишкек.
            </p>
            <p className="mt-3">
              Меню, цены и условия доставки могут изменяться без предварительного уведомления.
            </p>
          </GlassSection>

          <GlassSection 
            icon={UserCheck}
            title="3. Регистрация и аккаунт"
            gradient="linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)"
          >
            <p>Для оформления заказа может потребоваться регистрация аккаунта. Вы обязуетесь:</p>
            <ul className="mt-2">
              <li>• Предоставлять достоверную и актуальную информацию</li>
              <li>• Поддерживать безопасность своего аккаунта</li>
              <li>• Немедленно уведомлять нас о любом несанкционированном использовании</li>
              <li>• Нести ответственность за все действия, совершенные через ваш аккаунт</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={ShoppingCart}
            title="4. Оформление заказа"
            gradient="linear-gradient(135deg, #FA709A 0%, #FEE140 100%)"
          >
            <p>При оформлении заказа вы обязуетесь:</p>
            <ul className="mt-2">
              <li>• Указать точный адрес доставки и контактные данные</li>
              <li>• Быть доступным по указанному телефону во время доставки</li>
              <li>• Оплатить заказ в соответствии с выбранным способом оплаты</li>
              <li>• Принять заказ в согласованное время</li>
            </ul>
            <p className="mt-4">
              Мы оставляем за собой право отказать в выполнении заказа без объяснения причин.
            </p>
          </GlassSection>

          <GlassSection 
            icon={CreditCard}
            title="5. Цены и оплата"
            gradient="linear-gradient(135deg, #F093FB 0%, #F5576C 100%)"
          >
            <p>Все цены указаны в кыргызских сомах и включают НДС.</p>
            <p className="mt-3">Мы принимаем следующие способы оплаты:</p>
            <ul className="mt-2">
              <li>• Наличными курьеру при получении</li>
              <li>• Онлайн-оплата через Finik Pay</li>
              <li>• Другие способы согласно доступным опциям на сайте</li>
            </ul>
            <p className="mt-4">
              Цены могут быть изменены без предварительного уведомления, однако это не распространяется на уже оформленные заказы.
            </p>
          </GlassSection>

          <GlassSection 
            icon={Truck}
            title="6. Доставка"
            gradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
          >
            <p>Условия доставки:</p>
            <ul className="mt-2">
              <li>• Бесплатная доставка при заказе от 1200 сом</li>
              <li>• Стоимость доставки для заказов менее 1200 сом указана на сайте</li>
              <li>• Среднее время доставки: 40-60 минут</li>
              <li>• Доставка осуществляется по городу Бишкек</li>
            </ul>
            <p className="mt-4">
              Время доставки является приблизительным и может варьироваться в зависимости от загруженности, погодных условий и других факторов.
            </p>
          </GlassSection>

          <GlassSection 
            icon={AlertTriangle}
            title="7. Отмена заказа и возврат"
            gradient="linear-gradient(135deg, #FF6B6B 0%, #4FACFE 100%)"
          >
            <p>
              Вы можете отменить заказ бесплатно до начала его приготовления, связавшись с нами по телефону или через Telegram.
            </p>
            <p className="mt-3">
              В случае получения некачественного продукта или несоответствия заказа, свяжитесь с нами в течение 30 минут после получения. Мы рассмотрим вашу претензию и предложим решение (замена блюда, возврат средств или компенсация).
            </p>
          </GlassSection>

          <GlassSection 
            icon={Award}
            title="8. Качество продукции"
            gradient="linear-gradient(135deg, #43E97B 0%, #FA709A 100%)"
          >
            <p>Мы гарантируем:</p>
            <ul className="mt-2">
              <li>• Использование свежих и качественных ингредиентов</li>
              <li>• Соблюдение санитарных норм при приготовлении</li>
              <li>• Правильное хранение и транспортировку блюд</li>
              <li>• Соответствие блюд описанию в меню</li>
            </ul>
          </GlassSection>

          <GlassSection 
            icon={AlertTriangle}
            title="9. Ответственность"
            gradient="linear-gradient(135deg, #F093FB 0%, #667EEA 100%)"
          >
            <p>Мы не несем ответственности за:</p>
            <ul className="mt-2">
              <li>• Задержки доставки, вызванные обстоятельствами непреодолимой силы</li>
              <li>• Некорректный адрес или контактные данные, указанные клиентом</li>
              <li>• Недоступность клиента по указанному телефону</li>
              <li>• Индивидуальные аллергические реакции на ингредиенты</li>
            </ul>
            <p className="mt-4">
              Клиент несет ответственность за правильность указанной информации при заказе.
            </p>
          </GlassSection>

          <GlassSection 
            icon={Scale}
            title="10. Применимое право"
            gradient="linear-gradient(135deg, #FF6B6B 0%, #43E97B 100%)"
          >
            <p>
              Настоящие Условия регулируются законодательством Кыргызской Республики. Все споры разрешаются путем переговоров, а при невозможности достижения согласия — в судебном порядке в соответствии с законодательством КР.
            </p>
            <p className="mt-3">
              Конфиденциальность данных регулируется нашей{" "}
              <Link 
                href="/privacy" 
                className="font-bold transition-opacity hover:opacity-70"
                style={{ color: "var(--brand)", textDecoration: "underline" }}
              >
                Политикой конфиденциальности
              </Link>
              .
            </p>
          </GlassSection>

          <GlassSection 
            icon={Mail}
            title="11. Контактная информация"
            gradient="linear-gradient(135deg, #4FACFE 0%, #F093FB 100%)"
          >
            <p>По всем вопросам, связанным с использованием сервиса, обращайтесь:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <ContactCard label="Telegram" value="@syshi_kg" />
              <ContactCard label="Телефон" value="+996 (700) 123-456" />
              <ContactCard label="Email" value="info@syshi.kg" />
              <ContactCard label="Адрес" value="г. Бишкек, Кыргызстан" />
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
