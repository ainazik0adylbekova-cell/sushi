"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Send, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "credentials" | "code" | "success";

export default function AdminPage() {
  const router = useRouter();

  const [step, setStep]         = useState<Step>("credentials");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  /* ── Шаг 1: логин/пароль → отправить код ── */
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/send-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; bypass?: boolean };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ошибка отправки кода");
      } else if (data.bypass) {
        // Telegram не настроен — сессия уже создана, идём сразу в панель
        setStep("success");
        setTimeout(() => {
          router.push("/admin/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setStep("code");
      }
    } catch {
      setError("Сетевая ошибка. Проверь интернет.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Шаг 2: ввести код из Telegram ── */
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Код должен содержать 6 цифр");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/verify-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Неверный код");
      } else {
        setStep("success");
        setTimeout(() => {
          router.push("/admin/dashboard");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError("Сетевая ошибка. Проверь интернет.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#f8f7f4" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: "#ffffff",
          boxShadow:  "0 4px 32px rgba(0,0,0,0.10)",
          border:     "1.5px solid #f0ede6",
        }}
      >
        {/* Лого */}
        <div className="flex flex-col items-center mb-7 gap-1.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: "#fff4ec" }}
          >
            <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <circle cx="17" cy="17" r="15" stroke="#f97316" strokeWidth="2.5"/>
              <line x1="8" y1="27" x2="24" y2="7" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="24" cy="7" r="2" fill="#2a2a2a"/>
              <line x1="11" y1="29" x2="27" y2="9" stroke="#b5883a" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="27" cy="9" r="2" fill="#2a2a2a"/>
              <circle cx="17" cy="18" r="7" fill="#f0ede6"/>
              <circle cx="17" cy="18" r="4.5" fill="#f97316"/>
              <ellipse cx="19" cy="16" rx="2" ry="1.4" fill="#6ab04c"/>
            </svg>
          </div>
          <h1 className="text-xl font-black" style={{ color: "#1a1a1a" }}>
            Суши <span style={{ color: "#f97316" }}>Жейм</span>
          </h1>
          <p className="text-xs font-semibold" style={{ color: "#999" }}>
            Вход в панель администратора
          </p>
        </div>

        {/* Степпер */}
        <div className="flex items-center gap-2 mb-6">
          {/* Шаг 1 */}
          <div
            className="flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2"
            style={{
              background: step === "credentials" ? "#fff4ec" : "#f0fdf4",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{
                background: step === "credentials" ? "#f97316" : "#22c55e",
                color: "#fff",
              }}
            >
              {step !== "credentials" ? "✓" : "1"}
            </div>
            <span
              className="text-xs font-bold"
              style={{ color: step === "credentials" ? "#f97316" : "#22c55e" }}
            >
              Логин
            </span>
          </div>

          {/* Разделитель */}
          <div
            className="w-5 h-0.5 rounded-full shrink-0"
            style={{ background: step !== "credentials" ? "#22c55e" : "#e5e7eb" }}
          />

          {/* Шаг 2 */}
          <div
            className="flex items-center gap-1.5 flex-1 rounded-xl px-3 py-2"
            style={{
              background:
                step === "code"    ? "#fff4ec"
              : step === "success" ? "#f0fdf4"
              :                      "#f9fafb",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
              style={{
                background:
                  step === "code"    ? "#f97316"
                : step === "success" ? "#22c55e"
                :                      "#d1d5db",
                color: "#fff",
              }}
            >
              {step === "success" ? "✓" : "2"}
            </div>
            <span
              className="text-xs font-bold"
              style={{
                color:
                  step === "code"    ? "#f97316"
                : step === "success" ? "#22c55e"
                :                      "#9ca3af",
              }}
            >
              Telegram код
            </span>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-medium text-center"
            style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
          >
            {error}
          </div>
        )}

        {/* ── Успех ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="w-14 h-14" style={{ color: "#22c55e" }} />
            <p className="font-black text-lg" style={{ color: "#1a1a1a" }}>Добро пожаловать!</p>
            <p className="text-sm" style={{ color: "#999" }}>Перенаправляем в панель...</p>
          </div>
        )}

        {/* ── Шаг 1: email + пароль ── */}
        {step === "credentials" && (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#555" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@syshi.kg"
                autoComplete="email"
                className="h-11 px-4 rounded-xl text-sm outline-none w-full transition-all"
                style={{
                  background: "#f9fafb",
                  border:     "1.5px solid #e5e7eb",
                  color:      "#1a1a1a",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#555" }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 px-4 pr-11 rounded-xl text-sm outline-none w-full transition-all"
                  style={{
                    background: "#f9fafb",
                    border:     "1.5px solid #e5e7eb",
                    color:      "#1a1a1a",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                  aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-50"
              style={{ background: loading ? "#f97316" : "#f97316" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#ea6c0a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f97316"; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Отправляем код...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Получить код в Telegram
                </>
              )}
            </button>

            <p className="text-center text-xs" style={{ color: "#bbb" }}>
              Код придёт в бот <b>@sushi_jeim_bot</b>
            </p>
          </form>
        )}

        {/* ── Шаг 2: код из Telegram ── */}
        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            {/* Информация */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-2xl"
              style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd" }}
            >
              <span className="text-xl shrink-0">✈️</span>
              <div>
                <p className="text-sm font-bold" style={{ color: "#0369a1" }}>
                  Код отправлен в Telegram
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#0284c7" }}>
                  Открой <b>@sushi_jeim_bot</b> и введи 6 цифр. Код действует 5 минут.
                </p>
              </div>
            </div>

            {/* Поле кода */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: "#555" }}>
                Код подтверждения
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="h-14 rounded-xl text-3xl font-black text-center outline-none w-full transition-all"
                style={{
                  background:    "#f9fafb",
                  border:        "1.5px solid #e5e7eb",
                  color:         "#1a1a1a",
                  letterSpacing: "0.5em",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
              />
              {/* Прогресс-бар заполнения */}
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-200"
                    style={{ background: i < code.length ? "#f97316" : "#e5e7eb" }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="h-12 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "#f97316" }}
              onMouseEnter={(e) => { if (!loading && code.length === 6) (e.currentTarget as HTMLElement).style.background = "#ea6c0a"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f97316"; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Проверяем...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Войти в админку
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setCode(""); setError(""); }}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold py-1"
              style={{ color: "#9ca3af" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Назад
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
