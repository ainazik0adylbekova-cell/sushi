"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Globe, Bell, Shield, Palette, Store, Phone } from "lucide-react";

type Tab = "general" | "notifications" | "security" | "appearance";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{sub}</p>}
      </div>
      <button onClick={onChange}
        className="w-11 h-6 rounded-full transition-all shrink-0 relative ml-4"
        style={{ background: value ? "var(--brand)" : "var(--border)" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: value ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  // General
  const [general, setGeneral] = useState({
    siteName:    "Суши Жейм",
    siteUrl:     "https://syshi.kg",
    phone:       "+996 312 123 456",
    address:     "г. Бишкек, ул. Чуй 150",
    email:       "info@syshi.kg",
    currency:    "сом",
    language:    "ru",
    minOrder:    "500",
    description: "Свежие суши, роллы и паназиатская кухня с доставкой по Бишкеку",
  });

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailNewOrder:    true,
    emailDailyReport: false,
    smsNewOrder:      false,
    browserPush:      true,
    soundAlert:       true,
  });

  // Security
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [twoFactor, setTwoFactor]         = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");

  // Appearance
  const [appearance, setAppearance] = useState({
    primaryColor:  "#f97316",
    accentColor:   "#000000",
    logoText:      "Суши Жейм",
    showSushiDecor: true,
    compactSidebar: false,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "general",       icon: Store,   label: "Основные"     },
    { id: "notifications", icon: Bell,    label: "Уведомления"  },
    { id: "security",      icon: Shield,  label: "Безопасность" },
    { id: "appearance",    icon: Palette, label: "Внешний вид"  },
  ];

  const inputClass = "w-full h-10 px-3 rounded-xl text-sm outline-none";
  const inputStyle = { background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" };

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Настройки</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>Конфигурация сайта и панели управления</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: saved ? "#22c55e" : "var(--brand)" }}>
          {saved ? <><Check className="w-4 h-4" /> Сохранено!</> : "Сохранить"}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all"
            style={{ background: activeTab === id ? "var(--brand)" : "transparent", color: activeTab === id ? "#fff" : "var(--fg-muted)" }}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {activeTab === "general" && (
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
          <h3 className="font-black text-sm flex items-center gap-2" style={{ color: "var(--fg)" }}>
            <Store className="w-4 h-4" style={{ color: "var(--brand)" }} /> Информация о ресторане
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Название ресторана">
              <input className={inputClass} style={inputStyle} value={general.siteName}
                onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} />
            </Field>
            <Field label="Сайт">
              <input className={inputClass} style={inputStyle} value={general.siteUrl}
                onChange={e => setGeneral(g => ({ ...g, siteUrl: e.target.value }))} />
            </Field>
            <Field label="Телефон">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
                <input className={`${inputClass} pl-9`} style={inputStyle} value={general.phone}
                  onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} />
              </div>
            </Field>
            <Field label="Email">
              <input type="email" className={inputClass} style={inputStyle} value={general.email}
                onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} />
            </Field>
            <Field label="Адрес">
              <input className={inputClass} style={inputStyle} value={general.address}
                onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} />
            </Field>
            <Field label="Мин. сумма заказа (сом)">
              <input type="number" className={inputClass} style={inputStyle} value={general.minOrder}
                onChange={e => setGeneral(g => ({ ...g, minOrder: e.target.value }))} min={0} />
            </Field>
            <Field label="Валюта">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-muted)" }} />
                <select className={`${inputClass} pl-9 appearance-none`} style={inputStyle}
                  value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}>
                  <option value="сом">Сом (KGS)</option>
                  <option value="$">Доллар (USD)</option>
                  <option value="₽">Рубль (RUB)</option>
                </select>
              </div>
            </Field>
            <Field label="Язык">
              <select className={`${inputClass} appearance-none`} style={inputStyle}
                value={general.language} onChange={e => setGeneral(g => ({ ...g, language: e.target.value }))}>
                <option value="ru">Русский</option>
                <option value="ky">Кыргызча</option>
                <option value="en">English</option>
              </select>
            </Field>
          </div>
          <Field label="Описание ресторана">
            <textarea rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={inputStyle} value={general.description}
              onChange={e => setGeneral(g => ({ ...g, description: e.target.value }))} />
          </Field>
        </div>
      )}

      {/* ── Notifications ── */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
          <h3 className="font-black text-sm mb-4 flex items-center gap-2" style={{ color: "var(--fg)" }}>
            <Bell className="w-4 h-4" style={{ color: "var(--brand)" }} /> Настройки уведомлений
          </h3>
          <Toggle value={notifSettings.emailNewOrder}    onChange={() => setNotifSettings(n => ({ ...n, emailNewOrder:    !n.emailNewOrder }))}    label="Email при новом заказе"       sub="Получать письмо на info@syshi.kg при каждом заказе" />
          <Toggle value={notifSettings.emailDailyReport} onChange={() => setNotifSettings(n => ({ ...n, emailDailyReport: !n.emailDailyReport }))} label="Ежедневный отчёт на email"     sub="Сводка за день — приходит каждое утро в 09:00" />
          <Toggle value={notifSettings.smsNewOrder}      onChange={() => setNotifSettings(n => ({ ...n, smsNewOrder:      !n.smsNewOrder }))}      label="SMS при новом заказе"         sub="Требует подключения SMS-провайдера" />
          <Toggle value={notifSettings.browserPush}      onChange={() => setNotifSettings(n => ({ ...n, browserPush:      !n.browserPush }))}      label="Push-уведомления в браузере"  sub="Всплывающие уведомления при открытой панели" />
          <Toggle value={notifSettings.soundAlert}       onChange={() => setNotifSettings(n => ({ ...n, soundAlert:       !n.soundAlert }))}       label="Звуковой сигнал"              sub="Звук при поступлении нового заказа" />
        </div>
      )}

      {/* ── Security ── */}
      {activeTab === "security" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <h3 className="font-black text-sm flex items-center gap-2" style={{ color: "var(--fg)" }}>
              <Shield className="w-4 h-4" style={{ color: "var(--brand)" }} /> Смена пароля
            </h3>
            {([
              { key: "current" as const, label: "Текущий пароль",   placeholder: "Введите текущий пароль" },
              { key: "new"     as const, label: "Новый пароль",      placeholder: "Минимум 8 символов"     },
              { key: "confirm" as const, label: "Подтвердить пароль",placeholder: "Повторите новый пароль" },
            ]).map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <input type={showPasswords[key] ? "text" : "password"}
                    value={security[`${key}Password` as keyof typeof security]}
                    onChange={e => setSecurity(s => ({ ...s, [`${key}Password`]: e.target.value }))}
                    placeholder={placeholder}
                    className={`${inputClass} pr-10`} style={inputStyle} />
                  <button type="button" onClick={() => setShowPasswords(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }}>
                    {showPasswords[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            ))}
            <button onClick={handleSave}
              className="h-10 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--brand)" }}>
              Изменить пароль
            </button>
          </div>

          <div className="rounded-2xl p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
            <h3 className="font-black text-sm mb-4 flex items-center gap-2" style={{ color: "var(--fg)" }}>
              <Shield className="w-4 h-4" style={{ color: "var(--brand)" }} /> Доступ и сессии
            </h3>
            <Toggle value={twoFactor} onChange={() => setTwoFactor(t => !t)}
              label="Двухфакторная аутентификация" sub="Подтверждение входа через Telegram или SMS" />
            <div className="pt-4">
              <Field label="Таймаут сессии (минуты)">
                <select className={`${inputClass} appearance-none`} style={inputStyle}
                  value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
                  {["15", "30", "60", "120", "240"].map(v => (
                    <option key={v} value={v}>{v === "240" ? "4 часа" : `${v} мин`}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* ── Appearance ── */}
      {activeTab === "appearance" && (
        <div className="rounded-2xl p-5 flex flex-col gap-5" style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
          <h3 className="font-black text-sm flex items-center gap-2" style={{ color: "var(--fg)" }}>
            <Palette className="w-4 h-4" style={{ color: "var(--brand)" }} /> Оформление панели
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Текст логотипа">
              <input className={inputClass} style={inputStyle} value={appearance.logoText}
                onChange={e => setAppearance(a => ({ ...a, logoText: e.target.value }))} />
            </Field>
            <Field label="Основной цвет (акцент)">
              <div className="flex items-center gap-3">
                <input type="color" value={appearance.primaryColor}
                  onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
                  style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }} />
                <input className={inputClass} style={{ ...inputStyle, flex: 1 }} value={appearance.primaryColor}
                  onChange={e => setAppearance(a => ({ ...a, primaryColor: e.target.value }))} />
              </div>
            </Field>
          </div>

          {/* Quick color presets */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide mb-2" style={{ color: "var(--fg-muted)" }}>
              Быстрые цвета
            </p>
            <div className="flex gap-2">
              {["#f97316","#ef4444","#22c55e","#3b82f6","#a78bfa","#ec4899"].map(c => (
                <button key={c} onClick={() => setAppearance(a => ({ ...a, primaryColor: c }))}
                  className="w-8 h-8 rounded-xl transition-transform"
                  style={{ background: c, transform: appearance.primaryColor === c ? "scale(1.15)" : "scale(1)", boxShadow: appearance.primaryColor === c ? `0 0 0 3px ${c}40` : "none" }}>
                  {appearance.primaryColor === c && <Check className="w-4 h-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview badge */}
          <div className="rounded-xl p-4" style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)" }}>
            <p className="text-[10px] font-black uppercase tracking-wide mb-3" style={{ color: "var(--fg-muted)" }}>Превью</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: appearance.primaryColor, color: "#fff" }}>🍣</div>
              <span className="font-black text-sm" style={{ color: "var(--fg)" }}>
                Суши<span style={{ color: appearance.primaryColor }}>Жейм</span>
              </span>
              <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-md text-white"
                style={{ background: appearance.primaryColor }}>ADMIN</span>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-8 px-3 rounded-xl flex items-center text-xs font-bold text-white"
                style={{ background: appearance.primaryColor }}>Кнопка</div>
              <div className="h-8 px-3 rounded-xl flex items-center text-xs font-bold"
                style={{ background: `${appearance.primaryColor}18`, color: appearance.primaryColor }}>Акцент</div>
            </div>
          </div>

          <div className="flex flex-col" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <Toggle value={appearance.showSushiDecor}
              onChange={() => setAppearance(a => ({ ...a, showSushiDecor: !a.showSushiDecor }))}
              label="Декоративные emoji суши" sub="Показывать иконки суши в меню и карточках" />
            <Toggle value={appearance.compactSidebar}
              onChange={() => setAppearance(a => ({ ...a, compactSidebar: !a.compactSidebar }))}
              label="Компактное боковое меню" sub="Сворачивать меню до иконок (сохранится после перезагрузки)" />
          </div>
        </div>
      )}
    </div>
  );
}
