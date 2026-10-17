"use client";

import { useState } from "react";
import { Bot, Check, X, Eye, EyeOff, Send, Bell, ShoppingBag, Star, Megaphone, Copy, RefreshCw } from "lucide-react";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export default function TelegramPage() {
  const [token, setToken]           = useState("");
  const [showToken, setShowToken]   = useState(false);
  const [status, setStatus]         = useState<ConnectionStatus>("disconnected");
  const [chatId, setChatId]         = useState("");
  const [testSent, setTestSent]     = useState(false);
  const [copied, setCopied]         = useState(false);

  const [notifs, setNotifs] = useState({
    newOrder:     true,
    orderStatus:  true,
    newReview:    false,
    lowStock:     true,
    newPromo:     false,
  });

  const WEBHOOK_URL = "https://syshi.kg/api/telegram/webhook";

  function handleConnect() {
    if (!token.trim()) return;
    setStatus("connecting");
    setTimeout(() => {
      if (token.includes(":")) {
        setStatus("connected");
      } else {
        setStatus("error");
      }
    }, 1800);
  }

  function handleDisconnect() {
    setStatus("disconnected");
    setToken("");
    setChatId("");
  }

  function handleTestMessage() {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  }

  function handleCopyWebhook() {
    navigator.clipboard.writeText(WEBHOOK_URL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusConfig: Record<ConnectionStatus, { label: string; color: string; bg: string; dot: string }> = {
    disconnected: { label: "Не подключён",   color: "#9a9a9a", bg: "var(--bg-section)", dot: "#9a9a9a" },
    connecting:   { label: "Подключение…",   color: "#f59e0b", bg: "#fef9e7",           dot: "#f59e0b" },
    connected:    { label: "Подключён",      color: "#22c55e", bg: "#e8fdf0",           dot: "#22c55e" },
    error:        { label: "Ошибка токена",  color: "#ef4444", bg: "#fff0f0",           dot: "#ef4444" },
  };
  const sc = statusConfig[status];

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-2xl">

      {/* Header */}
      <div>
        <h2 className="font-black text-xl" style={{ color: "var(--fg)" }}>Telegram Bot</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--fg-muted)" }}>Уведомления о заказах прямо в Telegram</p>
      </div>

      {/* Status banner */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: sc.bg, border: `1.5px solid ${sc.dot}40` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: status === "connected" ? "#22c55e" : "var(--bg-card)" }}>
          <Bot className="w-6 h-6" style={{ color: status === "connected" ? "#fff" : sc.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: sc.dot, animation: status === "connecting" ? "pulse 1s infinite" : "none" }} />
            <span className="font-black text-sm" style={{ color: sc.color }}>{sc.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
            {status === "connected"
              ? "Бот работает и принимает уведомления"
              : status === "connecting"
              ? "Проверяем токен и подключаем бота…"
              : status === "error"
              ? "Неверный формат токена. Формат: 123456:ABC-DEF…"
              : "Введите Bot Token для подключения уведомлений"}
          </p>
        </div>
        {status === "connected" && (
          <button onClick={handleDisconnect}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold"
            style={{ background: "#fff0f0", color: "#ef4444" }}>
            <X className="w-3 h-3" /> Отключить
          </button>
        )}
      </div>

      {/* Token input */}
      <div className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>🔑 Bot Token</h3>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="1234567890:ABCDEFghijklmnopqrstuvwxyz"
              disabled={status === "connected"}
              className="w-full h-10 pl-3 pr-10 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--bg-section)", border: `1.5px solid ${status === "error" ? "#ef4444" : "var(--border)"}`, color: "var(--fg)" }}
            />
            <button type="button" onClick={() => setShowToken(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--fg-muted)" }}>
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
            Получите токен у{" "}
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer"
              className="font-bold" style={{ color: "var(--brand)" }}>
              @BotFather
            </a>{" "}
            в Telegram, выполнив команду /newbot
          </p>
        </div>

        {/* Chat ID */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wide" style={{ color: "var(--fg-muted)" }}>
            Chat ID (куда отправлять уведомления)
          </label>
          <input
            type="text"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="-1001234567890  или  @your_channel"
            disabled={status === "connected"}
            className="w-full h-10 px-3 rounded-xl text-sm outline-none font-mono"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg)" }}
          />
          <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
            ID вашего Telegram-чата или канала. Узнать ID можно через @userinfobot
          </p>
        </div>

        {status !== "connected" && (
          <button onClick={handleConnect} disabled={!token.trim() || status === "connecting"}
            className="flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: "var(--brand)", opacity: (!token.trim() || status === "connecting") ? 0.6 : 1 }}>
            {status === "connecting"
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Подключение…</>
              : <><Bot className="w-4 h-4" /> Подключить бота</>}
          </button>
        )}
      </div>

      {/* Webhook */}
      <div className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>🔗 Webhook URL</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 h-10 px-3 rounded-xl text-xs flex items-center font-mono"
            style={{ background: "var(--bg-section)", border: "1.5px solid var(--border)", color: "var(--fg-muted)" }}>
            {WEBHOOK_URL}
          </code>
          <button onClick={handleCopyWebhook}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{ background: copied ? "#e8fdf0" : "var(--bg-section)", color: copied ? "#22c55e" : "var(--fg-muted)", border: "1.5px solid var(--border)" }}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>
          Этот URL нужно указать как Webhook в Telegram Bot API при настройке через API вручную
        </p>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>🔔 Уведомления</h3>
        <div className="flex flex-col gap-1">
          {([
            { key: "newOrder",    icon: <ShoppingBag className="w-4 h-4" />,  label: "Новый заказ",                sub: "Мгновенное уведомление при каждом новом заказе",        color: "#f97316" },
            { key: "orderStatus", icon: <RefreshCw className="w-4 h-4" />,    label: "Изменение статуса заказа",   sub: "При переходе заказа между статусами",                    color: "#38bdf8" },
            { key: "newReview",   icon: <Star className="w-4 h-4" />,         label: "Новый отзыв",                sub: "Когда клиент оставляет отзыв на блюдо",                  color: "#f59e0b" },
            { key: "lowStock",    icon: <Bell className="w-4 h-4" />,         label: "Блюдо закончилось",          sub: "Когда позиция меню отмечается как недоступная",          color: "#ef4444" },
            { key: "newPromo",    icon: <Megaphone className="w-4 h-4" />,    label: "Новая акция активирована",   sub: "При включении новой промо-акции",                        color: "#22c55e" },
          ] as { key: keyof typeof notifs; icon: React.ReactNode; label: string; sub: string; color: string }[]).map(n => (
            <div key={n.key} className="flex items-center justify-between gap-3 py-3 px-1"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${n.color}18`, color: n.color }}>
                  {n.icon}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>{n.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>{n.sub}</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className="w-11 h-6 rounded-full transition-all shrink-0 relative"
                style={{ background: notifs[n.key] ? "var(--brand)" : "var(--border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: notifs[n.key] ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test message */}
      {status === "connected" && (
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: "var(--brand-light)", border: "1.5px solid var(--brand)40" }}>
          <div>
            <p className="font-black text-sm" style={{ color: "var(--fg)" }}>Проверить подключение</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>Отправить тестовое сообщение в указанный Chat ID</p>
          </div>
          <button onClick={handleTestMessage}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-white shrink-0 transition-all"
            style={{ background: testSent ? "#22c55e" : "var(--brand)" }}>
            {testSent ? <><Check className="w-4 h-4" /> Отправлено!</> : <><Send className="w-4 h-4" /> Отправить тест</>}
          </button>
        </div>
      )}

      {/* How-to guide */}
      <div className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)" }}>
        <h3 className="font-black text-sm" style={{ color: "var(--fg)" }}>📖 Как подключить</h3>
        <div className="flex flex-col gap-2">
          {[
            { step: "1", text: "Откройте Telegram и найдите @BotFather" },
            { step: "2", text: "Выполните команду /newbot и следуйте инструкциям" },
            { step: "3", text: "Скопируйте полученный Bot Token и вставьте выше" },
            { step: "4", text: "Узнайте ваш Chat ID через @userinfobot и введите его" },
            { step: "5", text: "Нажмите «Подключить бота» — уведомления заработают" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                style={{ background: "var(--brand)", color: "#fff" }}>
                {step}
              </span>
              <p className="text-sm" style={{ color: "var(--fg-sub)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
